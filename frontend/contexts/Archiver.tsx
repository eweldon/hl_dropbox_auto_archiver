import React, {
	createContext,
	FC,
	PropsWithChildren,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import useSearchAll from "../hooks/useSearchAll";
import useFileTransferrer from "../hooks/useFileMover";
import { join } from "../utils/join";
import getDateString from "../utils/getDateString";
import useListAll from "../hooks/useListAll";
import groupArray from "../utils/groupArray";
import { Entry } from "../types/Entry";
import batchProcess from "../utils/batchProcess";
import { useConfig } from "./Config";

interface ArchiverContextValue {
	search: () => void;
	isSearching: boolean;
	filesFound: Entry[];

	transfer: () => void;
	isTransferring: boolean;
	filesTransferred: Entry[];

	error: string;
}

const archiverContext = createContext<ArchiverContextValue>();

export const ArchiverProvider: FC<PropsWithChildren> = ({ children }) => {
	const {
		rootPath,
		archiveFilesOlderThan,
		archiveFolder,
		autoRename,
		maxFiles,
	} = useConfig().config;

	const isSearchingRef = useRef(false);
	const [isSearching, setIsSearching] = useState(isSearchingRef.current);

	const isTransferringRef = useRef(false);
	const [isTransferring, setIsTransferring] = useState(
		isTransferringRef.current
	);

	const [filesFound, setFilesFound] = useState<Entry[]>([]);
	const [filesTransferred, setTransferredFiles] = useState<Entry[]>([]);
	const [error, setError] = useState("");

	const listAll = useListAll();
	const searchAll = useSearchAll();
	const transferFiles = useFileTransferrer();

	const search = useCallback(async () => {
		if (isSearchingRef.current) return;

		isSearchingRef.current = true;
		setIsSearching(true);
		setFilesFound([]);

		try {
			const cleanRootPath = join(rootPath);
			const cleanArchiveFolder = join(archiveFolder);

			const beforeDate = new Date(Date.now() - archiveFilesOlderThan);
			const beforeQuery = `before:${getDateString(beforeDate)}`;

			const newFoundFiles = [];
			const updateNewFoundFiles = () => {
				setFilesFound(newFoundFiles.slice(0, maxFiles));
			};

			const progressCallback = (chunk: Entry[]) => {
				for (const entry of chunk) {
					if (entry.type !== "file") continue;
					if (entry.modifiedAt > beforeDate) continue;

					const pathToEntry = join(entry.path);
					if (!pathToEntry) continue;
					if (cleanRootPath && !pathToEntry.startsWith(cleanRootPath)) continue;
					if (pathToEntry.startsWith(cleanArchiveFolder)) continue;

					newFoundFiles.push(entry);
				}

				updateNewFoundFiles();
			};

			const rootEntries = await listAll({
				path: "",
				recursive: false,
			});

			const { rootFiles, folderQueue } = groupArray(
				rootEntries,
				(entry) => (entry.type === "folder" ? "folderQueue" : "rootFiles"),
				["rootFiles", "folderQueue"]
			);

			progressCallback(rootFiles);

			await batchProcess(
				folderQueue,
				async (folder, stop) => {
					await searchAll({
						path: join(folder.path),
						query: beforeQuery,
						progressCallback,
						maxFiles,
					});

					if (newFoundFiles.length >= maxFiles) {
						stop();
					}
				},
				5,
				0.1e3
			);

			console.log("batch processing finished");

			updateNewFoundFiles();
		} catch (error: Error) {
			console.error(error);
			setError(error.message);
		}

		isSearchingRef.current = false;
		setIsSearching(false);
	}, [
		archiveFilesOlderThan,
		archiveFolder,
		listAll,
		maxFiles,
		rootPath,
		searchAll,
	]);

	const transfer = useCallback(async () => {
		if (isTransferringRef.current) return;

		isTransferringRef.current = true;
		setIsTransferring(true);
		setTransferredFiles([]);

		const progressCallback = (chunk: Entry[]) => {
			setTransferredFiles((prev) => [...prev, ...chunk]);
		};

		try {
			const summary = await transferFiles({
				method: "copy",
				entries: filesFound,
				destination: archiveFolder,
				autoRename,
				progressCallback,
				check: true,
			});

			console.log("Move Summary:", summary);
		} catch (error: Error) {
			console.error(error);
			setError(error.message);
		}

		isTransferringRef.current = false;
		setIsTransferring(false);
	}, [archiveFolder, autoRename, filesFound, transferFiles]);

	const contextValue = useMemo(
		() => ({
			search,
			isSearching,
			filesFound,

			transfer,
			isTransferring,
			filesTransferred,

			error,
		}),
		[
			error,
			filesFound,
			filesTransferred,
			isSearching,
			isTransferring,
			search,
			transfer,
		]
	);

	return (
		<archiverContext.Provider value={contextValue}>
			{children}
		</archiverContext.Provider>
	);
};

export function useArchiver() {
	const context = useContext(archiverContext);

	if (!context) {
		throw new Error("useArchiver must be used within an ArchiverProvider");
	}

	return context;
}

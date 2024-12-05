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
import useFileTransferrer from "../hooks/useFileMover";
import { join } from "../utils/join";
import useListAll from "../hooks/useListAll";
import groupArray from "../utils/groupArray";
import { Entry } from "../types/Entry";
import batchProcess from "../utils/batchProcess";
import { useConfig } from "./Config";
import { TransferMethod } from "../utils/TransferMethod";

interface ArchiverContextValue {
	search: () => void;
	isSearching: boolean;
	filesProcessed: Entry[];
	filesMatched: Entry[];
	filesNotMatched: Entry[];

	transfer: (method: TransferMethod) => void;
	isTransferring: boolean;
	transferMethod: TransferMethod;
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
	const [transferMethod, setTransferMethod] = useState<TransferMethod | null>(
		null
	);

	const [filesProcessed, setFilesProcessed] = useState<Entry[]>([]);
	const [filesMatched, setFilesMatched] = useState<Entry[]>([]);
	const [filesNotMatched, setFilesNotMatched] = useState<Entry[]>([]);
	const [filesTransferred, setTransferredFiles] = useState<Entry[]>([]);
	const [error, setError] = useState("");

	const listAll = useListAll();
	// const searchAll = useSearchAll();
	const transferFiles = useFileTransferrer();

	const search = useCallback(async () => {
		if (isSearchingRef.current) return;

		isSearchingRef.current = true;
		setIsSearching(true);
		setFilesProcessed([]);
		setFilesMatched([]);
		setFilesNotMatched([]);

		try {
			const cleanRootPath = join(rootPath);
			const cleanArchiveFolder = join(archiveFolder);

			const beforeDate = new Date(Date.now() - archiveFilesOlderThan);
			// const beforeQuery = `before:${getDateString(beforeDate)}`;

			const processedFiles = [];
			const matchedFiles = [];
			const notMatchedFiles = [];

			const updateNewFoundFiles = () => {
				setFilesProcessed(Array.from(processedFiles));
				setFilesMatched(matchedFiles.slice(0, maxFiles));
				setFilesNotMatched(Array.from(notMatchedFiles));
			};

			const shouldEntryBeArchived = (entry: Entry) => {
				if (entry.type !== "file") return false;
				if (entry.modifiedAt > beforeDate) return false;

				const pathToEntry = join(entry.path);
				if (!pathToEntry) return false;
				if (cleanRootPath && !pathToEntry.startsWith(cleanRootPath)) return false;
				if (pathToEntry.startsWith(cleanArchiveFolder)) return false;

				return true;
			};

			const uploadSuitableFiles = (chunk: Entry[]) => {
				for (const entry of chunk) {
					processedFiles.push(entry);

					if (shouldEntryBeArchived(entry)) {
						matchedFiles.push(entry);
					} else {
						notMatchedFiles.push(entry);
					}
				}

				updateNewFoundFiles();

				return matchedFiles.length > maxFiles;
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

			uploadSuitableFiles(rootFiles);

			await batchProcess(
				folderQueue,
				async (folder, _, stop) => {
					if (cleanRootPath && !folder.path.startsWith(cleanRootPath)) return;

					console.log("listing folder:", folder.path);

					await listAll({
						path: join(folder.path),
						recursive: true,
						progressCallback: uploadSuitableFiles,
					});

					// await searchAll({
					// 	path: join(folder.path),
					// 	query: beforeQuery,
					// 	progressCallback,
					// 	filter: uploadSuitableFiles,
					// 	maxFiles,
					// });

					if (matchedFiles.length >= maxFiles) {
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
	}, [archiveFilesOlderThan, archiveFolder, listAll, maxFiles, rootPath]);

	const transfer = useCallback(
		async (method: TransferMethod) => {
			if (isTransferringRef.current) return;

			isTransferringRef.current = true;
			setIsTransferring(true);
			setTransferredFiles([]);
			setTransferMethod(method);

			const progressCallback = (chunk: Entry[]) => {
				setTransferredFiles((prev) => [...prev, ...chunk]);
			};

			try {
				const summary = await transferFiles({
					method,
					entries: filesMatched,
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
			setTransferMethod(null);
		},
		[archiveFolder, autoRename, filesMatched, transferFiles]
	);

	const contextValue = useMemo(
		() => ({
			search,
			isSearching,
			filesProcessed,
			filesMatched,
			filesNotMatched,

			transfer,
			isTransferring,
			transferMethod,
			filesTransferred,

			error,
		}),
		[
			error,
			filesProcessed,
			filesMatched,
			filesNotMatched,
			filesTransferred,
			isSearching,
			isTransferring,
			search,
			transfer,
			transferMethod,
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

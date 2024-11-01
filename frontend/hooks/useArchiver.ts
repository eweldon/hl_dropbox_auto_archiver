import { useCallback, useRef, useState } from "react";
import { useSettings } from "../contexts/Settings";
import useSearchAll from "./useSearchAll";
import useFileTransferrer from "./useFileMover";
import { join } from "../utils/join";
import getDateString from "../utils/getDateString";
import useListAll from "./useListAll";
import groupArray from "../utils/groupArray";
import { Entry } from "../types/Entry";

function useArchiver(maxFiles?: number) {
	const isSearchingRef = useRef(false);
	const [isSearching, setIsSearching] = useState(isSearchingRef.current);

	const isTransferringRef = useRef(false);
	const [isTransferring, setIsTransferring] = useState(
		isTransferringRef.current
	);

	const [filesFound, setFilesFound] = useState<Entry[]>([]);
	const [filesTransferred, setTransferredFiles] = useState<Entry[]>([]);
	const [error, setError] = useState("");

	const { rootPath, archiveFilesOlderThan, archiveFolder, autoRename } =
		useSettings();

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
					if (pathToEntry.startsWith(cleanArchiveFolder)) continue;
					if (!pathToEntry.startsWith(cleanRootPath)) continue;

					newFoundFiles.push(entry);
				}

				updateNewFoundFiles();
			};

			const rootEntries = await listAll({
				path: cleanRootPath || "",
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

	return {
		search,
		isSearching,
		filesFound,

		transfer,
		isTransferring,
		filesTransferred,

		error,
	};
}

export default useArchiver;

import { useCallback, useRef, useState } from "react";
import { useSettings } from "../contexts/Settings";
import useSearchAll from "./useSearchAll";
import useFileTransferrer from "./useFileMover";
import { join } from "../utils/join";
import getDateString from "../utils/getDateString";
import useListAll from "./useListAll";
import groupArray from "../utils/groupArray";
import { Entry } from "../types/Entry";

function useArchiver() {
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

			const progressCallback = (chunk: Entry[]) => {
				setFilesFound((prev) => {
					const newFoundFiles = [...prev];

					for (const entry of chunk) {
						const pathToEntry = join(entry.path);

						if (!pathToEntry || pathToEntry.startsWith(cleanArchiveFolder))
							continue;

						if (entry.type === "file") newFoundFiles.push(entry);
					}

					return newFoundFiles;
				});
			};

			const rootEntries = await listAll({
				path: cleanRootPath || "",
				recursive: false,
			});

			console.log("rootEntries:", rootEntries);

			const { rootFiles, folderQueue } = groupArray(
				rootEntries,
				(entry) => (entry.type === "folder" ? "folderQueue" : "rootFiles"),
				["rootFiles", "folderQueue"]
			);

			progressCallback(rootFiles);

			console.log("folderQueue:", folderQueue);

			for (const folder of folderQueue) {
				console.log("root folder:", folder);

				await searchAll({
					path: join(folder.path),
					query: beforeQuery,
					progressCallback,
				});
			}
		} catch (error: Error) {
			console.error(error);
			setError(error.message);
		}

		isSearchingRef.current = false;
		setIsSearching(false);
	}, [archiveFilesOlderThan, archiveFolder, listAll, rootPath, searchAll]);

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

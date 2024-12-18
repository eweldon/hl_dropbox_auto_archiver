import { useCallback } from "react";
import { useDropboxAPI } from "../contexts/DropboxAPI";
import wait from "../utils/wait";
import { Entry } from "../types/Entry";
import { ListEntry } from "../types/ListEntry";

const FILES_LIMIT_PER_REQUEST = 2e3;

interface ListFolderOptions {
	path: string;
	recursive?: boolean;
	progressCallback?: (chunk: Entry[]) => boolean | undefined | void;
}

function useListAll() {
	const { dropboxAPI } = useDropboxAPI();

	const listFolderAll = useCallback(
		async ({
			path,
			recursive,
			progressCallback,
		}: ListFolderOptions): Promise<Entry[]> => {
			const initialListFolderResponse = await dropboxAPI.listFolderFiles({
				path,
				recursive,
				limit: FILES_LIMIT_PER_REQUEST,
			});

			let { has_more: hasMore, cursor, entries } = initialListFolderResponse;
			const allEntries = entries.map(listEntryToEntry);

			let stopListing = !!progressCallback?.(entries.map(listEntryToEntry));

			while (hasMore && !stopListing) {
				await wait(1e3);
				const response = await dropboxAPI.continueListFolder(cursor, 10);

				if (!response) {
					console.warn("Weird response:", response);
					break;
				}

				const newEntries = response.entries.map(listEntryToEntry);

				stopListing = progressCallback?.(newEntries);

				hasMore = response.has_more;
				cursor = response.cursor;
				allEntries.push(...newEntries);
			}

			return allEntries;
		},
		[dropboxAPI]
	);

	return listFolderAll;
}

function listEntryToEntry(entry: ListEntry): Entry {
	return {
		id: entry.id,
		type: entry[".tag"],
		name: entry.name,
		path: entry.path_display,
		modifiedAt: entry[".tag"] === "file" && new Date(entry.server_modified),
	};
}

export default useListAll;

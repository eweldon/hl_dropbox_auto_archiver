import { useCallback } from "react";
import { useDropboxAPI } from "../contexts/DropboxAPI";
import wait from "../utils/wait";
import { Entry } from "../types/Entry";

const FILES_LIMIT_PER_REQUEST = 2e3;

interface ListFolderOptions {
	path: string;
	recursive?: boolean;
	progressCallback?: (chunk: Entry[]) => void;
}

function useListAll() {
	const dropboxAPI = useDropboxAPI();

	const listFolderAll = useCallback(
		async ({ path, recursive, progressCallback }: ListFolderOptions) => {
			const initialListFolderResponse = await dropboxAPI.listFolderFiles({
				path,
				recursive,
				limit: FILES_LIMIT_PER_REQUEST,
			});

			let { has_more: hasMore, cursor, entries } = initialListFolderResponse;

			progressCallback?.(entries);

			while (hasMore) {
				await wait(1e3);
				const response = await dropboxAPI.continueListFolder(cursor, 3);

				if (!response) {
					console.warn("Weird response:", response);
					break;
				}

				const {
					has_more: newHasMore,
					cursor: newCursor,
					entries: newEntries,
				} = response;

				progressCallback?.(newEntries);

				hasMore = newHasMore;
				cursor = newCursor;
				entries.push(...newEntries);
			}

			return entries.map(({ id, ".tag": type, name, path_display: path }) => ({
				id,
				type,
				name,
				path,
			}));
		},
		[dropboxAPI]
	);

	return listFolderAll;
}

export default useListAll;

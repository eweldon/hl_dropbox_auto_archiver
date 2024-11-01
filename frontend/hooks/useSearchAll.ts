import { useCallback } from "react";
import { useDropboxAPI } from "../contexts/DropboxAPI";
import wait from "../utils/wait";
import { Entry } from "../types/Entry";
import { MatchEntry } from "../types/MatchEntry";
import { SEARCH_LIMIT } from "../constants/search-limit";

interface SearchOptions {
	path: string;
	query: string;
	foldersOnly?: boolean;
	maxFiles?: number;
	progressCallback?: (chunk: Entry[]) => void;
}

function useSearchAll() {
	const { dropboxAPI } = useDropboxAPI();

	const searchAll = useCallback(
		async ({
			path,
			query,
			foldersOnly,
			maxFiles,
			progressCallback,
		}: SearchOptions): Entry[] => {
			maxFiles = Math.min(maxFiles ?? SEARCH_LIMIT, SEARCH_LIMIT);
			if (maxFiles <= 0) maxFiles = SEARCH_LIMIT;

			const initialSearch = await dropboxAPI.searchFiles(
				path,
				query,
				foldersOnly
			);

			let hasMore = initialSearch.hasMore;
			let cursor = initialSearch.cursor;
			const entries = initialSearch.matches.map(matchEntryToEntry);

			progressCallback?.(Array.from(entries));

			while (hasMore && entries.length < maxFiles) {
				await wait(1e3);
				const response = await dropboxAPI.continueSearch(cursor, 3);

				if (!response) {
					console.warn("Weird response:", response);
					break;
				}

				const {
					has_more: newHasMore,
					cursor: newCursor,
					matches: newMatches,
				} = response;

				const newEntries = newMatches.map(matchEntryToEntry);

				progressCallback?.(newEntries);

				hasMore = newHasMore;
				cursor = newCursor;
				entries.push(...newEntries);
			}

			return entries;
		},
		[dropboxAPI]
	);

	return searchAll;
}

function matchEntryToEntry({ metadata: { metadata } }: MatchEntry): Entry {
	return {
		id: metadata.id,
		type: metadata[".tag"],
		name: metadata.name,
		path: metadata.path_display,
		modifiedAt:
			metadata[".tag"] === "file" && new Date(metadata.server_modified),
	};
}

export default useSearchAll;

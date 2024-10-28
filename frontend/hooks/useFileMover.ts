import { useCallback } from "react";
import { useDropboxAPI } from "../contexts/DropboxAPI";
import chunkArray from "../utils/chunkArray";
import wait from "../utils/wait";
import { Entry } from "../types/Entry";

const MAX_FILES_PER_REQUEST = 1e3;

interface TransferOptions<Check extends boolean> {
	method: "move" | "copy";
	entries: Entry[];
	destination: string;
	autoRename?: boolean;
	progressCallback?: (chunk: Entry[]) => void;
	check?: Check;
}

function useFileTransferrer() {
	const dropboxAPI = useDropboxAPI();

	const transferFiles = useCallback(
		function <Check extends boolean>({
			method,
			entries,
			destination,
			autoRename,
			progressCallback,
			check,
		}: TransferOptions<Check>) {
			const chunks = chunkArray(entries, MAX_FILES_PER_REQUEST);

			const batches = chunks.map(async (chunk) => {
				await wait(1e3);

				const promise =
					method === "move"
						? dropboxAPI.batchMove(chunk, destination, autoRename)
						: dropboxAPI.batchCopy(chunk, destination, autoRename);

				const response = await promise;

				progressCallback?.(chunk);

				return response;
			});

			return Promise.all(batches).then((jobs) => {
				if (!check) return jobs;

				return Promise.all(
					jobs.map(({ async_job_id }) =>
						method === "move"
							? dropboxAPI.batchMoveCheck(async_job_id)
							: dropboxAPI.batchCopyCheck(async_job_id)
					)
				);
			});
		},
		[dropboxAPI]
	);

	return transferFiles;
}

export default useFileTransferrer;

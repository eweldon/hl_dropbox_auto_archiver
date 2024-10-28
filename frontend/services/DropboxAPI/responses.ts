import { ListEntry } from "../../types/ListEntry";
import { MatchEntry } from "../../types/MatchEntry";

export interface FilesResponse {
	has_more: boolean;
	cursor?: string;
	matches: MatchEntry[];
}

export interface EntriesResponse {
	has_more: boolean;
	cursor?: string;
	entries: ListEntry[];
}

export interface BatchTransferResponse {
	async_job_id: string;
}

interface BatchTransferSuccess {
	success: MatchMetadata;
}
interface BatchTransferFailure {
	failure: {
		".tag": "relocation_error" | "internal_error" | "too_many_write_operations";
	};
}

export interface BatchTransferCheckResponse {
	entries: (BatchTransferSuccess | BatchTransferFailure)[];
}

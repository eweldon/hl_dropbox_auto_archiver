interface Entry {
	from_path: string;
	to_path: string;
}

export interface BatchCopyParams {
	autorename: boolean;
	entries: Entry[];
}

export interface BatchMoveParams {
	allow_ownership_transfer: boolean;
	autorename: boolean;
	entries: Entry[];
}

export interface BatchTransferCheckParams {
	async_job_id: string;
}

export interface ListFolderParams {
	path: string;
	recursive?: boolean;
	limit?: number;
}

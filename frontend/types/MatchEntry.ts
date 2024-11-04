interface FileMetadata {
	".tag": "file";
	client_modified: string;
	content_hash: string;
	file_owner_team_encrypted_id: string;
	id: string;
	is_downloadable: boolean;
	name: string;
	path_display: string;
	path_lower: string;
	rev: string;
	server_modified: string;
	sharing_info: {
		modified_by: string;
		parent_shared_folder_id: string;
		read_only: boolean;
	};
	size: number;
}

interface FolderMetadata {
	".tag": "folder";
	file_owner_team_encrypted_id: string;
	id: string;
	name: string;
	path_display: string;
	path_lower: string;
	sharing_info: {
		is_parent_shared_folder_read_only: boolean;
		no_access: boolean;
		parent_shared_folder_id: string;
		read_only: boolean;
		traverse_only: boolean;
	};
}

export type EntryMetadata = FileMetadata | FolderMetadata;

export interface MatchEntry {
	highlight_spans: string[];
	match_type: {
		".tag": string;
	};
	metadata: {
		".tag": "metadata";
		metadata: EntryMetadata;
	};
}

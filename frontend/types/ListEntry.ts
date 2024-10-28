interface FolderListEntry {
	".tag": "folder";
	name: string;
	path_lower: string;
	path_display: string;
	id: string;
	shared_folder_id: string;
	sharing_info?: {
		read_only: boolean;
		shared_folder_id: string;
		traverse_only: boolean;
		no_access: boolean;
	};
}

interface FileListEntry {
	".tag": "file";
	name: string;
	path_lower: string;
	path_display: string;
	id: string;
	client_modified: string;
	server_modified: string;
	rev: string;
	size: number;
	is_downloadable: true;
	content_hash: string;
}

export type ListEntry = FolderListEntry | FileListEntry;

interface File {
	id: string;
	type: "file";
	name: string;
	path: string;
}

interface Folder {
	id: string;
	type: "folder";
	name: string;
	path: string;
}

export type Entry = File | Folder;

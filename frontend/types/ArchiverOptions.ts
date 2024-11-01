export interface ArchiverSettings {
	rootPath: string;
	archiveFilesOlderThan: number;
	archiveFolder: number;
	autoRename: number;
	maxFiles?: number;
}

import { Dispatch, SetStateAction } from "react";

export interface Config {
	rootPath: string | undefined;
	archiveFilesOlderThan: number;
	archiveFolder: string;
	autoRename: boolean;
	maxFiles: number;
}

export interface ConfigContext {
	appId: string;
	setAppId: Dispatch<SetStateAction<string>>;

	config: Config;
	updateConfig: Dispatch<SetStateAction<Config>>;
}

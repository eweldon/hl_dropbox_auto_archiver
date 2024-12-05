import React, {
	createContext,
	Dispatch,
	FC,
	PropsWithChildren,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Config, ConfigContext } from "../types/Config";
import { globalConfig } from "@airtable/blocks";

const configContext = createContext<ConfigContext>();

const defaultConfig: Config = {
	rootPath: "/",
	archiveFolder: "/Archived",
	archiveFilesOlderThan: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
	autoRename: true,
	maxFiles: 100,
};

function getAppId() {
	return globalConfig.get(["appid"]) as string | null
}

function saveAppId(appId: string) {
	return globalConfig.setAsync(["appid"], appId);
}

function getConfig(appId: string) {
	return globalConfig.get(["archiverConfigs", appId]) as Config;
}

function saveConfig(appId: string, newConfig: Config) {
	return globalConfig.setAsync(["archiverConfigs", appId], newConfig);
}

export const ConfigProvider: FC<PropsWithChildren> = ({ children }) => {
	const [appId, setAppId] = useState<string | null>(getAppId);
	const [config, setConfig] = useState(defaultConfig);

	useEffect(() => {
		saveAppId(appId)

		if (!appId) return;

		const savedConfig = getConfig(appId);
		const newConfig = { ...defaultConfig, ...savedConfig };

		setConfig(newConfig);
	}, [appId]);

	const updateConfig = useCallback<Dispatch<SetStateAction<Config>>>(
		(newConfig) => {
			setConfig((prev) => {
				newConfig =
					typeof newConfig === "function" ? newConfig(prev) : newConfig;

				saveConfig(appId, newConfig);

				return newConfig;
			});
		},
		[appId]
	);

	const contextValue = useMemo(
		(): ConfigContext => ({
			appId,
			setAppId,

			config,
			updateConfig,
		}),
		[appId, config, updateConfig]
	);

	return (
		<configContext.Provider value={contextValue}>
			{children}
		</configContext.Provider>
	);
};

export const useConfig = () => {
	const context = useContext(configContext);

	if (!context) {
		throw new Error("useConfig must be used within an ConfigContext");
	}

	return context;
};

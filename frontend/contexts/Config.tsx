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
import isEqual from "lodash/isEqual";

const configContext = createContext<ConfigContext>();

const defaultConfig: Config = {
	rootPath: "/",
	archiveFolder: "/Archived",
	archiveFilesOlderThan: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
	autoRename: true,
	maxFiles: 100,
};

function getConfig(appId: string) {
	return globalConfig.get(["archiverConfigs", appId]) as Config;
}

function saveConfig(appId: string, newConfig: Config) {
	return globalConfig.setAsync(["archiverConfigs", appId], newConfig);
}

export const ConfigProvider: FC<PropsWithChildren> = ({ children }) => {
	const [appId, setAppId] = useState<string | null>(null);
	const [config, setConfig] = useState(defaultConfig);
	const [originalConfig, setOriginalConfig] = useState(config);

	useEffect(() => {
		if (!appId) return;

		const savedConfig = getConfig(appId);
		const newConfig = { ...defaultConfig, ...savedConfig };

		setOriginalConfig(newConfig);
		setConfig(newConfig);
	}, [appId]);

	const hasChanges = useMemo(() => {
		return !isEqual(config, originalConfig);
	}, [config, originalConfig]);

	const updateConfig = useCallback<Dispatch<SetStateAction<Config>>>(
		(newConfig) => {
			setConfig((prev) => {
				return typeof newConfig === "function" ? newConfig(prev) : newConfig;
			});
		},
		[]
	);

	const saveChanges = useCallback(() => {
		saveConfig(appId, config);
		setOriginalConfig(config);
	}, [appId, config]);

	const cancelChanges = useCallback(() => {
		setConfig(originalConfig);
	}, [originalConfig]);

	const contextValue = useMemo(
		(): ConfigContext => ({
			appId,
			setAppId,

			config,
			updateConfig,

			hasChanges,
			saveChanges,
			cancelChanges,
		}),
		[appId, cancelChanges, config, hasChanges, saveChanges, updateConfig]
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
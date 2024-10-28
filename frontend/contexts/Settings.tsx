import React, {
	createContext,
	FC,
	PropsWithChildren,
	useContext,
	useMemo,
} from "react";

export interface Settings {
	rootPath: string | undefined;
	archiveFilesOlderThan: number;
	archiveFolder: string;
	autoRename: boolean;
}

const SettingsContext = createContext<{
	settings: Settings;
}>({
	settings: {
		rootPath: undefined,
	},
});

interface Props extends PropsWithChildren {
	settings: Settings;
}

export const SettingsProvider: FC<Props> = ({ settings, children }) => {
	const wrappedSettings = useMemo(() => ({ settings }), [settings]);

	return (
		<SettingsContext.Provider value={wrappedSettings}>
			{children}
		</SettingsContext.Provider>
	);
};

export const useSettings = () => {
	const context = useContext(SettingsContext);

	if (!context) {
		throw new Error("useSettings must be used within an SettingsContext");
	}

	return context.settings;
};

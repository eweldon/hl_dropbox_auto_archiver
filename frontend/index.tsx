import { SelectOptionValue } from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";
import { initializeBlock } from "@airtable/blocks/ui";
import React, { useState } from "react";
import AppSelect from "./components/AppSelect";
import ArchiverControls from "./components/ArchiverControls";
import { DropboxAPIProvider } from "./contexts/DropboxAPI";
import { Settings, SettingsProvider } from "./contexts/Settings";
import "./index.css";

const settings: Settings = {
	rootPath: "/",
	archiveFilesOlderThan: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
	archiveFolder: "/Archived",
	autoRename: true,
};

function HelloWorldTypescriptApp() {
	const [selectedAppId, setSelectedAppId] = useState<SelectOptionValue>(null);

	return (
		<div className="flex row gap padding">
			<AppSelect value={selectedAppId} onChange={setSelectedAppId} />

			<SettingsProvider settings={settings}>
				<DropboxAPIProvider appId={selectedAppId}>
					<ArchiverControls appId={selectedAppId} />
				</DropboxAPIProvider>
			</SettingsProvider>
		</div>
	);
}

initializeBlock(() => <HelloWorldTypescriptApp />);

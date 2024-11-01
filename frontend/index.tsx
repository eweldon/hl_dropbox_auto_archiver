import { initializeBlock } from "@airtable/blocks/ui";
import React, { useMemo } from "react";
import AppSelect from "./components/AppSelect";
import ArchiverControls from "./components/ArchiverControls";
import { DropboxAPIProvider, useDropboxAPI } from "./contexts/DropboxAPI";
import { ConfigProvider, useConfig } from "./contexts/Config";
import ConfigMenu from "./components/ConfigMenu";
import Loading from "./components/Loading";
import Error from "./components/Error";
import "./index.css";

function Main() {
	const { appId } = useConfig();
	const { loading, error } = useDropboxAPI();

	const archiverControls = useMemo(() => {
		if (loading) {
			return <Loading />;
		}

		if (error) {
			return <Error message="Could not retrieve token of this app" />;
		}

		return appId && <ArchiverControls />;
	}, [appId, error, loading]);

	return (
		<div className="flex row gap padding align-stretch">
			<div className="grow flex column gap align-end">
				<div className="grow">
					<AppSelect />
				</div>
				<ConfigMenu />
			</div>

			{archiverControls}
		</div>
	);
}

initializeBlock(() => (
	<ConfigProvider>
		<DropboxAPIProvider>
			<Main />
		</DropboxAPIProvider>
	</ConfigProvider>
));

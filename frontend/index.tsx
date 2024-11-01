import { Box, initializeBlock } from "@airtable/blocks/ui";
import React, { useMemo } from "react";
import AppSelect from "./components/AppSelect";
import ArchiverControls from "./components/ArchiverControls";
import { DropboxAPIProvider, useDropboxAPI } from "./contexts/DropboxAPI";
import { ConfigProvider, useConfig } from "./contexts/Config";
import Loading from "./components/Loading";
import Error from "./components/Error";
import "./index.css";
import { ArchiverProvider } from "./contexts/Archiver";

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
			<AppSelect />

			{archiverControls && (
				<Box
					border="default"
					backgroundColor="lightGray1"
					padding={1}
					gap={10}
					overflow="hidden"
				>
					{archiverControls}
				</Box>
			)}
		</div>
	);
}

initializeBlock(() => (
	<ConfigProvider>
		<DropboxAPIProvider>
			<ArchiverProvider>
				<Main />
			</ArchiverProvider>
		</DropboxAPIProvider>
	</ConfigProvider>
));

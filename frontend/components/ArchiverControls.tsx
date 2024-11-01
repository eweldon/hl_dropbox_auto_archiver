import React, { FC } from "react";
import { useArchiver } from "../contexts/Archiver";
import Loading from "./Loading";
import { useDropboxAPI } from "../contexts/DropboxAPI";
import { Button, Label } from "@airtable/blocks/ui";
import Error from "./Error";
import Accordion from "./Accordion";
import FileTree from "./FileTree";
import { useConfig } from "../contexts/Config";
import ConfigMenu from "./ConfigMenu";

const ArchiverControls: FC<Props> = () => {
	const { appId, config } = useConfig();
	const { dropboxAPI } = useDropboxAPI();

	const {
		search,
		isSearching,
		filesFound,

		transfer,
		isTransferring,
		filesTransferred,

		error,
	} = useArchiver();

	if (error) return <Error message={error} />;

	if (!appId) return <Label textColor="orangered">App is not selected</Label>;

	if (!dropboxAPI)
		return (
			<Label textColor="orangered">Failed to initialize Dropbox API</Label>
		);

	const canSearch = appId && !isSearching;
	const canTransfer = appId && filesFound.length > 0;

	return (
		<div className="flex row gap2 padding">
			<div className="flex column gap justify-between align-center">
				<Label>Archiver</Label>
				<ConfigMenu disabled={isSearching || isTransferring} />
			</div>

			<div className="flex row gap">
				<Button disabled={!canSearch} onClick={search}>
					{isSearching ? (
						<Loading
							text={`Searching "${config.rootPath}" for files to archive`}
						/>
					) : (
						`Search "${config.rootPath}" for files to archive`
					)}
				</Button>

				<Accordion title={<Label>Files found: {filesFound.length}</Label>}>
					<FileTree files={filesFound} />
				</Accordion>
			</div>

			<div className="flex row gap">
				<Button disabled={!canTransfer} onClick={transfer}>
					{isTransferring ? (
						<Loading text={`Transferring files to "${config.archiveFolder}"`} />
					) : (
						`Transfer found files to "${config.archiveFolder}"`
					)}
				</Button>

				<Accordion
					title={<Label>Files archived: {filesTransferred.length}</Label>}
				>
					<FileTree files={filesTransferred} />
				</Accordion>
			</div>
		</div>
	);
};

export default ArchiverControls;

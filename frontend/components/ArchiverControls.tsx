import React, { FC } from "react";
import useArchiver from "../hooks/useArchiver";
import Loading from "./Loading";
import { useDropboxAPI } from "../contexts/DropboxAPI";
import { Button, Label } from "@airtable/blocks/ui";
import Error from "./Error";
import Accordion from "./Accordion";
import FileTree from "./FileTree";

interface Props {
	appId: string;
}

const ArchiverControls: FC<Props> = ({ appId }) => {
	const dropboxAPI = useDropboxAPI();
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

	if (!dropboxAPI) return "App is not selected";

	const canSearch = appId && !isSearching;
	const canTransfer = appId && filesFound.length > 0;

	return (
		<div className="flex row gap padding">
			<Label>Archiver:</Label>

			<Button disabled={!canSearch} onClick={search}>
				{isSearching ? (
					<Loading text="Searching for files to archive" />
				) : (
					"Search for files to archive"
				)}
			</Button>

			<Accordion
				title={<Label>Files to archive found: {filesFound.length}</Label>}
			>
				<FileTree files={filesFound} />
			</Accordion>

			<Button disabled={!canTransfer} onClick={transfer}>
				{isTransferring ? (
					<Loading text="Transferring files" />
				) : (
					"Transfer found files to archive"
				)}
			</Button>

			<Accordion
				title={<Label>Files archived: {filesTransferred.length}</Label>}
			>
				<FileTree files={filesTransferred} />
			</Accordion>
		</div>
	);
};

export default ArchiverControls;

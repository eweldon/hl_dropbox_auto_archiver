import React, { FC, useCallback, useState } from "react";
import { useArchiver } from "../contexts/Archiver";
import Loading from "./Loading";
import { useDropboxAPI } from "../contexts/DropboxAPI";
import { Button, Label } from "@airtable/blocks/ui";
import Error from "./Error";
import Accordion from "./Accordion";
import FileTree from "./FileTree";
import { useConfig } from "../contexts/Config";
import ConfigMenu from "./ConfigMenu";
import ConfirmationDialog from "./ConfirmationDialog";
import { TransferMethod } from "../utils/TransferMethod";

const ArchiverControls: FC<Props> = () => {
	const { appId, config } = useConfig();
	const { dropboxAPI } = useDropboxAPI();
	const {
		config: { archiveFolder },
	} = useConfig();

	const {
		search,
		isSearching,
		filesFound,

		transfer,
		isTransferring,
		transferMethod,
		filesTransferred,

		error,
	} = useArchiver();

	const [confirmationDialog, setConfirmationDialog] =
		useState<TransferMethod | null>(null);

	const onConfirm = useCallback(() => {
		if (confirmationDialog) {
			setConfirmationDialog(null);
			transfer(confirmationDialog);
		}
	}, [confirmationDialog, transfer]);

	const onCancel = useCallback(() => {
		if (confirmationDialog) {
			setConfirmationDialog(null);
		}
	}, [confirmationDialog]);

	if (error) return <Error message={error} />;

	if (!appId) return <Label textColor="orangered">App is not selected</Label>;

	if (!dropboxAPI)
		return (
			<Label textColor="orangered">Failed to initialize Dropbox API</Label>
		);

	const canSearch = appId && !isSearching;
	const canTransfer = appId && filesFound.length > 0 && !isTransferring;

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
				<Button
					disabled={!canTransfer}
					onClick={() => setConfirmationDialog("copy")}
				>
					{isTransferring && transferMethod === "copy" ? (
						<Loading text={`Copying files to "${config.archiveFolder}"`} />
					) : (
						`Copy found files to "${config.archiveFolder}"`
					)}
				</Button>

				<Button
					disabled={!canTransfer}
					onClick={() => setConfirmationDialog("move")}
				>
					{isTransferring && transferMethod === "move" ? (
						<Loading text={`Moving files to "${config.archiveFolder}"`} />
					) : (
						`Move found files to "${config.archiveFolder}"`
					)}
				</Button>

				{confirmationDialog && (
					<ConfirmationDialog
						title={`${confirmationDialog === "move" ? "Move" : "Copy"} files?`}
						onConfirm={onConfirm}
						onCancel={onCancel}
					>
						{`This action will initiate a file transfer. All files listed above will
					be ${confirmationDialog === "move" ? "moved" : "copied"} to the "
					${archiveFolder}". Are you sure you want to do it?`}
					</ConfirmationDialog>
				)}

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

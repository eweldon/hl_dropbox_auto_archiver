import React, { FC, useCallback, useMemo, useState } from "react";
import { useArchiver } from "../contexts/Archiver";
import Loading from "./Loading";
import { useDropboxAPI } from "../contexts/DropboxAPI";
import { Button, Label, Switch } from "@airtable/blocks/ui";
import Error from "./Error";
import Accordion from "./Accordion";
import FileTree from "./FileTree";
import { useConfig } from "../contexts/Config";
import ConfigMenu from "./ConfigMenu";
import ConfirmationDialog from "./ConfirmationDialog";
import { TransferMethod } from "../utils/TransferMethod";
import { Entry } from "../types/Entry";
import Input from "./Input";

const ArchiverControls: FC<Props> = () => {
	const { appId, config } = useConfig();
	const { dropboxAPI } = useDropboxAPI();
	const { config: { archiveFolder } } = useConfig();

	const {
		search,
		isSearching,
		filesProcessed,
		filesMatched,
		filesNotMatched,

		transfer,
		isTransferring,
		transferMethod,
		filesTransferred,

		error,
	} = useArchiver();

	const [showMatched, setShowMatched] = useState(true)
	const [showNotMatched, setShowNotMatched] = useState(false)
	const [showFolders, setShowFolders] = useState(false)
	const [filterQuery, setFilterQuery] = useState('')
	const [confirmationDialog, setConfirmationDialog] = useState<TransferMethod | null>(null);

	const displayingFiles = showMatched
		? (showNotMatched
			? filesProcessed
			: filesMatched
		)
		: (showNotMatched
			? filesNotMatched
			: []
		)

	const filteredFiles = useMemo(() => {
		if (!filterQuery.trim()) {
			return displayingFiles
		}

		const words = filterQuery
			.toLowerCase()
			.split(' ')
			.filter(Boolean)

		const filteredFiles = (showFolders
			? displayingFiles
			: displayingFiles.filter(entry => entry.type === 'file')
		)
			.map(entry => {
				const score = words.reduce((score, word) => {
					return entry.path.toLowerCase().includes(word) ? score + 1 : score
				}, 0)

				return { score, entry }
			})
			.filter(entry => entry.score > 0)

		const groups = new Map<number, Entry[]>()

		for (const { score, entry } of filteredFiles) {
			const group = groups.get(score)

			if (group)
				group.push(entry)
			else
				groups.set(score, [entry])
		}

		return Array
			.from(groups.entries())
			.sort((a, b) => b[0] - a[0])
			.map(([, entry]) => entry)
			.flat(1)
	}, [filterQuery, showFolders, displayingFiles])

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

	if (error) {
		return <Error message={error} />;
	}

	if (!appId) {
		return <Label textColor="orangered">App is not selected</Label>;
	}

	if (!dropboxAPI) {
		return <Label textColor="orangered">Failed to initialize Dropbox API</Label>
	}

	const canSearch = appId && !isSearching;
	const canTransfer = appId && filesMatched.length > 0 && !isSearching && !isTransferring;

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

				<Accordion title={<Label>Files matched: {filesMatched.length} ({filesProcessed.length} processed)</Label>}>
					<div className="flex row gap">
						<div className="flex column gap">
							<Switch value={showMatched} onChange={setShowMatched} label="Show matched" />
							<Switch value={showNotMatched} onChange={setShowNotMatched} label="Show not matched" />
							<Switch value={showFolders} onChange={setShowFolders} label="Show folders" />
						</div>
						<Input value={filterQuery} onChange={setFilterQuery} placeholder="Filter entries" />
						<div className="padding">
							<Label>
								{`Displaying ${(displayingFiles.length === filteredFiles.length
									? displayingFiles.length
									: `${filteredFiles.length}/${displayingFiles.length}`
								)} file(s)`}
							</Label>
						</div>
					</div>
					<hr />
					<FileTree files={filteredFiles} />
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

import {
	SelectOption,
	SelectOptionValue,
} from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";
import { Button, Select, useBase, useRecords } from "@airtable/blocks/ui";
import React, { FC, useCallback, useMemo, useState } from "react";
import { OnChange } from "../types/OnChange";
import Record from "@airtable/blocks/dist/types/src/models/record";

interface Props {
	value: SelectOptionValue;
	onChange: OnChange<SelectOptionValue>;
}

const AppSelect: FC<Props> = ({ value, onChange }) => {
	const base = useBase();
	const authTable = useMemo(() => base.getTable("tblLsaz5SX620eWOo"), [base]);
	const apps = useRecords(authTable);

	const [selectedAppId, setSelectedAppId] = useState<SelectOptionValue>(null);

	const options = useMemo(() => {
		return apps.map((app): SelectOption => {
			return {
				label: getAppNote(app),
				value: app.id,
			};
		});
	}, [apps]);

	const app = useMemo(
		() => apps.find((app) => app.id === selectedAppId),
		[apps, selectedAppId]
	);

	const canSubmit = selectedAppId && value !== selectedAppId;

	const onSubmit = useCallback(() => {
		onChange(selectedAppId);
	}, [onChange, selectedAppId]);

	const prefix = value ? "Switch to" : "Select";
	const appName = app ? `"${getAppNote(app)}"` : "an app...";
	const submitButtonText =
		value && value === selectedAppId
			? `${appName} selected`
			: `${prefix} ${appName}`;

	return (
		<div className="flex row gap">
			Select App:
			<Select
				value={selectedAppId}
				onChange={setSelectedAppId}
				options={options}
			/>
			<Button disabled={!canSubmit} onClick={onSubmit}>
				{submitButtonText}
			</Button>
		</div>
	);
};

export default AppSelect;

function getAppNote(app: Record) {
	return app.getCellValueAsString("fld1BdaOAI5K0XRY3");
}

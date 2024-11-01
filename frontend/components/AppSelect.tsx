import { SelectOption } from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";
import { Select, useBase, useRecords } from "@airtable/blocks/ui";
import React, { FC, useMemo } from "react";
import Record from "@airtable/blocks/dist/types/src/models/record";
import { useConfig } from "../contexts/Config";

const AppSelect: FC<Props> = () => {
	const base = useBase();
	const authTable = useMemo(() => base.getTable("tblLsaz5SX620eWOo"), [base]);
	const apps = useRecords(authTable);
	const { appId, setAppId, hasChanges } = useConfig();

	const options = useMemo(() => {
		return apps.map((app): SelectOption => {
			return {
				label: getAppNote(app),
				value: app.id,
			};
		});
	}, [apps]);

	return (
		<div className="flex row gap">
			Select App:
			<Select
				disabled={hasChanges}
				value={appId}
				onChange={setAppId}
				options={options}
			/>
		</div>
	);
};

export default AppSelect;

function getAppNote(app: Record) {
	return app.getCellValueAsString("fld1BdaOAI5K0XRY3");
}

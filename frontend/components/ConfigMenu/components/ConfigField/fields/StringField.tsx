import React, { useCallback } from "react";
import { Input } from "@airtable/blocks/ui";
import { FieldInputMap } from "../../../types";

const StringField: FieldInputMap["string"] = ({ value, onChange }) => {
	const onChangeEvent = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(e.target.value);
		},
		[onChange]
	);

	return <Input value={value} onChange={onChangeEvent} />;
};

export default StringField;

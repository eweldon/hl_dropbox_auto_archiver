import React, { useCallback } from "react";
import { Input } from "@airtable/blocks/ui";
import { FieldInputMap } from "../../../types";

const NumberField: FieldInputMap["number"] = ({ value, onChange }) => {
	const onChangeEvent = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(e.target.value);
		},
		[onChange]
	);

	return <Input type="number" value={value} onChange={onChangeEvent} />;
};

export default NumberField;

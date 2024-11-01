import React from "react";
import { Switch } from "@airtable/blocks/ui";
import { FieldInputMap } from "../../../types";

const BooleanField: FieldInputMap["boolean"] = ({ value, onChange }) => {
	return <Switch value={value} onChange={onChange} />;
};

export default BooleanField;

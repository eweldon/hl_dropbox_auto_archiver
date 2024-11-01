import React from "react";
import { FieldInputMap } from "../../../types";
import { Label } from "@airtable/blocks/ui";
import Input from "../../../../Input";

interface Unit {
	key: string;
	name: string;
	value: number;
	modulo?: number;
}

const UNITS: Unit[] = [
	{
		key: "years",
		name: "Years",
		value: 365,
	},
	{
		key: "days",
		name: "Days",
		value: 24,
	},
	{
		key: "hours",
		name: "Hours",
		value: 3600e3,
	},
];

for (let i = UNITS.length - 1; i > 0; --i) {
	UNITS[i - 1].value *= UNITS[i].value;
	UNITS[i].modulo = UNITS[i - 1].value;
}

const DurationField: FieldInputMap["duration"] = ({ value, onChange }) => {
	const inputs = UNITS.map((unit) => {
		const modulo = unit.modulo ? value % unit.modulo : value;
		const currentValue = Math.floor(modulo / unit.value);

		return (
			<div key={unit.key} className="flex row gap">
				<Label>{unit.name}:</Label>

				<Input
					type="number"
					value={currentValue}
					onBlur={(newValue) => {
						newValue = parseInt(newValue);
						const diff = (newValue - currentValue) * unit.value;

						if (isNaN(diff)) {
							onChange(value);
						} else {
							onChange(value + diff);
						}
					}}
				/>
			</div>
		);
	});

	return <div className="flex column gap">{inputs}</div>;
};

export default DurationField;

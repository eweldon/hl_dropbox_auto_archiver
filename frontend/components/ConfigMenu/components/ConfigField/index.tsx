import React, { FC, useCallback } from "react";
import { Label, Tooltip } from "@airtable/blocks/ui";
import { FieldInputValueTypeMap, FieldMeta } from "../../types";
import { FIELD_INPUTS } from "./constants";
import { useConfig } from "../../../../contexts/Config";

interface ConfigFieldProps {
	fieldKey: string;
	meta: FieldMeta;
}

const ConfigField: FC<ConfigFieldProps> = ({
	fieldKey,
	meta: { title, description, input },
}) => {
	const FieldInput = FIELD_INPUTS[input.type];
	const { config, updateConfig } = useConfig();

	const onFieldChange = useCallback(
		(newValue: FieldInputValueTypeMap[typeof input.type]) => {
			updateConfig((prev) => ({
				...prev,
				[fieldKey]: newValue,
			}));
		},
		[fieldKey, input, updateConfig]
	);

	if (!FieldInput) {
		const text = `Unknown input type "${input.type}" of "${fieldKey}" field`;
		return <Label textColor="red">{text}</Label>;
	}

	return (
		<div className="flex row gap">
			<Tooltip
				content={description}
				placementX={Tooltip.placements.CENTER}
				placementY={Tooltip.placements.BOTTOM}
				shouldHideTooltipOnClick={true}
			>
				<Label>{title}:</Label>
			</Tooltip>

			<FieldInput
				value={config[fieldKey]}
				onChange={onFieldChange}
				meta={input}
			/>
		</div>
	);
};

export default ConfigField;

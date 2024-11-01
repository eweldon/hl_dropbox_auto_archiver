import React, { FC, useCallback } from "react";
import { Label, Tooltip } from "@airtable/blocks/ui";
import { FieldInputValueTypeMap, FieldMeta } from "../../types";
import { FIELD_INPUTS } from "./constants";
import { Config } from "../../../../types/Config";
import { OnChange } from "../../../../types/OnChange";

interface ConfigFieldProps {
	config: Config;
	setConfig: OnChange<Config>;
	fieldKey: string;
	meta: FieldMeta;
}

const ConfigField: FC<ConfigFieldProps> = ({
	config,
	setConfig,
	fieldKey,
	meta: { title, description, input },
}) => {
	const FieldInput = FIELD_INPUTS[input.type];

	const onFieldChange = useCallback(
		(newValue: FieldInputValueTypeMap[typeof input.type]) => {
			setConfig({
				...config,
				[fieldKey]: newValue,
			});
		},
		[config, fieldKey, input, setConfig]
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

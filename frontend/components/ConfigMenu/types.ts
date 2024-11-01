import { FC } from "react";
import { Config } from "../../types/Config";

interface BooleanFieldInputMeta {
	type: "boolean";
}

interface NumberFieldInputMeta {
	type: "number";
}

interface StringFieldInputMeta {
	type: "string";
}

interface DurationFieldInputMeta {
	type: "duration";
}

export type FieldInputMeta =
	| BooleanFieldInputMeta
	| NumberFieldInputMeta
	| StringFieldInputMeta
	| DurationFieldInputMeta;

export type FieldInputValueTypeMap = {
	boolean: boolean;
	number: number;
	string: string;
	duration: number;
};

export type FieldInputType<T extends FieldInputMeta["type"]> =
	FieldInputValueTypeMap[T];

export interface FieldMeta {
	title: string;
	description: string;
	input: FieldInputMeta;
}

export type FieldsMeta = {
	[K in keyof Config]: FieldMeta;
};

export type FieldInputMap = {
	[FieldType in FieldInputMeta["type"]]: FC<{
		value: FieldInputType<FieldType>;
		onChange: OnChange<FieldInputType<FieldType>>;
		meta: Extract<FieldInputMeta, { type: FieldType }>;
	}>;
};

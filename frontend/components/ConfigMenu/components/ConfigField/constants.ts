import { FieldInputMap, FieldsMeta } from "../../types";
import BooleanField from "./fields/BooleanField";
import DurationField from "./fields/DurationField";
import NumberField from "./fields/NumberField";
import StringField from "./fields/StringField";

export const FIELDS_META: FieldsMeta = {
	archiveFilesOlderThan: {
		title: "Archive files older than",
		description: "How much time should pass until a file should be archived",
		input: {
			type: "duration",
		},
	},
	autoRename: {
		title: "Auto-rename",
		description: "Auto rename files if they already exist",
		input: {
			type: "boolean",
		},
	},
	maxFiles: {
		title: "File limit",
		description: "Max. files to search for",
		input: {
			type: "number",
		},
	},
	rootPath: {
		title: "Root path",
		description: "Archiving will be scoped to this path",
		input: {
			type: "string",
		},
	},
	archiveFolder: {
		title: "Archive path",
		description: "The path where archived files will be stored",
		input: {
			type: "string",
		},
	},
};

export const FIELD_INPUTS: FieldInputMap = {
	boolean: BooleanField,
	number: NumberField,
	string: StringField,
	duration: DurationField,
};

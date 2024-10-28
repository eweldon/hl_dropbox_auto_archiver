import React, { FC } from "react";
import { Label } from "@airtable/blocks/ui";
import { Entry } from "../types/Entry";

interface Props {
	files: Entry[];
}

const FileTree: FC<Props> = ({ files }) => {
	return (
		<div className="flex row gap list">
			{files.length === 0 ? (
				<Label className="item">Empty</Label>
			) : (
				files.map(({ path }) => (
					<div className="flex column gap padding item" key={path}>
						<Label className="ellipsis">{path}</Label>
					</div>
				))
			)}
		</div>
	);
};

export default FileTree;

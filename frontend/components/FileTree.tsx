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
				files.map((entry) => {
					const date = entry.type === "file" && entry.modifiedAt;

					return (
						<div className="flex row gap padding item" key={entry.path}>
							<Label className="ellipsis no-margin">{entry.path}</Label>
							<Label className="ellipsis no-margin">
								{date ? `Modified: ${date.toLocaleString()}` : "Folder"}
							</Label>
						</div>
					);
				})
			)}
		</div>
	);
};

export default FileTree;

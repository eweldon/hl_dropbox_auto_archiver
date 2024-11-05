import React, { FC, PropsWithChildren } from "react";
import { Button, Dialog, Heading, Text } from "@airtable/blocks/ui";

interface Props extends PropsWithChildren {
	title?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
}

const ConfirmationDialog: FC<Props> = ({
	title,
	onConfirm,
	onCancel,
	children,
}) => (
	<Dialog onClose={onCancel} width="320px">
		<Heading>{title || "Dialog"}</Heading>
		<Text variant="paragraph">{children}</Text>

		<div className="flex column gap justify-end">
			<Button variant="primary" onClick={onConfirm}>
				Confirm
			</Button>
			<Button variant="secondary" onClick={onCancel}>
				Cancel
			</Button>
		</div>
	</Dialog>
);

export default ConfirmationDialog;

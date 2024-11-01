import { Box, Button, Dialog, Heading, Icon } from "@airtable/blocks/ui";
import React, {
	FC,
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import AppSelect from "../AppSelect";
import ConfigField from "./components/ConfigField";
import { FIELDS_META } from "./components/ConfigField/constants";
import { useConfig } from "../../contexts/Config";

interface Props {
	disabled?: boolean;
}

const ConfigMenu: FC<Props> = ({ disabled }) => {
	const { appId, hasChanges, saveChanges, cancelChanges } = useConfig();

	const [isOpen, setIsOpen] = useState(false);
	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);

	useEffect(() => {
		if (isOpen && disabled) close();
	}, [disabled, isOpen, close]);

	const fields = useMemo(
		() =>
			appId && (
				<Box
					key={appId}
					border="default"
					backgroundColor="lightGray1"
					padding={1}
					gap={10}
					overflow="hidden"
				>
					<div className="flex row gap">
						{Object.entries(FIELDS_META).map(([key, meta]) => {
							return <ConfigField key={key} fieldKey={key} meta={meta} />;
						})}
					</div>
				</Box>
			),
		[appId]
	);

	return (
		<Fragment>
			<Button disabled={disabled} onClick={open}>
				<Icon name="cog" size={16} />
			</Button>

			{isOpen && (
				<Dialog onClose={close} width="320px">
					<Heading>Configuration</Heading>

					<div className="flex row gap align-stretch">
						<AppSelect />

						{fields}

						<div className="flex column gap justify-end align-center">
							{hasChanges ? (
								<>
									<Button variant="primary" onClick={saveChanges}>
										Save
									</Button>
									<Button variant="danger" onClick={cancelChanges}>
										Cancel
									</Button>
								</>
							) : (
								<Button variant="secondary" onClick={close}>
									Close
								</Button>
							)}
						</div>
					</div>
				</Dialog>
			)}
		</Fragment>
	);
};

export default ConfigMenu;

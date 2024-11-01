import { Box, Button, Dialog, Heading, Icon } from "@airtable/blocks/ui";
import React, {
	FC,
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import ConfigField from "./components/ConfigField";
import { FIELDS_META } from "./components/ConfigField/constants";
import { useConfig } from "../../contexts/Config";
import isEqual from "lodash/isEqual";
import { Config } from "../../types/Config";

interface ConfigMenuProps {
	disabled?: boolean;
}

const ConfigMenu: FC<ConfigMenuProps> = ({ disabled }) => {
	const { appId, config, updateConfig } = useConfig();
	const [isOpen, setIsOpen] = useState(false);
	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);

	useEffect(() => {
		if (isOpen && disabled) close();
	}, [disabled, isOpen, close]);

	const modalWindow = useMemo(
		() =>
			isOpen && (
				<Dialog width="320px">
					<Heading>Configuration</Heading>

					{/* <AppSelect /> */}

					{appId && (
						<Configurator
							key={appId}
							config={config}
							setConfig={updateConfig}
							close={close}
						/>
					)}
				</Dialog>
			),
		[appId, close, config, isOpen, updateConfig]
	);

	return (
		<Fragment>
			<Button disabled={disabled} onClick={open}>
				<Icon name="cog" size={16} />
			</Button>

			{modalWindow}
		</Fragment>
	);
};

interface ConfiguratorProps {
	config: Config;
	setConfig: OnChange<Config>;
	close: () => void;
}

const Configurator: FC<ConfiguratorProps> = ({ config, setConfig, close }) => {
	const [internalConfig, setInternalConfig] = useState(config);

	useEffect(() => {
		setInternalConfig(config);
	}, [config]);

	const hasChanges = useMemo(() => {
		return !isEqual(config, internalConfig);
	}, [config, internalConfig]);

	const saveChanges = useCallback(() => {
		setConfig(internalConfig);
	}, [internalConfig, setConfig]);

	const cancelChanges = useCallback(() => {
		setInternalConfig(config);
	}, [config]);

	const fields = useMemo(
		() => (
			<Box
				border="default"
				backgroundColor="lightGray1"
				padding={1}
				gap={10}
				overflow="hidden"
			>
				<div className="flex row gap">
					{Object.entries(FIELDS_META).map(([key, meta]) => {
						return (
							<ConfigField
								config={internalConfig}
								setConfig={setInternalConfig}
								key={key}
								fieldKey={key}
								meta={meta}
							/>
						);
					})}
				</div>
			</Box>
		),
		[internalConfig]
	);

	return (
		<div className="flex row gap align-stretch">
			{fields}

			<div className="flex column gap justify-between align-end">
				<div className="flex column gap">
					<Button
						variant="primary"
						onClick={saveChanges}
						disabled={!hasChanges}
					>
						Save
					</Button>
					<Button
						variant="danger"
						onClick={cancelChanges}
						disabled={!hasChanges}
					>
						Cancel
					</Button>
				</div>

				<Button variant="default" onClick={close} disabled={hasChanges}>
					Close
				</Button>
			</div>
		</div>
	);
};

export default ConfigMenu;

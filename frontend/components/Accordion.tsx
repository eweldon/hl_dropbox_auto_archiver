import React, {
	FC,
	PropsWithChildren,
	ReactNode,
	useCallback,
	useEffect,
	useState,
} from "react";
import { OnChange } from "../types/OnChange";
import { Icon } from "@airtable/blocks/ui";

interface Props extends PropsWithChildren {
	open?: boolean;
	onToggle?: OnChange<boolean>;
	title?: ReactNode;
}

const Accordion: FC<Props> = ({ open, onToggle, title, children }) => {
	const [isOpen, setIsOpen] = useState();

	useEffect(() => {
		if (open != null) setIsOpen(open);
	}, [open]);

	const toggle = useCallback(() => {
		setIsOpen((prev) => {
			const newOpen = !prev;
			onToggle?.(newOpen);
			return newOpen;
		});
	}, [onToggle]);

	const bodyClassName = ["accordion-body", "padding", isOpen || "hidden"]
		.filter(Boolean)
		.join(" ");

	return (
		<div className="accordion">
			<div className="accordion-header" onClick={toggle}>
				<div className="title padding">{title}</div>
				<div className="chevron padding">
					<Icon name={isOpen ? "chevronUp" : "chevronDown"} size={20} />
				</div>
			</div>
			<div className={bodyClassName}>{children}</div>
		</div>
	);
};

export default Accordion;

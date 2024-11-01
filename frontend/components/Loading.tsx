import { Label } from "@airtable/blocks/ui";
import React, { FC, useEffect, useState } from "react";

interface Props {
	text?: string;
}

const Loading: FC<Props> = ({ text = "Loading" }) => {
	const [dotCount, setDotCount] = useState(1);

	useEffect(() => {
		const interval = setInterval(() => {
			setDotCount((prev) => (prev % 3) + 1);
		}, 250);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<Label>
			{text}
			{".".repeat(dotCount)}
		</Label>
	);
};

export default Loading;

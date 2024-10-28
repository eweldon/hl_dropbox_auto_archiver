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
		<div>
			{text}
			{".".repeat(dotCount)}
		</div>
	);
};

export default Loading;

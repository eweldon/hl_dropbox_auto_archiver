import React, { FC } from "react";

interface Props {
	message?: string;
}

const Error: FC<Props> = ({ message = "Error" }) => {
	return <div className="error">{message}</div>;
};

export default Error;

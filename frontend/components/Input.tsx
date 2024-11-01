import React, {
	ChangeEvent,
	FC,
	useCallback,
	useEffect,
	useState,
} from "react";
import { Input as AirtableInput } from "@airtable/blocks/ui";

type InputProps = Parameters<typeof AirtableInput>[0];

interface Props extends InputProps {}

const Input: FC<Props> = ({ value, onChange, onBlur, ...props }) => {
	const [resetInternalValue, setResetInternalValue] = useState(true);
	const [internalValue, setInternalValue] = useState(value);

	useEffect(() => {
		if (resetInternalValue) {
			setResetInternalValue(false);
			return;
		}

		setInternalValue(value);
	}, [resetInternalValue, value]);

	const onChangeEvent = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setInternalValue(newValue);
			onChange?.(newValue);
		},
		[onChange]
	);

	const onBlurEvent = useCallback(() => {
		onBlur?.(internalValue);
		onChange?.(internalValue);
		setResetInternalValue(true);
	}, [onBlur, onChange, internalValue]);

	return (
		<AirtableInput
			{...props}
			value={internalValue}
			onChange={onChangeEvent}
			onBlur={onBlurEvent}
		/>
	);
};

export default Input;

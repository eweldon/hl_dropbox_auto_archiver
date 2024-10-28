function getDateString(date) {
	const tokens = [date.getFullYear(), date.getMonth() + 1, date.getDate()];

	return tokens.join("-");
}

export default getDateString;

export function split(path: string | null | undefined) {
	return path
		?.split(/[\\/]+/)
		.map((path) => path?.trim())
		.filter(Boolean);
}

export function join(...paths: string[]) {
	const cleanPath = paths
		.map((path) => split(path))
		.flat(1)
		.join("/");

	return cleanPath ? "/" + cleanPath : null;
}

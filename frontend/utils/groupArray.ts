function groupArray<Item, Category extends string>(
	array: Item[],
	predicate: (item: Item, index: number, thisArray: Item[]) => Category,
	predefinedCategories?: Category[]
) {
	const groups: Record<Category, Item[] | undefined> = {};

	if (predefinedCategories) {
		for (const category of predefinedCategories) {
			groups[category] = [];
		}
	}

	for (let index = 0; index < array.length; ++index) {
		const item = array[index];
		const category = predicate(item, index, array);

		if (groups[category]) {
			groups[category].push(item);
		} else {
			groups[category] = [item];
		}
	}

	return groups;
}

export default groupArray;

function flatten(obj: Record<string, any>) {
	const result: { [key: string]: string } = {};

	for (const key of Object.keys(obj)) {
		const value = obj[key];

		if (typeof value === 'string') {
			result[key] = value;
		} else {
			const inner = flatten(value);
			for (const innerKey of Object.keys(inner)) {
				result[`${key}.${innerKey}`] = inner[innerKey];
			}
		}
	}

	return result;
};

const strings = flatten({
	serviceName: 'NotesOn',
	actions: {
		create: {
			name: 'Publish (or Update) note to NotesOn',
			success: 'Note published to NotesOn. URL copied to clipboard.',
			failure: 'Failed to publish note to NotesOn'
		},
		remove: {
			name: 'Remove from NotesOn',
			success: 'Note removed from NotesOn',
			failure: 'Failed to remove note from NotesOn'
		},
	},
	modals: {
		showUrl: {
			title: 'Note published at:',
			copy: 'Copy URL',
		}
	}
});

export function getText(path: string, ...args: string[]) {
	const value = strings[path];
	if (value !== undefined) {
		if (args.length) {
			return `${value}: ${args.join(', ')}`;
		}

		return value;
	}

	return path;
}

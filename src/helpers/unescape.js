export default function unescape(value) {
	try {
		const doc = new DOMParser().parseFromString(value, "text/html");
		if (!doc) {
			return value;
		}

		const body = doc.body;
		if (!body) {
			return value;
		}

		const html = body.innerHTML;
		if (!html) {
			return value;
		}

		return html;
	} catch (error) {}

	return value;
}

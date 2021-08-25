let widgetId = null

window.onmessage = event => {
	if (!window.parent || !event.data) {
		return
	}

	const request = event.data
	if (!request.requestId || !request.widgetId || !request.action || request.api !== "toWidget") {
		return
	}

	if (widgetId) {
		if (widgetId !== request.widgetId) {
			return
		}
	} else {
		widgetId = request.widgetId
	}

	let response

	if (request.action === "visibility") {
		response = {}
	} else if (request.action === "capabilities") {
		response = { capabilities: ["m.sticker"] }
	} else {
		response = { error: { message: "Action not supported" } }
	}

	window.parent.postMessage({ ...request, response }, event.origin)
}

export function sendSticker(content) {
	const data = {
		content: { ...content },
		// `name` is for Element Web (and also the spec)
		// Element Android uses content -> body as the name
		name: content.body,
	}
	// Custom field that stores the ID even for non-telegram stickers
	delete data.content.id

	// This is for Element iOS
	const widgetData = {
		...data,
		description: content.body,
		file: `${content.id}.png`,
	}
	// Element iOS explodes if there are extra fields present
	delete widgetData.content["net.maunium.telegram.sticker"]

	window.parent.postMessage({
		api: "fromWidget",
		action: "m.sticker",
		requestId: `sticker-${Date.now()}`,
		widgetId,
		data,
		widgetData,
	}, "*")
}
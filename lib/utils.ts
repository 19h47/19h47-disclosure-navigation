/**
 * Dispatch event
 *
 * @param {HTMLElement} target
 * @param {object} details
 * @param {string} name
 */
export const dispatchEvent = (target: HTMLElement, details: object = {}, name: string = ''): boolean => {
	const event = new CustomEvent(`disclosure-navigation:${name}`, {
		bubbles: false,
		cancelable: true,
		detail: details,
	});

	// Dispatch the event on target.
	return target.dispatchEvent(event);
};

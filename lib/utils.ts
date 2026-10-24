import type { Detail } from './types';

/**
 * Dispatch event
 *
 * Fires a bubbling, cancelable `disclosure-navigation:<name>` event on `$target`.
 *
 * @returns `false` if a listener called `preventDefault()`.
 */
export const dispatchEvent = ($target: EventTarget, name: string, detail: Detail): boolean => {
	const event = new CustomEvent(`disclosure-navigation:${name}`, {
		bubbles: true,
		cancelable: true,
		detail,
	});

	return $target.dispatchEvent(event);
};

/**
 * Focus by key
 *
 * Moves focus between `elements` with the arrow, Home and End keys, wrapping at both ends.
 * Keys pressed with a modifier are left to the browser.
 */
export const focusByKey = (event: KeyboardEvent, elements: HTMLElement[], index: number): void => {
	if (event.altKey || event.ctrlKey || event.metaKey) {
		return;
	}

	const last = elements.length - 1;
	const previous = index === 0 ? last : index - 1;
	const next = index === last ? 0 : index + 1;
	const keys: Partial<Record<string, number>> = {
		ArrowUp: previous,
		ArrowLeft: previous,
		ArrowDown: next,
		ArrowRight: next,
		Home: 0,
		End: last,
	};
	const destination = keys[event.key];

	if (destination === undefined) {
		return;
	}

	event.preventDefault();
	elements[destination].focus();
};

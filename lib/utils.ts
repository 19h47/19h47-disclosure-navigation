export type State = 'open' | 'closed';

const opposite = (state: State): State => ('open' === state ? 'closed' : 'open');

/** The pending `toggle` event of each element, with the state before the first change. */
const toggleTasks = new WeakMap<HTMLElement, { oldState: State; timeout: number }>();

/**
 * Dispatch beforetoggle
 *
 * Fires `beforetoggle` at `$element`, as a popover does: before the change, without
 * bubbling, cancelable only when the element opens.
 *
 * @returns `false` if a listener canceled the opening.
 */
export const dispatchBeforetoggle = (
	$element: HTMLElement,
	newState: State,
	$source: HTMLButtonElement,
): boolean => {
	const event = new ToggleEvent('beforetoggle', {
		cancelable: 'open' === newState,
		oldState: opposite(newState),
		newState,
		source: $source,
	});

	return $element.dispatchEvent(event);
};

/**
 * Queue toggle
 *
 * Fires `toggle` at `$element` in a later task, as a popover does. Changes made before it
 * fires coalesce into one event, from the first old state to the last new state.
 */
export const queueToggle = ($element: HTMLElement, newState: State, $source: HTMLButtonElement): void => {
	const task = toggleTasks.get($element);
	const oldState = task?.oldState ?? opposite(newState);

	clearTimeout(task?.timeout);

	const timeout = setTimeout(() => {
		const event = new ToggleEvent('toggle', { oldState, newState, source: $source });

		toggleTasks.delete($element);
		$element.dispatchEvent(event);
	});

	toggleTasks.set($element, { oldState, timeout });
};

/**
 * Focus by key
 *
 * Moves focus between `elements` with the arrow, Home and End keys, wrapping at both ends.
 * Left and right follow the reading direction of the focused element. Keys pressed with
 * a modifier are left to the browser.
 */
export const focusByKey = (event: KeyboardEvent, elements: HTMLElement[], index: number): void => {
	if (event.altKey || event.ctrlKey || event.metaKey) {
		return;
	}

	const last = elements.length - 1;
	const previous = index === 0 ? last : index - 1;
	const next = index === last ? 0 : index + 1;
	const rtl = elements[index].matches(':dir(rtl)');
	const keys: Partial<Record<string, number>> = {
		ArrowUp: previous,
		ArrowLeft: rtl ? next : previous,
		ArrowDown: next,
		ArrowRight: rtl ? previous : next,
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

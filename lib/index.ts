import type { Detail } from './types';
import { dispatchEvent, focusByKey } from './utils';

const BUTTONS = 'button[aria-expanded][aria-controls]';
const TOP_LEVEL_ITEMS = `a[href], ${BUTTONS}`;
const MENU_ITEMS = 'a[href], button:enabled, [tabindex]:not([tabindex^="-"])';

const isExpanded = ($button: HTMLButtonElement): boolean => $button.ariaExpanded === 'true';

const controlledElements = ($button: HTMLButtonElement): HTMLElement[] =>
	($button.ariaControlsElements ?? []) as HTMLElement[];

const menuItems = ($button: HTMLButtonElement): HTMLElement[] =>
	controlledElements($button).flatMap(element => [
		...element.querySelectorAll<HTMLElement>(MENU_ITEMS),
	]);

/**
 * Disclosure Navigation
 *
 * Enhances a navigation whose buttons show and hide submenus. The markup is the
 * source of truth: `aria-expanded` on each button holds the state, and the submenus
 * are the elements its `aria-controls` references. The class never adds a missing
 * attribute; it only updates `aria-expanded` and `hidden` when the user interacts.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
 * @see https://w3c.github.io/aria/#dom-ariamixin-ariacontrolselements
 *
 * @example
 * ```typescript
 * const nav = document.querySelector('.nav');
 * const disclosureNavigation = new DisclosureNavigation(nav);
 * disclosureNavigation.init();
 * ```
 */
class DisclosureNavigation {
	el: HTMLElement;
	useArrowKeys = true;
	#controller: AbortController | null = null;

	constructor(el: HTMLElement) {
		this.el = el;
	}

	init(): void {
		this.destroy();
		this.#controller = new AbortController();

		const { signal } = this.#controller;

		this.el.addEventListener('click', this.#handleClick, { signal });
		this.el.addEventListener('keydown', this.#handleKeydown, { signal });
		this.el.addEventListener('focusout', this.#handleFocusout, { signal });
	}

	/** Removes the listeners. The markup stays in its current state. */
	destroy(): void {
		this.#controller?.abort();
		this.#controller = null;
	}

	/** Opens the submenu of `$button`, after closing the one already open. */
	open($button: HTMLButtonElement): void {
		const closed = this.#expandedButtons
			.filter($expanded => $expanded !== $button)
			.every($expanded => this.#expand($expanded, false));

		if (closed) {
			this.#expand($button, true);
		}
	}

	/** Closes the submenu of `$button`, or every open submenu. */
	close($button?: HTMLButtonElement): void {
		const $buttons = $button ? [$button] : this.#expandedButtons;

		$buttons.forEach($expanded => this.#expand($expanded, false));
	}

	toggle($button: HTMLButtonElement): void {
		if (isExpanded($button)) {
			this.close($button);
		} else {
			this.open($button);
		}
	}

	get #buttons(): HTMLButtonElement[] {
		return [...this.el.querySelectorAll<HTMLButtonElement>(BUTTONS)];
	}

	get #expandedButtons(): HTMLButtonElement[] {
		return this.#buttons.filter(isExpanded);
	}

	/** Buttons and links of the navigation itself, outside every submenu. */
	get #topLevelItems(): HTMLElement[] {
		const elements = this.#buttons.flatMap(controlledElements);

		return [...this.el.querySelectorAll<HTMLElement>(TOP_LEVEL_ITEMS)].filter(
			item => !elements.some(element => element.contains(item)),
		);
	}

	/**
	 * Expand
	 *
	 * Fires the cancelable event, then updates `aria-expanded` and `hidden`.
	 *
	 * @returns `false` if a listener canceled the change.
	 */
	#expand($button: HTMLButtonElement, expanded: boolean): boolean {
		if (isExpanded($button) === expanded) {
			return true;
		}

		const elements = controlledElements($button);
		const name = expanded ? 'open' : 'close';
		const detail: Detail = { $button, elements };

		if (!dispatchEvent($button, name, detail)) {
			return false;
		}

		$button.ariaExpanded = expanded.toString();
		elements.forEach(element => {
			element.hidden = !expanded;
		});

		return true;
	}

	#handleClick = (event: MouseEvent): void => {
		const $button = (event.target as Element).closest<HTMLButtonElement>(BUTTONS);

		if ($button && this.el.contains($button)) {
			this.toggle($button);
		}
	};

	#handleFocusout = ({ relatedTarget }: FocusEvent): void => {
		if (!this.el.contains(relatedTarget as Node | null)) {
			this.close();
		}
	};

	#handleKeydown = (event: KeyboardEvent): void => {
		const target = event.target as HTMLElement;
		const $button = this.#expandedButtons.find($expanded =>
			controlledElements($expanded).some(element => element.contains(target)),
		);

		if ($button) {
			this.#handleMenuKeydown(event, $button);
		} else {
			this.#handleTopLevelKeydown(event);
		}
	};

	#handleTopLevelKeydown(event: KeyboardEvent): void {
		const items = this.#topLevelItems;
		const target = event.target as HTMLElement;
		const index = items.indexOf(target);

		if (index === -1) {
			return;
		}

		if ('Escape' === event.key) {
			this.close();

			return;
		}

		if (!this.useArrowKeys) {
			return;
		}

		// Move focus into the submenu of an expanded button
		if ('ArrowDown' === event.key && target instanceof HTMLButtonElement && isExpanded(target)) {
			event.preventDefault();
			menuItems(target)[0]?.focus();

			return;
		}

		focusByKey(event, items, index);
	}

	#handleMenuKeydown(event: KeyboardEvent, $button: HTMLButtonElement): void {
		if ('Escape' === event.key) {
			$button.focus();
			this.close($button);

			return;
		}

		if (!this.useArrowKeys) {
			return;
		}

		const items = menuItems($button);
		const index = items.indexOf(event.target as HTMLElement);

		if (index !== -1) {
			focusByKey(event, items, index);
		}
	}
}

export default DisclosureNavigation;
export type { Detail } from './types';

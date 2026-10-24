import type { State } from './utils';
import { dispatchBeforetoggle, focusByKey, queueToggle } from './utils';

const BUTTONS = 'button[aria-expanded][aria-controls]';
const TOP_LEVEL_ITEMS = `a[href], ${BUTTONS}`;
const MENU_ITEMS = 'a[href], button:enabled, [tabindex]:not([tabindex^="-"])';

const isExpanded = ($button: HTMLButtonElement): boolean => $button.ariaExpanded === 'true';

const controlledElements = ($button: HTMLButtonElement): HTMLElement[] =>
	($button.ariaControlsElements ?? []) as HTMLElement[];

/** Whether `$node` is inside one of the submenus of `$button`. */
const controls = ($button: HTMLButtonElement, $node: Node): boolean =>
	controlledElements($button).some($element => $element.contains($node));

/** Fires `beforetoggle` at each submenu of `$button`, `false` if the opening is canceled. */
const beforetoggle = ($button: HTMLButtonElement, newState: State): boolean =>
	controlledElements($button).every($element => dispatchBeforetoggle($element, newState, $button));

/**
 * Disclosure Navigation
 *
 * Enhances a navigation whose buttons show and hide submenus. The markup is the
 * source of truth: `aria-expanded` on each button holds the state, and the submenus
 * are the elements its `aria-controls` references. The class never adds a missing
 * attribute; it only updates `aria-expanded` and `hidden` when the user interacts,
 * and fires `beforetoggle` and `toggle` at the submenus, as popovers do.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/
 * @see https://w3c.github.io/aria/#dom-ariamixin-ariacontrolselements
 *
 * @example
 * ```typescript
 * const $nav = document.querySelector('.nav');
 * const disclosureNavigation = new DisclosureNavigation($nav);
 * disclosureNavigation.init();
 * ```
 */
class DisclosureNavigation {
	$el: HTMLElement;
	useArrowKeys = true;
	#controller: AbortController | null = null;
	/** The `hidden` value of each submenu before it opened, so `until-found` survives a close. */
	#hidden = new WeakMap<HTMLElement, true | 'until-found'>();

	constructor($el: HTMLElement) {
		this.$el = $el;
	}

	/** Listens to the navigation. Call `destroy()` before calling it again. */
	init(): void {
		this.#controller = new AbortController();

		const { signal } = this.#controller;

		this.$el.addEventListener('click', this.#handleClick, { signal });
		this.$el.addEventListener('keydown', this.#handleKeydown, { signal });
		this.$el.addEventListener('focusout', this.#handleFocusout, { signal });
		this.$el.addEventListener('beforematch', this.#handleBeforematch, { signal });
	}

	/** Removes the listeners. The markup stays in its current state. */
	destroy(): void {
		this.#controller?.abort();
	}

	/**
	 * Opens the submenu of `$button` and closes the open ones outside its branch, as
	 * popovers do. Canceling its `beforetoggle` leaves every submenu as it is.
	 */
	open($button: HTMLButtonElement): void {
		if (isExpanded($button) || !beforetoggle($button, 'open')) {
			return;
		}

		const others = this.#expandedButtons.filter(
			$expanded => !controls($expanded, $button) && !controls($button, $expanded),
		);

		this.#collapse(others);
		this.#expand($button, true);
	}

	/** Closes the submenu of `$button` and the ones nested in it, or every open submenu. */
	close($button?: HTMLButtonElement): void {
		const buttons = $button
			? this.#expandedButtons.filter(
					$expanded => $expanded === $button || controls($button, $expanded),
				)
			: this.#expandedButtons;

		this.#collapse(buttons);
	}

	toggle($button: HTMLButtonElement): void {
		if (isExpanded($button)) {
			return this.close($button);
		}

		return this.open($button);
	}

	get #buttons(): HTMLButtonElement[] {
		return [...this.$el.querySelectorAll<HTMLButtonElement>(BUTTONS)];
	}

	get #expandedButtons(): HTMLButtonElement[] {
		return this.#buttons.filter(isExpanded);
	}

	/** Items inside `containers`, outside the submenus nested in them. */
	#items(containers: HTMLElement[], selector: string): HTMLElement[] {
		const submenus = this.#buttons
			.flatMap(controlledElements)
			.filter($submenu =>
				containers.some($container => $container !== $submenu && $container.contains($submenu)),
			);

		return containers
			.flatMap($container => [...$container.querySelectorAll<HTMLElement>(selector)])
			.filter($item => !submenus.some($submenu => $submenu.contains($item)));
	}

	/** Closes the submenus of `buttons`, innermost first, as nested popovers do. */
	#collapse(buttons: HTMLButtonElement[]): void {
		buttons.toReversed().forEach($button => {
			beforetoggle($button, 'closed');
			this.#expand($button, false);
		});
	}

	/**
	 * Expand
	 *
	 * Updates `aria-expanded` and `hidden`, and queues `toggle` at each submenu.
	 */
	#expand($button: HTMLButtonElement, expanded: boolean): void {
		const newState = expanded ? 'open' : 'closed';

		$button.ariaExpanded = expanded.toString();
		controlledElements($button).forEach($element => {
			queueToggle($element, newState, $button);

			if (expanded) {
				this.#hidden.set($element, $element.hidden || true);
				$element.hidden = false;

				return;
			}

			// Hiding the focused element would send focus to the body
			if ($element.matches(':focus-within')) {
				$button.focus();
			}

			$element.hidden = this.#hidden.get($element) ?? true;
		});
	}

	#handleClick = (event: MouseEvent): void => {
		const $button = (event.target as Element).closest<HTMLButtonElement>(BUTTONS);

		if ($button && this.$el.contains($button)) {
			this.toggle($button);
		}
	};

	#handleFocusout = (event: FocusEvent): void => {
		// Safari does not focus a clicked button: focus leaves for nowhere while the
		// navigation is being clicked, and the click toggles the submenu itself
		if (this.$el.contains(event.relatedTarget as Node | null) || this.$el.matches(':active')) {
			return;
		}

		this.close();
	};

	/** Find in page or fragment navigation reveals a submenu in `hidden="until-found"`. */
	#handleBeforematch = (event: Event): void => {
		const $target = event.target as HTMLElement;
		const $button = this.#buttons.find($button => controlledElements($button).includes($target));

		if (!$button) {
			return;
		}

		this.open($button);

		// The browser removes `hidden` after this event, and stops revealing the
		// ancestors when it is already gone
		$target.hidden = 'until-found';
	};

	#handleKeydown = (event: KeyboardEvent): void => {
		const $target = event.target as HTMLElement;
		// The innermost open submenu holding the focus, none at the top level
		const $button = this.#expandedButtons.findLast($expanded => controls($expanded, $target));
		const items = $button
			? this.#items(controlledElements($button), MENU_ITEMS)
			: this.#items([this.$el], TOP_LEVEL_ITEMS);
		const index = items.indexOf($target);

		if ('Escape' === event.key) {
			if (!this.#expandedButtons.length) {
				return;
			}

			// Escape is also a close request: canceling it keeps an enclosing dialog or
			// popover open, so one press closes one layer
			event.preventDefault();

			return this.close($button);
		}

		if (!this.useArrowKeys || index === -1) {
			return;
		}

		// Move focus into the submenu of an expanded button
		if ('ArrowDown' === event.key && $target instanceof HTMLButtonElement && isExpanded($target)) {
			event.preventDefault();

			return this.#items(controlledElements($target), MENU_ITEMS)[0]?.focus();
		}

		return focusByKey(event, items, index);
	};
}

export default DisclosureNavigation;

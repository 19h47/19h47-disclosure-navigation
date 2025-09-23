import keyboardNavigation from '@19h47/keyboard-navigation';
import { dispatchEvent } from './utils';

/**
 * Toggle Menu
 *
 * @param {HTMLElement} el HTML element.
 * @param {boolean} show
 *
 * @returns
 */
const toggleMenu = (el: HTMLElement, show: boolean): void => {
	if (show) {
		el.style.removeProperty('display');
	} else {
		el.style.setProperty('display', 'none');
	}
};

/**
 * Set tabindex for all focusable elements inside a menu
 *
 * @param {HTMLElement} menu
 * @param {boolean} enabled
 */
const setMenuTabIndex = (menu: HTMLElement, enabled: boolean): void => {
	const focusables = menu.querySelectorAll<HTMLElement>(
		'a, button, [tabindex]:not([tabindex="-1"])'
	);
	focusables.forEach(el => {
		if (enabled) {
			el.removeAttribute('tabindex');
		} else {
			el.setAttribute('tabindex', '-1');
		}
	});
};

/**
 * Disclosure Menu
 *
 * @see https://www.w3.org/WAI/content-assets/wai-aria-practices/patterns/disclosure/examples/js/disclosureNavigation.js
 *
 * A class to manage accessible disclosure navigation menus.
 *
 * This class handles the initialization, keyboard and mouse interactions,
 * and ARIA attributes for a navigation menu with expandable/collapsible submenus.
 * It supports keyboard navigation (arrow keys, Escape), focus management,
 * and custom event dispatching for open/close actions.
 *
 * @example
 * ```typescript
 * const nav = document.querySelector('.nav');
 * const disclosureNav = new DisclosureNavigation(nav);
 * disclosureNav.init();
 * ```
 *
 * @remarks
 * - The navigation container should contain buttons with `aria-expanded` and `aria-controls` attributes.
 * - Each button's `aria-controls` should reference the ID(s) of the controlled submenu(s).
 * - The class manages ARIA attributes, event listeners, and focus for accessibility.
 *
 * @public
 */
class DisclosureNavigation {
	el: HTMLElement;
	buttons: HTMLButtonElement[];
	children: HTMLElement[] = [];
	index: number | null = null;
	useArrowKeys: boolean = true;

	constructor(el: HTMLElement) {
		this.el = el;

		this.buttons = [
			...this.el.querySelectorAll('button[aria-expanded][aria-controls]'),
		] as HTMLButtonElement[];
	}

	init(): void {
		this.children = [];
		this.buttons.forEach($button => {
			const ids = ($button.getAttribute('aria-controls') || '').split(' ');
			for (const id of ids) {
				const $child = this.el.querySelector<HTMLElement>(`#${id}`);

				if ($child) {
					this.children.push($child);

					$button.setAttribute('aria-expanded', 'false');
					toggleMenu($child, false);
					setMenuTabIndex($child, false); // Make menu items untabbable by default

					$child.addEventListener('keydown', this.handleKeydown);
					$button.addEventListener('click', this.handleButtonClick);
					$button.addEventListener('keydown', this.handleButtonKeydown);
				}
			}
		});

		this.el.addEventListener('focusout', this.handleFocusOut);
	}

	handleFocusOut = (event: FocusEvent): void => {
		this.onBlur(event);
	};

	onBlur(event: FocusEvent): void {
		const { relatedTarget } = event;

		if (!this.el.contains(relatedTarget as Node)) {
			this.toggle(this.index as number, false);
		}
	}

	handleButtonClick = (event: MouseEvent): void => {
		const { currentTarget } = event;
		const index = this.buttons.indexOf(currentTarget as HTMLButtonElement);

		const expanded =
			(currentTarget as HTMLElement).getAttribute('aria-expanded') === 'true';

		this.toggle(index, !expanded);
	};

	handleButtonKeydown = (event: KeyboardEvent): number | boolean | void => {
		const { key } = event;
		const index = this.buttons.indexOf(document.activeElement as HTMLButtonElement);

		// Close on escape
		if ('Escape' === key) {
			return this.toggle(this.index, false);
		}

		// Move focus into the open menu if the current menu is open
		if (this.useArrowKeys && this.index === index && 'ArrowDown' === key) {
			event.preventDefault();

			return this.children[this.index]?.querySelector('a')?.focus();
		}

		// Handle arrow key navigation between top-level buttons, if set
		return this.useArrowKeys && keyboardNavigation(event, this.buttons, index);
	};

	handleKeydown = (event: KeyboardEvent): number | boolean | void => {
		if (null === this.index) {
			return true;
		}

		const { key } = event;
		const links = [
			...this.children[this.index]?.querySelectorAll(
				'a, button, [tabindex]:not([tabindex="-1"])',
			),
		];
		const index = links.findIndex(link => link === document.activeElement);

		// Close on escape
		if ('Escape' === key) {
			this.buttons[this.index]?.focus();

			return this.toggle(this.index, false);
		}

		// Handle arrow key navigation within menu links, if set
		return this.useArrowKeys && keyboardNavigation(event, links, index);
	};

	/**
	 * Toggle
	 *
	 * @param {number|null} index
	 * @param {boolean} expanded
	 */
	toggle(index: number | null, expanded: boolean): void {
		// Close open menu, if applicable
		if (this.index !== index && this.index !== null) {
			const prevIndex = this.index;
			this.index = null;
			if (prevIndex !== null && this.buttons[prevIndex]) {
				this.buttons[prevIndex].setAttribute('aria-expanded', 'false');
				toggleMenu(this.children[prevIndex], false);
				setMenuTabIndex(this.children[prevIndex], false); // Make previous menu untabbable
				dispatchEvent(
					this.el,
					{ index: prevIndex, button: this.buttons[prevIndex], child: this.children[prevIndex] },
					'close',
				);
			}
		}

		// Handle menu at called index
		if (index !== null && this.children[index]) {
			this.buttons[index].setAttribute('aria-expanded', expanded ? 'true' : 'false');
			toggleMenu(this.children[index], expanded);
			setMenuTabIndex(this.children[index], expanded); // Only open menu is tabbable

			dispatchEvent(
				this.el,
				{ index, button: this.buttons[index], child: this.children[index] },
				expanded ? 'open' : 'close',
			);
		}

		this.index = expanded ? index : null;
	}

	destroy(): void {
		this.buttons.forEach(($button, i) => {
			const ids = ($button.getAttribute('aria-controls') || '').split(' ');
			for (const id of ids) {
				const $child = this.el.querySelector<HTMLElement>(`#${id}`);
				if ($child) {
					$child.removeEventListener('keydown', this.handleKeydown);
				}
			}
			$button.removeEventListener('click', this.handleButtonClick);
			$button.removeEventListener('keydown', this.handleButtonKeydown);
		});
		this.el.removeEventListener('focusout', this.handleFocusOut);
		this.children = [];
		this.index = null;
	}
}

export default DisclosureNavigation;

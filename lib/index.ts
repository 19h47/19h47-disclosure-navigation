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
 * Disclosure Menu
 *
 * @see https://www.w3.org/WAI/content-assets/wai-aria-practices/patterns/disclosure/examples/js/disclosureNavigation.js
 */
class DisclosureNavigation {
	el: HTMLElement;
	buttons: HTMLButtonElement[];
	children: HTMLElement[] = [];
	index: number | null = null;
	useArrowKeys: boolean = true;

	/**
	 * Constructor
	 *
	 * @param {HTMLElement} el
	 */
	constructor(el: HTMLElement) {
		this.el = el;

		this.buttons = [
			...this.el.querySelectorAll('button[aria-expanded][aria-controls]'),
		] as HTMLButtonElement[];
	}

	// Add mouseout event listener in init
	init(): void {
		this.buttons.forEach($button => {
			const id = $button.getAttribute('aria-controls');
			const $child = this.el.querySelector<HTMLElement>(`#${id}`);

			if ($child) {
				this.children.push($child);

				$button.setAttribute('aria-expanded', 'false');
				toggleMenu($child, false);

				$child.addEventListener('keydown', this.onMenuKeydown);
				$button.addEventListener('click', this.onButtonClick);
				$button.addEventListener('keydown', this.onButtonKeydown);
			}
		});

		this.el.addEventListener('focusout', (e: FocusEvent) => this.onBlur(e));
	}

	// close(): void {
	// 	this.toggle(this.index, false);
	// }

	/**
	 * On Blur
	 *
	 * @param {FocusEvent} event
	 */
	onBlur(event: FocusEvent): void {
		const { relatedTarget } = event;
		console.log(
			'DisclosureNaviation.onBlur',
			this.el,
			relatedTarget,
			!this.el.contains(relatedTarget as Node),
		);

		if (!this.el.contains(relatedTarget as Node)) {
			this.toggle(this.index as number, false);
		}
	}

	/**
	 * On Button Click
	 *
	 * @param {MouseEvent} event
	 */
	onButtonClick = (event: MouseEvent): void => {
		const { currentTarget } = event;

		const index = this.buttons.indexOf(currentTarget as never);
		const expanded = JSON.parse(
			(currentTarget as HTMLElement).getAttribute('aria-expanded') || 'false',
		);

		this.toggle(index, !expanded);
	};

	/**
	 * On Button Keydown
	 *
	 * @param {KeyboardEvent} event
	 *
	 * @returns
	 */
	onButtonKeydown = (event: KeyboardEvent): any => {
		const { key } = event;
		const index = this.buttons.indexOf(document.activeElement as never);

		// console.log('onButtonKeydown', key);

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

	/**
	 * On Menu Keydown
	 *
	 * @param {KeyboardEvent} event
	 *
	 * @returns
	 */
	onMenuKeydown = (event: KeyboardEvent): any => {
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
		console.log('toggle', this.index, index, expanded);

		// Close open menu, if applicable
		if (this.index !== index) {
			// console.log('close');
			this.toggle(this.index as number, false);
		}

		// Handle menu at called index
		if (index !== null && this.buttons[index]) {
			this.index = expanded ? index : null;

			this.buttons[index].setAttribute('aria-expanded', expanded.toString());

			toggleMenu(this.children[index], expanded);

			dispatchEvent(
				this.el,
				{ index, button: this.buttons[index], child: this.children[index] },
				expanded ? 'open' : 'close',
			);
		}
	}

	// updateKeyControls(useArrowKeys: boolean): void {
	// 	this.useArrowKeys = useArrowKeys;
	// }
}

export default DisclosureNavigation;

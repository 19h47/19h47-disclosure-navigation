
import keyboardNavigation from '@19h47/keyboard-navigation';

/**
 * Toggle Menu
 *
 * @param {HTMLElement} domNode
 * @param {boolean} show
 *
 * @returns
 */
const toggleMenu = (domNode: HTMLElement, show: boolean): string | void => {
	if (show) {
		return domNode?.style.removeProperty('display');
	}

	return domNode?.style.setProperty('display', 'none');
};

// TODO: Remove ts-ignore

/**
 * Disclosure Menu
 *
 * @see https://www.w3.org/WAI/content-assets/wai-aria-practices/patterns/disclosure/examples/js/disclosureMenu.js
 */
class DisclosureMenu {
	el: HTMLElement;
	buttons: HTMLButtonElement[] | [];
	children: HTMLElement[];
	index: number | null;
	useArrowKeys: boolean;

	/**
	 * Constructor
	 *
	 * @param {HTMLElement} el
	 */
	constructor(el: HTMLElement) {
		this.el = el;
		this.buttons = [...this.el.querySelectorAll('button[aria-expanded][aria-controls]')] as HTMLButtonElement[];
		this.children = [];
		this.index = null;
		this.useArrowKeys = true;
	}

	/**
	 * Init
	 */
	init() {
		this.buttons.forEach($button => {
			const id = $button.getAttribute('aria-controls');
			const $child = this.el.querySelector<HTMLElement>(`#${id}`);

			if ($child) {
				// save ref controlled menu

				this.children.push($child);

				// Collapse menus
				$button.setAttribute('aria-expanded', 'false');
				toggleMenu($child, false);

				// Attach event listeners

				$child.addEventListener('keydown', (e: KeyboardEvent) => this.onMenuKeydown(e));
				$button.addEventListener('click', (e: MouseEvent) => this.onButtonClick(e));
				$button.addEventListener('keydown', (e: KeyboardEvent) => this.onButtonKeydown(e));
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

		// @ts-ignore
		if (!this.el.contains(relatedTarget)) {
			this.toggle(this.index as number, false);
		}
	}

	/**
	 * On Button Click
	 *
	 * @param {MouseEvent} event
	 */
	onButtonClick(event: MouseEvent): void {
		const { target } = event;

		// @ts-ignore
		const index = this.buttons.indexOf(target);
		// @ts-ignore
		const expanded = true === JSON.parse(target.getAttribute('aria-expanded'));

		// console.log('click',index, expanded);

		this.toggle(index, !expanded);
	}

	/**
	 * On Button Keydown
	 *
	 * @param {KeyboardEvent} event
	 *
	 * @returns
	 */
	onButtonKeydown(event: KeyboardEvent): boolean | void {
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
	}

	/**
	 * On Menu Keydown
	 *
	 * @param {KeyboardEvent} event
	 *
	 * @returns
	 */
	onMenuKeydown(event: KeyboardEvent): boolean | void {
		if (null === this.index) {
			return true;
		}

		const { key } = event;
		const links = [...this.children[this.index]?.querySelectorAll('a')];
		const index = links?.indexOf(document.activeElement as HTMLAnchorElement);

		// Close on escape
		if ('Escape' === key) {
			this.buttons[this.index]?.focus();

			return this.toggle(this.index, false);
		}

		// Handle arrow key navigation within menu links, if set
		return this.useArrowKeys && keyboardNavigation(event, links, index);
	}

	/**
	 * Toggle
	 *
	 * @param {number|null} index
	 * @param {boolean} expanded
	 */
	toggle(index: number | null, expanded: boolean): void {
		// console.log('toggle', this.index, index, expanded);

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
		}
	}

	// updateKeyControls(useArrowKeys: boolean): void {
	// 	this.useArrowKeys = useArrowKeys;
	// }
}

export default DisclosureMenu;

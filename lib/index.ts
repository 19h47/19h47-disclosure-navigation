// @ts-ignore
import keyboardNavigation from '@19h47/keyboard-navigation';

const toggleMenu = (domNode: HTMLElement, show: boolean): string | void => {
	if (show) {
		return domNode?.style.removeProperty('display');
	}

	return domNode?.style.setProperty('display', 'none');
};

// TODO: Remove ts-ignore

/**
 * DisclosureMenu
 *
 * @see https://www.w3.org/TR/wai-aria-practices/examples/disclosure/js/disclosureMenu.js
 */
class DisclosureMenu {
	el: HTMLElement;
	buttons: HTMLButtonElement[] | [];
	children: HTMLElement[] | [];
	index: number | null;
	useArrowKeys: boolean;

	constructor(el: HTMLElement) {
		this.el = el;
		this.buttons = [...this.el.querySelectorAll('button[aria-expanded][aria-controls]')] as
			| HTMLButtonElement[]
			| [];
		this.children = [];
		this.index = null;
		this.useArrowKeys = true;
	}

	init() {
		this.buttons.forEach($button => {
			const id = $button.getAttribute('aria-controls');
			const $child = this.el.querySelector<HTMLDivElement>(`#${id}`)!;

			if ($child) {
				// save ref controlled menu
				// @ts-ignore
				this.children.push($child);

				// Collapse menus
				$button.setAttribute('aria-expanded', 'false');
				toggleMenu($child, false);

				// Attach event listeners
				// @ts-ignore
				$child.addEventListener('keydown', e => this.onMenuKeydown(e));
				// @ts-ignore
				$button.addEventListener('click', e => this.onButtonClick(e));
				// @ts-ignore
				$button.addEventListener('keydown', e => this.onButtonKeydown(e));
			}
		});
		// @ts-ignore
		this.el.addEventListener('focusout', e => this.onBlur(e));
	}

	// close(): void {
	// 	this.toggle(this.index, false);
	// }

	// @ts-ignore
	onBlur({ relatedTarget }): void {
		// @ts-ignore
		if (!this.el.contains(relatedTarget) && null !== this.index) {
			// @ts-ignore
			this.toggle(this.index, false);
		}
	}

	// @ts-ignore
	onButtonClick({ target }): void {
		// @ts-ignore
		const index = this.buttons.indexOf(target);
		const expanded = true === JSON.parse(target.getAttribute('aria-expanded'));

		this.toggle(index, !expanded);
	}

	// @ts-ignore
	onButtonKeydown(event): boolean | void {
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

	// @ts-ignore
	onMenuKeydown(event): boolean | void {
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

	toggle(index: number | null, expanded: boolean): void {
		// console.log('toggle', this.index, index, expanded);

		// Close open menu, if applicable
		if (this.index !== index) {
			this.toggle(this.index as number, false);
		}

		// Handle menu at called index
		// @ts-ignore
		if (this.buttons[index]) {
			this.index = expanded ? index : null;
			// @ts-ignore
			this.buttons[index].setAttribute('aria-expanded', expanded.toString());

			// @ts-ignore
			toggleMenu(this.children[index], expanded);
		}
	}

	// updateKeyControls(useArrowKeys: boolean): void {
	// 	this.useArrowKeys = useArrowKeys;
	// }
}

export default DisclosureMenu;

// @ts-ignore
import { ESCAPE } from '@19h47/keycode';
// @ts-ignore
import keyboardNavigation from '@19h47/keyboard-navigation';

const toggleMenu = (domNode: HTMLElement, show: boolean) => {
	if (domNode) {
		if (show) {
			domNode.style.removeProperty('display');
		} else {
			domNode.style.setProperty('display', 'none');
		}
	}
};

/**
 * DisclosureMenu
 *
 * @see https://www.w3.org/TR/wai-aria-practices/examples/disclosure/js/disclosureMenu.js
 */
class DisclosureMenu {
	el: HTMLElement;
	buttons: HTMLElement[] | [];
	children: HTMLElement[] | [];
	index: number | null;
	useArrowKeys: boolean;

	constructor(el: HTMLElement) {
		this.el = el;
		this.buttons = [...this.el.querySelectorAll('button[aria-expanded][aria-controls]')] as
			| HTMLElement[]
			| [];
		this.children = [];
		this.index = null;
		this.useArrowKeys = true;
	}

	init() {
		this.buttons.forEach($button => {
			const id = $button.getAttribute('aria-controls');
			const $child = this.el.querySelector(`#${id}`) as HTMLElement;

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

	close() {
		// @ts-ignore
		this.toggleExpand(this.index, false);
	}
	// @ts-ignore
	onBlur({ relatedTarget }) {
		// @ts-ignore
		if (!this.el.contains(relatedTarget) && null !== this.index) {
			// @ts-ignore
			this.toggleExpand(this.index, false);
		}
	}
	// @ts-ignore
	onButtonClick({ target }) {
		// @ts-ignore
		const index = this.buttons.indexOf(target);
		const expanded = true === JSON.parse(target.getAttribute('aria-expanded'));

		this.toggleExpand(index, !expanded);
	}
	// @ts-ignore
	onButtonKeydown(event) {
		const { key } = event;
		// @ts-ignore
		const index = this.buttons.indexOf(document.activeElement);

		console.log('onButtonKeydown', key);

		// Close on escape
		if ('Escape' === key) {
			// @ts-ignore
			this.toggleExpand(this.index, false);
		}

		// Move focus into the open menu if the current menu is open
		else if (this.useArrowKeys && this.index === index && 'ArrowDown' === key) {
			event.preventDefault();

			this.children[this.index]?.querySelector('a')?.focus();
		}

		// Handle arrow key navigation between top-level buttons, if set
		else if (this.useArrowKeys) {
			return keyboardNavigation(event, this.buttons, index);
		}

		return true;
	}
	// @ts-ignore
	onMenuKeydown(event) {
		if (null === this.index) {
			return true;
		}

		const { key } = event;
		const links = [...this.children[this.index]?.querySelectorAll('a')];
		// @ts-ignore
		const index = links.indexOf(document.activeElement);

		// Close on escape
		if ('Escape' === key) {
			this.buttons[this.index]?.focus();

			return this.toggleExpand(this.index, false);
		}

		// Handle arrow key navigation within menu links, if set
		if (this.useArrowKeys) {
			return keyboardNavigation(event, links, index);
		}

		return true;
	}

	toggleExpand(index: number, expanded: boolean) {
		// console.log('toggleExpand', this.index, index, expanded);

		// Close open menu, if applicable
		if (this.index !== index) {
			// @ts-ignore
			this.toggleExpand(this.index, false);
		}

		// Handle menu at called index
		// @ts-ignore
		if (this.buttons[index]) {
			this.index = expanded ? index : null;
			this.buttons[index].setAttribute('aria-expanded', expanded.toString());

			toggleMenu(this.children[index], expanded);
		}
	}
	// @ts-ignore
	updateKeyControls(useArrowKeys: boolean) {
		this.useArrowKeys = useArrowKeys;
	}
}

export default DisclosureMenu;

import { ARROW_DOWN, ESCAPE } from '@19h47/keycode';
import { state, keyboardNavigation } from '@19h47/keyboard-navigation';

console.log(state, keyboardNavigation);

const toggleMenu = (domNode, show) => {
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
	constructor(el) {
		this.el = el;
		this.buttons = [...this.el.querySelectorAll('button[aria-expanded][aria-controls]')];
		this.children = [];
		this.index = null;
		this.useArrowKeys = true;
	}

	init() {
		this.buttons.forEach($button => {
			const id = $button.getAttribute('aria-controls');
			const $child = this.el.querySelector(`#${id}`);

			if ($child) {
				// save ref controlled menu
				this.children.push($child);

				// collapse menus
				$button.setAttribute('aria-expanded', false);
				toggleMenu($child, false);

				// attach event listeners
				$child.addEventListener('keydown', e => this.onMenuKeydown(e));

				$button.addEventListener('click', e => this.onButtonClick(e));
				$button.addEventListener('keydown', e => this.onButtonKeydown(e));
			}
		});

		this.el.addEventListener('focusout', e => this.onBlur(e));
	}

	close() {
		this.toggleExpand(this.index, false);
	}

	onBlur({ relatedTarget }) {
		if (!this.el.contains(relatedTarget) && null !== this.index) {
			this.toggleExpand(this.index, false);
		}
	}

	onButtonClick({ target }) {
		const index = this.buttons.indexOf(target);
		const expanded = true === JSON.parse(target.getAttribute('aria-expanded'));

		this.toggleExpand(index, !expanded);
	}

	onButtonKeydown(event) {
		const key = event.keyCode || event.which;
		const index = this.buttons.indexOf(document.activeElement);

		// close on escape
		if (ESCAPE === key) {
			this.toggleExpand(this.index, false);
		}

		// move focus into the open menu if the current menu is open
		else if (this.useArrowKeys && this.index === index && ARROW_DOWN === key) {
			event.preventDefault();
			this.children[this.index].querySelector('a').focus();
		}

		// handle arrow key navigation between top-level buttons, if set
		else if (this.useArrowKeys) {
			keyboardNavigation(event, this.buttons, index);
		}
	}

	onMenuKeydown(event) {
		const key = event.keyCode || event.which;

		if (null === this.index) {
			return;
		}

		const links = [...this.children[this.index].querySelectorAll('a')];
		const index = links.indexOf(document.activeElement);

		// close on escape
		if (ESCAPE === key) {
			this.buttons[this.index].focus();
			this.toggleExpand(this.index, false);
		}

		// handle arrow key navigation within menu links, if set
		else if (this.useArrowKeys) {
			keyboardNavigation(event, links, index);
		}
	}

	toggleExpand(index, expanded) {
		console.log('toggleExpand', this.index, index, expanded);

		// close open menu, if applicable
		if (this.index !== index) {
			this.toggleExpand(this.index, false);
		}

		// handle menu at called index
		if (this.buttons[index]) {
			this.index = expanded ? index : null;
			this.buttons[index].setAttribute('aria-expanded', expanded);

			toggleMenu(this.children[index], expanded);
		}
	}

	updateKeyControls(useArrowKeys) {
		this.useArrowKeys = useArrowKeys;
	}
}

export default DisclosureMenu;

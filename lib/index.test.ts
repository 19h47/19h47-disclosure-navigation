import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import DisclosureNavigation from './index';

const markup = `
	<nav id="nav" aria-label="Main">
		<ul>
			<li><a id="home" href="#home">Home</a></li>
			<li>
				<button id="about" type="button" aria-expanded="false" aria-controls="about-menu">About</button>
				<ul id="about-menu" hidden>
					<li><a id="overview" href="#overview">Overview</a></li>
					<li><a id="team" href="#team">Team</a></li>
					<li><a id="history" href="#history">History</a></li>
				</ul>
			</li>
			<li>
				<button id="services" type="button" aria-expanded="false" aria-controls="1-services">Services</button>
				<ul id="1-services" hidden>
					<li><a id="design" href="#design">Design</a></li>
					<li><input id="search" type="search" aria-label="Search" /></li>
				</ul>
			</li>
		</ul>
	</nav>
	<button id="outside" type="button">Outside</button>
`;

let disclosureNavigation: DisclosureNavigation | null = null;

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
	const $element = document.getElementById(id);

	if (!$element) {
		throw new Error(`No element with id ${id}`);
	}

	return $element as T;
};

const mount = (html = markup): DisclosureNavigation => {
	document.body.innerHTML = html;
	disclosureNavigation = new DisclosureNavigation($('nav'));
	disclosureNavigation.init();

	return disclosureNavigation;
};

const press = async ($element: HTMLElement, key: string): Promise<void> => {
	$element.focus();
	await userEvent.keyboard(`{${key}}`);
};

const expectExpanded = (button: string, menu: string, expanded: boolean): void => {
	expect($(button).getAttribute('aria-expanded')).toBe(expanded.toString());
	expect($(menu).hidden).toBe(!expanded);
};

afterEach(() => {
	disclosureNavigation?.destroy();
	disclosureNavigation = null;
	document.body.innerHTML = '';
});

describe('markup', () => {
	it('leaves the markup untouched on init', () => {
		const html = markup
			.replace('aria-expanded="false" aria-controls="about-menu"', 'aria-expanded="true" aria-controls="about-menu"')
			.replace('<ul id="about-menu" hidden>', '<ul id="about-menu">');

		document.body.innerHTML = html;
		expectExpanded('about', 'about-menu', true);

		const before = document.body.innerHTML;

		disclosureNavigation = new DisclosureNavigation($('nav'));
		disclosureNavigation.init();

		expect(document.body.innerHTML).toBe(before);
	});

	it('resolves aria-controls IDs that start with a digit', async () => {
		mount();
		await userEvent.click($('services'));

		expectExpanded('services', '1-services', true);
	});
});

describe('click', () => {
	it('opens and closes a submenu', async () => {
		mount();

		await userEvent.click($('about'));
		expectExpanded('about', 'about-menu', true);

		await userEvent.click($('about'));
		expectExpanded('about', 'about-menu', false);
	});

	it('closes the open submenu when another one opens', async () => {
		mount();

		await userEvent.click($('about'));
		await userEvent.click($('services'));

		expectExpanded('about', 'about-menu', false);
		expectExpanded('services', '1-services', true);
	});
});

describe('events', () => {
	it('fires on the button, bubbles, and runs before the DOM changes', async () => {
		mount();

		const $nav = $('nav');
		const events: string[] = [];

		$nav.addEventListener('disclosure-navigation:open', event => {
			events.push(event.type);

			expect(event.target).toBe($('about'));
			expect(event.detail.$button).toBe($('about'));
			expect(event.detail.elements).toEqual([$('about-menu')]);
			expect($('about-menu').hidden).toBe(true);
		});
		$nav.addEventListener('disclosure-navigation:close', event => {
			events.push(event.type);

			expect($('about-menu').hidden).toBe(false);
		});

		await userEvent.click($('about'));
		await userEvent.click($('about'));

		expect(events).toEqual(['disclosure-navigation:open', 'disclosure-navigation:close']);
	});

	it('cancels the change when a listener calls preventDefault()', async () => {
		mount();

		const $nav = $('nav');

		$nav.addEventListener('disclosure-navigation:open', event => event.preventDefault());
		await userEvent.click($('about'));

		expectExpanded('about', 'about-menu', false);
	});

	it('keeps the open submenu when its close is canceled', async () => {
		mount();

		const $nav = $('nav');

		await userEvent.click($('about'));
		$nav.addEventListener('disclosure-navigation:close', event => event.preventDefault());
		await userEvent.click($('services'));

		expectExpanded('about', 'about-menu', true);
		expectExpanded('services', '1-services', false);
	});
});

describe('keyboard', () => {
	it('closes the submenu and focuses its button on Escape inside it', async () => {
		mount();
		await userEvent.click($('about'));

		await press($('team'), 'Escape');

		expectExpanded('about', 'about-menu', false);
		expect(document.activeElement).toBe($('about'));
	});

	it('closes the open submenu on Escape on a top-level item', async () => {
		mount();
		await userEvent.click($('about'));

		await press($('services'), 'Escape');

		expectExpanded('about', 'about-menu', false);
	});

	it('moves focus into the submenu on ArrowDown on an expanded button', async () => {
		mount();
		await userEvent.click($('about'));

		await press($('about'), 'ArrowDown');

		expect(document.activeElement).toBe($('overview'));
	});

	it('moves between top-level items, wrapping, with Home and End', async () => {
		mount();
		await userEvent.click($('about'));

		await press($('home'), 'ArrowRight');
		expect(document.activeElement).toBe($('about'));

		await userEvent.keyboard('{ArrowLeft}');
		await userEvent.keyboard('{ArrowLeft}');
		expect(document.activeElement).toBe($('services'));

		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe($('home'));

		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe($('services'));
	});

	it('moves between submenu items', async () => {
		mount();
		await userEvent.click($('about'));

		await press($('overview'), 'ArrowDown');
		expect(document.activeElement).toBe($('team'));

		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe($('history'));

		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe($('overview'));
	});

	it('leaves arrow keys to text fields', async () => {
		mount();
		await userEvent.click($('services'));

		await press($('search'), 'ArrowDown');

		expect(document.activeElement).toBe($('search'));
	});

	it('leaves arrow keys pressed with a modifier to the browser', () => {
		mount();
		$('home').focus();

		const event = new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true });

		$('home').dispatchEvent(event);

		expect(event.defaultPrevented).toBe(false);
		expect(document.activeElement).toBe($('home'));
	});

	it('ignores arrow keys when useArrowKeys is false', async () => {
		const instance = mount();

		instance.useArrowKeys = false;
		await press($('home'), 'ArrowRight');

		expect(document.activeElement).toBe($('home'));
	});
});

describe('focus', () => {
	it('closes the open submenu when focus leaves the navigation', async () => {
		mount();
		await userEvent.click($('about'));

		$('team').focus();
		$('outside').focus();

		expectExpanded('about', 'about-menu', false);
	});

	it('keeps the submenu open while focus stays inside the navigation', async () => {
		mount();
		await userEvent.click($('about'));

		$('team').focus();
		$('home').focus();

		expectExpanded('about', 'about-menu', true);
	});
});

describe('API', () => {
	it('opens, closes and toggles a submenu', () => {
		const instance = mount();

		instance.open($('about'));
		expectExpanded('about', 'about-menu', true);

		instance.toggle($('services'));
		expectExpanded('about', 'about-menu', false);
		expectExpanded('services', '1-services', true);

		instance.close();
		expectExpanded('services', '1-services', false);
	});

	it('removes the listeners on destroy() and keeps the markup state', async () => {
		const instance = mount();

		await userEvent.click($('about'));
		instance.destroy();
		await userEvent.click($('about'));

		expectExpanded('about', 'about-menu', true);
	});
});

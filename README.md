[![](https://img.shields.io/npm/v/@19h47/disclosure-navigation)](https://www.npmjs.com/package/@19h47/disclosure-navigation)
[![](https://img.shields.io/npm/dm/@19h47/disclosure-navigation)](https://www.npmjs.com/package/@19h47/disclosure-navigation)

# @19h47/disclosure-navigation

> Accessible WAI-ARIA disclosure navigation, enhancing the markup you write.

Keyboard support and open/close state for a site navigation whose buttons show and
hide submenus. Implementation follows the
[WAI-ARIA Authoring Practices disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/).

- **Navigation, not a menu.** A site navigation is a list of links. Buttons announce
  _collapsed_ or _expanded_, links stay links. The ARIA `menu` role is meant for
  application menus.
- **Your HTML is the source of truth.** The library reads `aria-expanded` and
  `aria-controls`, and never adds a missing attribute.
- **Built on the platform.** Native `<button>`, the `hidden` attribute,
  [`ariaControlsElements`](https://developer.mozilla.org/en-US/docs/Web/API/Element/ariaControlsElements),
  `AbortController`.
- **Small and typed.** About 1 kB gzipped, no dependency, TypeScript declarations included.

See the [documentation](https://19h47.github.io/19h47-disclosure-navigation/) for live
examples.

## Installation

```bash
npm install @19h47/disclosure-navigation
```

## Usage

```html
<nav class="disclosure-nav" aria-label="Main">
	<ul>
		<li><a href="/">Home</a></li>
		<li>
			<button type="button" aria-expanded="false" aria-controls="about-menu">About</button>
			<ul id="about-menu" hidden>
				<li><a href="/about/overview">Overview</a></li>
				<li><a href="/about/team" aria-current="page">Team</a></li>
			</ul>
		</li>
	</ul>
</nav>
```

```js
import DisclosureNavigation from '@19h47/disclosure-navigation';

const $nav = document.querySelector('.disclosure-nav');
const disclosureNavigation = new DisclosureNavigation($nav);

disclosureNavigation.init();
```

> **HTML is the source of truth.** `init()` only adds listeners. The library does not
> set a missing `aria-expanded`, `hidden` or label, nor warns about them. Use an
> accessibility linter (axe-core, Lighthouse) to catch invalid markup.

### Required markup

| Attribute       | On          | Role                                                                                   |
| --------------- | ----------- | -------------------------------------------------------------------------------------- |
| `aria-expanded` | `<button>`  | **Required.** The state. A button without it is ignored. The library updates it.       |
| `aria-controls` | `<button>`  | **Required.** ID(s) of the submenu(s), inside the navigation. Several IDs work together. |
| `hidden`        | Submenu     | Present while collapsed. The library updates it.                                        |
| `aria-label`    | `<nav>`     | Names the landmark when the page has more than one navigation.                          |
| `aria-current`  | `<a>`       | Optional: marks the current page.                                                       |

To render a submenu open, write `aria-expanded="true"` on its button and leave out
`hidden`.

### Styling

Style the state the library writes:

```css
button[aria-expanded='true']::after {
	rotate: 225deg;
}

.submenu[hidden] {
	display: none; /* Needed only if your CSS gives .submenu a display value */
}
```

## Keyboard

| Key                 | Focus on                 | Action                                          |
| ------------------- | ------------------------ | ----------------------------------------------- |
| Tab / Shift + Tab   | Anywhere                 | Native order. Collapsed submenus are skipped.   |
| Enter / Space       | Button                   | Toggles its submenu (native button activation). |
| Escape              | Button or top-level link | Closes the open submenu.                        |
| Escape              | Submenu                  | Closes it and moves focus back to its button.   |
| ArrowDown           | Expanded button          | Moves focus to the first item of its submenu.   |
| Arrow keys          | Top-level item           | Previous or next button or link, wrapping.      |
| Arrow keys          | Submenu item             | Previous or next item, wrapping.                |
| Home / End          | Top-level or submenu item | First or last item.                            |

Moving focus out of the navigation closes the open submenu. Keys pressed with Alt, Ctrl
or Meta are left to the browser, and so are arrow keys in a text field.

## API

| Member                         | Description                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `new DisclosureNavigation(el)` | `el` is the navigation. Buttons are found inside it with `button[aria-expanded][aria-controls]`. |
| `init()`                       | Listens to `click`, `keydown` and `focusout` on `el`. Calling it again rebinds once.         |
| `destroy()`                    | Removes the listeners. The markup stays in its current state.                                |
| `open($button)`                | Closes the open submenu, then opens the one of `$button`.                                    |
| `close($button?)`              | Closes the submenu of `$button`, or every open submenu.                                      |
| `toggle($button)`              | Opens or closes the submenu of `$button`.                                                    |
| `useArrowKeys`                 | Enables arrow, Home and End keys. Defaults to `true`.                                        |

Buttons are read from the DOM on each interaction: adding or removing items needs no
call. Closing the submenu once a link is followed is up to you:

```js
disclosureNavigation.el.addEventListener('click', ({ target }) => {
	if (target.closest('a')) {
		disclosureNavigation.close();
	}
});
```

## Events

| Event                         | Cancelable | Detail                  |
| ----------------------------- | ---------- | ----------------------- |
| `disclosure-navigation:open`  | Yes        | `{ $button, elements }` |
| `disclosure-navigation:close` | Yes        | `{ $button, elements }` |

Events fire on the button **before** the DOM changes and bubble, so one listener on the
navigation is enough. Call `preventDefault()` to cancel the change.

```js
$nav.addEventListener('disclosure-navigation:open', event => {
	const { $button, elements } = event.detail;

	if ('services' === $button.id) {
		event.preventDefault();
	}
});
```

In TypeScript, both events are declared on `HTMLElementEventMap`, and the `Detail`
type is exported.

## Browser support

Submenus are resolved with
[`ariaControlsElements`](https://developer.mozilla.org/en-US/docs/Web/API/Element/ariaControlsElements):
Chrome and Edge 135, Firefox 136, Safari 16.4. The package is an ES module.

## Migration

### From 3.x to 4.0

1. **Write the initial state in your HTML.** 3.x forced `aria-expanded="false"` and hid
   every submenu at `init()`. 4.0 writes nothing at `init()`: add `aria-expanded` with
   the real state on each button, and `hidden` on each collapsed submenu.

   ```diff
   - <ul id="about-menu">
   + <ul id="about-menu" hidden>
   ```

2. **Check your CSS for `display`.** Submenus are hidden with `hidden` instead of an
   inline `style="display: none"`. If your CSS gives a submenu a `display` value, add
   `[hidden] { display: none; }` for it.
3. **Stop relying on `tabindex="-1"`.** 3.x set it on the items of collapsed submenus
   and removed your own `tabindex` values. 4.0 leaves `tabindex` alone: `hidden`
   already keeps collapsed items out of the tab order.
4. **Update event listeners.** Events now fire on the button and bubble, so listeners
   on the navigation keep working. They run before the DOM changes and can be canceled.

   ```diff
     $nav.addEventListener('disclosure-navigation:open', ({ detail }) => {
   -   const { index, button, child } = detail;
   +   const { $button, elements } = detail;
     });
   ```

5. **Replace `toggle(index, expanded)`.**

   ```diff
   - disclosureNavigation.toggle(0, true);
   + disclosureNavigation.open($button);
   - disclosureNavigation.toggle(disclosureNavigation.index, false);
   + disclosureNavigation.close();
   ```

6. **Read the state from the DOM.** The public `buttons`, `children` and `index` fields
   are removed. Query `button[aria-expanded="true"]` in the navigation instead.
7. **Import the ES module.** The UMD build (`dist/disclosure-navigation.umd.cjs`) is
   removed. Import `@19h47/disclosure-navigation` with a bundler or as a native module.

## Development

```bash
pnpm install
pnpm dev          # Documentation page with the library source
pnpm test         # Chromium, Firefox and WebKit
pnpm typecheck
pnpm build        # dist/
pnpm build:docs   # docs/, published by GitHub Pages
```

Publishing runs from GitHub Actions when a release is published, with
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers).

## License

[MIT](./LICENSE)

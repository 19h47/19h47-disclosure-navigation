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
  [`ToggleEvent`](https://developer.mozilla.org/en-US/docs/Web/API/ToggleEvent) as popovers
  fire it, `AbortController`.
- **Small and typed.** About 1.5 kB gzipped, no dependency, TypeScript declarations
  included. The DOM library already types the events.

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
| `hidden`        | Submenu     | Present while collapsed, or `hidden="until-found"` to keep its links searchable.        |
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

/* Needed only if your CSS gives .submenu a display value */
.submenu[hidden]:not([hidden='until-found']) {
	display: none;
}
```

Position submenus with logical properties, such as `inset-inline-start`, so they follow
the reading direction.

### Nested submenus

A submenu can hold buttons with their own submenus. Opening one keeps its parents open
and closes the other branches. Closing a submenu closes the ones nested in it.

### Find in page

Write `hidden="until-found"` on collapsed submenus and their links stay searchable. When
find in page or a link to a fragment reveals a submenu, the library opens it, nested ones
included, and keeps `until-found` when it closes again.

```html
<ul id="about-menu" hidden="until-found">…</ul>
```

A stylesheet that sets `[hidden] { display: none }` keeps the links out of the search:
Bootstrap's Reboot does, with `!important`. Restore `display` for `[hidden="until-found"]`.
The browser reveals the submenu whatever a listener does: canceling `beforetoggle`
leaves the button collapsed next to a visible submenu.

## Keyboard

| Key                 | Focus on                 | Action                                          |
| ------------------- | ------------------------ | ----------------------------------------------- |
| Tab / Shift + Tab   | Anywhere                 | Native order. Collapsed submenus are skipped.   |
| Enter / Space       | Button                   | Toggles its submenu (native button activation). |
| Escape              | Button or top-level link | Closes the open submenu.                        |
| Escape              | Submenu                  | Closes the innermost one and focuses its button. |
| ArrowDown           | Expanded button, any level | Moves focus to the first item of its submenu. |
| Arrow keys          | Top-level item           | Previous or next button or link, wrapping.      |
| Arrow keys          | Submenu item             | Previous or next item, wrapping.                |
| Home / End          | Top-level or submenu item | First or last item.                            |

Moving focus out of the navigation closes the open submenu. Keys pressed with Alt, Ctrl
or Meta are left to the browser, and so are arrow keys in a text field.

In a right-to-left context, ArrowLeft and ArrowRight swap. The library reads the
direction from the markup with `:dir(rtl)`: a `dir` attribute on the page or the
navigation is enough.

### In a dialog or a popover

Escape is also a
[close request](https://html.spec.whatwg.org/multipage/interaction.html#close-requests):
it closes the topmost dialog or popover. While a submenu is open, the library cancels
the key press, so each press closes one layer: the submenu, then the dialog. With every
submenu closed, the browser handles the key.

The library sees Escape while focus is in the navigation. Safari does not focus a
clicked button: after opening a submenu with the mouse, focus stays on the dialog and
Escape closes it.

## API

| Member                         | Description                                                                                  |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| `new DisclosureNavigation($nav)` | `$nav` is the navigation. Buttons are found inside it with `button[aria-expanded][aria-controls]`. |
| `$el`                          | The navigation passed to the constructor.                                                    |
| `init()`                       | Listens to `click`, `keydown`, `focusout` and `beforematch` on `$nav`. Call `destroy()` before calling it again. |
| `destroy()`                    | Removes the listeners. The markup stays in its current state.                                |
| `open($button)`                | Opens the submenu of `$button` and closes the other branches. Canceling its `beforetoggle` leaves every submenu as it is. |
| `close($button?)`              | Closes the submenu of `$button`, or every open submenu. Focus inside a closing submenu moves to its button. |
| `toggle($button)`              | Opens or closes the submenu of `$button`.                                                    |
| `useArrowKeys`                 | Enables arrow, Home and End keys. Defaults to `true`.                                        |

Buttons are read from the DOM on each interaction: adding or removing items needs no
call. Closing the submenu once a link is followed is up to you:

```js
$nav.addEventListener('click', event => {
	if (event.target.closest('a')) {
		disclosureNavigation.close();
	}
});
```

### Closing from outside

The open submenu closes when focus leaves the navigation. Safari does not focus a button
on click, by design: after opening a submenu with the mouse, clicking elsewhere moves no
focus and the submenu stays open. If you need it, close it yourself:

```js
document.addEventListener('click', event => {
	if (!$nav.contains(event.target)) {
		disclosureNavigation.close();
	}
});
```

## Events

The library fires the platform's events, the way a popover does: a
[`ToggleEvent`](https://developer.mozilla.org/en-US/docs/Web/API/ToggleEvent) named
`beforetoggle`, then `toggle`, at each submenu. The same listener works for `<details>`,
popovers and `<dialog>`.

| Event          | Fires                                                                                     | Cancelable             |
| -------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| `beforetoggle` | **Before** the DOM changes.                                                               | When the submenu opens. |
| `toggle`       | **After**, in a later task. Changes made before it fires coalesce into one event, from the first old state to the last new state. | No. |

`event.target` is the submenu, `event.source` its button, and `oldState` and `newState`
are `'open'` or `'closed'`. As on the platform, the events do not bubble: otherwise a
submenu's `toggle` would reach the `ontoggle` of a `<details>` or a `<dialog>` holding the
navigation. Listen on the submenu, or on the navigation in the capture phase.

```js
$nav.addEventListener(
	'beforetoggle',
	event => {
		if ('open' === event.newState && 'services' === event.source.id) {
			event.preventDefault(); // Services stays closed
		}
	},
	{ capture: true },
);

$nav.addEventListener(
	'toggle',
	event => console.log(event.target.id, event.newState),
	{ capture: true },
);
```

Canceling an opening leaves every submenu as it is, the open one included: the other
branches close after `beforetoggle`. Closing cannot be canceled. A button that controls
several elements fires at each one, and opens none of them when one opening is canceled.
In TypeScript, the DOM library already types both events as `ToggleEvent`.

## Browser support

Version 5 runs in Chrome and Edge 135, Firefox 136 and Safari 17: submenus are resolved
with
[`ariaControlsElements`](https://developer.mozilla.org/en-US/docs/Web/API/Element/ariaControlsElements)
and events are [`ToggleEvent`](https://developer.mozilla.org/en-US/docs/Web/API/ToggleEvent)s.
`event.source` needs Chrome and Edge 140, Firefox 145 and Safari 26.5: older browsers
fire the events without it.

For older browsers, stay on version 4.1, which runs from Safari 16.4, load a polyfill of
ARIA element reflection for `ariaControlsElements`, or use another library.

Find in page relies on `hidden="until-found"`: Chrome and Edge 102, Firefox 139,
Safari 26.2. Elsewhere it acts as `hidden`. The package is an ES module.

## Migration

### From 4.x to 5.0

The custom events are replaced by the platform's `beforetoggle` and `toggle`, fired the
way a popover fires them. Markup, styles and methods do not change.

1. **Listen to `beforetoggle`.** It replaces `disclosure-navigation:open` and
   `disclosure-navigation:close`, and `event.newState` tells which one happens. It fires
   at each submenu instead of the button, and does not bubble: listen on the submenu, or
   on the navigation in the capture phase. The button is `event.source`, the submenu
   `event.target`.

   ```diff
   - $nav.addEventListener('disclosure-navigation:open', event => {
   -   const { $button, elements } = event.detail;
   - });
   + $nav.addEventListener('beforetoggle', event => {
   +   if ('open' === event.newState) {
   +     const $button = event.source;
   +     const $submenu = event.target;
   +   }
   + }, { capture: true });
   ```

2. **Stop canceling closings.** As on a popover, `preventDefault()` only cancels an
   opening. The other branches now close after `beforetoggle`, so canceling an opening
   leaves the open submenu open.
3. **React after the change with `toggle`.** It is new: it fires in a later task, once for
   changes made in a row.
4. **Expect one event per element.** A button with several IDs in `aria-controls` fires
   at each element, and canceling one opening cancels them all.
5. **Expect nested submenus to close innermost first**, as nested popovers do.
6. **Drop the `Detail` type.** The `HTMLElementEventMap` declarations are removed too: the
   DOM library types `beforetoggle` and `toggle` as `ToggleEvent`.
7. **Check browser support.** Version 5 needs Safari 17, and `event.source` needs
   Chrome 140, Firefox 145 and Safari 26.5. Stay on 4.1 for older browsers.

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
   are removed. Query `button[aria-expanded="true"]` in the navigation instead. `el` is
   renamed `$el`.
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

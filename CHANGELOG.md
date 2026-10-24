# @19h47/disclosure-navigation

## 5.0.0

### Major Changes

- Events are the platform's `beforetoggle` and `toggle`, fired the way a popover fires them. See the [migration guide](./README.md#from-4x-to-50).

  - `disclosure-navigation:open` and `disclosure-navigation:close` are replaced by `beforetoggle`: a `ToggleEvent` fired at each submenu before the change, with `oldState`, `newState` and the button as `source`. It does not bubble: listen on the submenu, or on the navigation in the capture phase.
  - New `toggle` event after the change, in a later task. Changes made before it fires coalesce into one event, from the first old state to the last new state.
  - Only an opening can be canceled. The other branches now close after `beforetoggle`, so canceling an opening leaves the open submenu open.
  - A button that controls several elements fires at each one, and opens none of them when one opening is canceled.
  - Nested submenus close innermost first, as nested popovers do.
  - The `Detail` type and the `HTMLElementEventMap` declarations are removed: the DOM library types both events.
  - Browser support: Safari 17 is required for `ToggleEvent`, and `event.source` needs Chrome 140, Firefox 145 and Safari 26.5. Version 4.1 keeps running from Safari 16.4.

## 4.1.1

### Patch Changes

- Escape closes one layer at a time. In a `<dialog>` or a popover, Escape is also a close request: it used to close the open submenu and the dialog together. While a submenu is open, the library now cancels the key press, so the dialog stays open until the next Escape. With every submenu closed, the browser handles the key.
- Closing a submenu that holds the focus moves the focus to its button, whatever closes it: Escape, `close()`, or another submenu opening. The focused item used to disappear and send the focus to the page body. When a listener cancels the close, the focus stays where it is.

## 4.1.0

### Minor Changes

- Nested submenus: opening one keeps its parents open and closes the other branches, closing one closes the submenus nested in it. Arrow keys move within one level, ArrowDown on an expanded button enters its submenu at any level, and Escape closes the innermost submenu.
- Find in page: submenus can use `hidden="until-found"`. When find in page or fragment navigation reveals one, the library opens it, nested ones included, and restores `until-found` when it closes.
- Right-to-left: ArrowLeft and ArrowRight swap when the navigation reads right to left, read from the markup with `:dir(rtl)`.

### Patch Changes

- Safari: clicking the button of an open submenu while the focus is inside the navigation now closes it. Safari does not focus clicked buttons, so the submenu closed on `focusout` and the click reopened it.

## 4.0.1

### Patch Changes

- The public `el` field is renamed `$el`, following the `$` prefix of `$button`. This breaks code that reads `el`: 4.0.0 is deprecated, use 4.0.1.
- `init()` no longer calls `destroy()` first: preventing a second `init()` is up to the consumer. Call `destroy()` before calling `init()` again, otherwise `destroy()` can no longer remove the listeners bound by the first call.

## 4.0.0

### Major Changes

- HTML is the source of truth: the library enhances the markup you write and never adds a missing attribute. See the [migration guide](./README.md#migration).

  - `init()` no longer writes to the DOM: it does not force `aria-expanded="false"` nor hide submenus. Write the initial state in your HTML.
  - Submenus are hidden with the `hidden` attribute instead of an inline `display: none`.
  - Items of collapsed submenus no longer get `tabindex="-1"`: `hidden` already removes them from the tab order, and author `tabindex` values are kept.
  - Submenus are resolved with `Element.ariaControlsElements`, so IDs need no escaping (an ID starting with a digit used to throw). Each button maps to its own submenus: a missing target no longer shifts the other menus.
  - Events fire on the button, bubble, and run before the DOM changes. `preventDefault()` cancels the change. `event.detail` is now `{ $button, elements }` instead of `{ index, button, child }`.
  - `toggle(index, expanded)` is replaced by `open($button)`, `close($button?)` and `toggle($button)`. The public `buttons`, `children` and `index` fields are removed: read `aria-expanded` on the buttons. Event handlers are private.
  - `init()` binds the listeners once with an `AbortController`, even when called twice. `destroy()` removes them and leaves the markup as it is.
  - Keyboard: top-level links join the arrow-key navigation, as in the APG example. Keys pressed with Alt, Ctrl or Meta are left to the browser, and arrow keys no longer leave text fields.
  - ES module only: the UMD build is removed. The package now exposes `exports` and ships TypeScript declarations, with typed events on `HTMLElementEventMap`.
  - The `@19h47/keyboard-navigation` dependency is removed.
  - License: MIT, as stated in the README (`package.json` said ISC).

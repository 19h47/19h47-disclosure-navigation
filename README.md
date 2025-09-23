# @19h47/disclosure-navigation

A lightweight, accessible JavaScript module for creating disclosure navigation menus following the WAI-ARIA Authoring Practices. Easily integrate expandable/collapsible navigation sections to improve usability and accessibility.

## Features

- Accessible by default (ARIA compliant)
- Keyboard navigation support
- Minimal dependencies
- Easy integration

## Installation

```bash
npm install @19h47/disclosure-navigation
```

## Usage

```js
import DisclosureNavigation from '@19h47/disclosure-navigation';

const nav = document.querySelector('.js-disclosure-navigation');
const disclosure = new DisclosureNavigation(nav);
```

## License

MIT

[Disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

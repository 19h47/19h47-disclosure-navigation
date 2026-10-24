export interface Detail {
	/** Button whose `aria-expanded` is about to change. */
	$button: HTMLButtonElement;
	/** Elements referenced by the button's `aria-controls`. */
	elements: HTMLElement[];
}

declare global {
	interface HTMLElementEventMap {
		'disclosure-navigation:open': CustomEvent<Detail>;
		'disclosure-navigation:close': CustomEvent<Detail>;
	}
}

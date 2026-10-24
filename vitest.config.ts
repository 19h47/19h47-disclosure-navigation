import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Real browsers: focus, keyboard and ARIA element reflection need an engine.
export default defineConfig({
	test: {
		include: ['lib/**/*.test.ts'],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
		},
	},
});

import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
	// The demo, published by GitHub Pages from docs/
	if ('docs' === mode) {
		return {
			base: './',
			build: { outDir: 'docs' },
		};
	}

	return {
		build: {
			lib: {
				entry: resolve(import.meta.dirname, 'lib/index.ts'),
				formats: ['es'],
				fileName: 'index',
			},
		},
		plugins: [dts({ exclude: ['lib/**/*.test.ts'] })],
	};
});

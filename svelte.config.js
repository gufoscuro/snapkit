import { readFileSync } from 'node:fs';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

function getVersion() {
	const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
	return `v${pkg.version}`;
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	compilerOptions: {
		dev: process.env.NODE_ENV !== 'production'
	},

	vitePlugin: {
		// inspector: {
		// 	toggleKeyCombo: 'control-shift',
		// 	holdMode: true,
		// 	showToggleButton: 'always',
		// 	toggleButtonPos: 'bottom-right'
		// }
	},

	kit: {
		adapter: adapter(),

		version: {
			name: getVersion(),
			pollInterval: 60_000,
		},

		alias: {
			$components: 'src/lib/components',
			$utils: 'src/lib/utils',
			$generated: 'src/generated',
		},
	}
};

export default config;

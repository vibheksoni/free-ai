import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://freetheai.xyz',
	output: 'static',
	integrations: [sitemap()],
	devToolbar: {
		enabled: false,
	},
});

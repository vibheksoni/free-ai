export function buildWebsiteJsonLd() {
	/**
	 * var websiteJsonLd
	 * type object
	 * desc Structured data for the public marketing site and model catalog.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'FreeTheAi',
		url: 'https://freetheai.xyz',
		description:
			'Free OpenAI-compatible AI API with Discord key signup, streaming chat completions, tool calling, image generation, video jobs, text to speech, and a live searchable model catalog.',
		inLanguage: 'en-US',
	};
}

export function buildOrganizationJsonLd() {
	/**
	 * var organizationJsonLd
	 * type object
	 * desc Structured data for the community and public project links.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'FreeTheAi',
		url: 'https://freetheai.xyz',
		description:
			'Community-run free AI API project with Discord signup, no paid plans, and a public searchable model catalog.',
		sameAs: [
			'https://discord.gg/secrets',
			'https://github.com/vibheksoni/free-ai',
			'https://api.freetheai.xyz',
		],
	};
}

export function buildSoftwareJsonLd() {
	/**
	 * var softwareJsonLd
	 * type object
	 * desc Structured data for the free developer API product.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'FreeTheAi',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web',
		description:
			'Free AI API for builders with Discord key signup, OpenAI-compatible chat completions, streaming, tool calling, image generation, video jobs, text to speech, and a live searchable model catalog.',
		url: 'https://freetheai.xyz',
		audience: {
			'@type': 'Audience',
			audienceType: 'Developers, builders, students, and agent framework users',
		},
		featureList: [
			'Free Discord API key signup',
			'OpenAI-compatible chat completions',
			'Streaming responses',
			'Tool calling',
			'Anthropic-style messages endpoint',
			'Image generation',
			'Deferred video generation',
			'Text to speech',
			'Live searchable model catalog',
		],
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
			availability: 'https://schema.org/InStock',
		},
	};
}

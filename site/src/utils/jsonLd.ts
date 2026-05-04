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
			'Free OpenAI-compatible API with 16,000+ models. Chat completions, streaming, tool calling, image generation, and image editing — all behind a single free key from Discord.',
		inLanguage: 'en-US',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: 'https://freetheai.xyz/models?q={search_term_string}',
			},
			'query-input': 'required name=search_term_string',
		},
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
			'Community-run free AI API project with 16,000+ models, Discord signup, no paid plans, and a public searchable model catalog.',
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
		name: 'FreeTheAi API',
		applicationCategory: 'DeveloperApplication',
		applicationSubCategory: 'AI API Gateway',
		operatingSystem: 'Web',
		description:
			'Free OpenAI-compatible AI API with 16,000+ models, Discord key signup, streaming chat completions, tool calling, image generation, image editing, and a live searchable model catalog.',
		url: 'https://freetheai.xyz',
		audience: {
			'@type': 'Audience',
			audienceType: 'Developers, builders, students, and agent framework users',
		},
		featureList: [
			'Free Discord API key signup',
			'OpenAI-compatible chat completions',
			'Streaming responses',
			'Tool calling and structured outputs',
			'Anthropic-style messages endpoint',
			'Image generation via gpt-image-2',
			'Image editing with prompt and base64 input',
			'Live searchable model catalog with 16,000+ models',
			'No billing or credit card required',
			'No daily usage limits',
		],
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
			availability: 'https://schema.org/InStock',
		},
	};
}

export function buildWebApiJsonLd() {
	/**
	 * var webApiJsonLd
	 * type object
	 * desc Structured data for the API as a WebAPI entity for rich API results.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'WebAPI',
		name: 'FreeTheAi API',
		url: 'https://api.freetheai.xyz/v1',
		description:
			'Free OpenAI-compatible REST API with chat completions, streaming, tool calling, image generation, image editing, and 16,000+ models.',
		documentation: 'https://freetheai.xyz',
		provider: {
			'@type': 'Organization',
			name: 'FreeTheAi',
			url: 'https://freetheai.xyz',
		},
	};
}

export function buildFaqJsonLd() {
	/**
	 * var faqJsonLd
	 * type object
	 * desc FAQ structured data for rich search result snippets.
	 */
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: 'Is FreeTheAi really free?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Yes. FreeTheAi is completely free with no billing, no credit card, and no paid tiers. Get a key by running /signup in our Discord server.',
				},
			},
			{
				'@type': 'Question',
				name: 'How many AI models does FreeTheAi have?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'FreeTheAi provides access to over 16,000 models including GPT, Claude, Gemini, DeepSeek, Grok, and thousands of open-weight models.',
				},
			},
			{
				'@type': 'Question',
				name: 'Is FreeTheAi compatible with the OpenAI SDK?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Yes. FreeTheAi is fully OpenAI-compatible. Point any OpenAI SDK at https://api.freetheai.xyz/v1 with your API key and it works.',
				},
			},
			{
				'@type': 'Question',
				name: 'How do I get an API key?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Join the FreeTheAi Discord server at discord.gg/secrets and run the /signup command in any channel to receive your free API key.',
				},
			},
			{
				'@type': 'Question',
				name: 'Does FreeTheAi support image generation?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Yes. FreeTheAi supports image generation through img/gpt-image-2 and vhr/* image models. Image editing is available through img/gpt-image-2 with a base64 input image.',
				},
			},
			{
				'@type': 'Question',
				name: 'Does FreeTheAi store my prompts?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'No. FreeTheAi does not store prompt content, completion content, or conversation history. Only model usage metadata and token counts are tracked.',
				},
			},
		],
	};
}

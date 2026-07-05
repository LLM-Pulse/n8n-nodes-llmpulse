import type { INodeType, INodeTypeDescription } from 'n8n-workflow';

import { getCollections, getCompetitors, getProjects, getTags } from './GenericFunctions';

const MODEL_OPTIONS = [
	{ name: 'AI Mode', value: 'ai_mode' },
	{ name: 'AI Overview', value: 'ai_overview' },
	{ name: 'ChatGPT', value: 'chatgpt' },
	{ name: 'Claude', value: 'claude' },
	{ name: 'Copilot', value: 'copilot' },
	{ name: 'DeepSeek', value: 'deepseek' },
	{ name: 'Gemini', value: 'gemini' },
	{ name: 'Grok', value: 'grok' },
	{ name: 'Meta AI', value: 'meta_ai' },
	{ name: 'Perplexity', value: 'perplexity' },
];

const BRAND_KIND_OPTIONS = [
	{ name: 'Brand', value: 'brand' },
	{ name: 'Brand Other', value: 'brand_other' },
	{ name: 'Non-Brand', value: 'non_brand' },
];

const PROMPT_TYPE_OPTIONS = [
	{ name: 'Commercial', value: 'commercial' },
	{ name: 'Informational', value: 'informational' },
	{ name: 'Navigational', value: 'navigational' },
	{ name: 'Transactional', value: 'transactional' },
];

const GRANULARITY_OPTIONS = [
	{ name: 'Day', value: 'day' },
	{ name: 'Month', value: 'month' },
	{ name: 'Week', value: 'week' },
];

const TASK_TYPE_OPTIONS = [
	{ name: 'Brief', value: 'brief' },
	{ name: 'Create Article', value: 'create' },
	{ name: 'Custom', value: 'custom' },
	{ name: 'PR Insights', value: 'pr_insights' },
	{ name: 'Update Article', value: 'update' },
];

export class LlmPulse implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LLM Pulse',
		name: 'llmPulse',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:llmpulse.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Consume the LLM Pulse API: AI visibility analytics for ChatGPT, Perplexity, Gemini and more',
		defaults: {
			name: 'LLM Pulse',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'llmPulseApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.llmpulse.ai/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Annotation', value: 'annotation' },
					{ name: 'Citation', value: 'citation' },
					{ name: 'Collection', value: 'collection' },
					{ name: 'Competitor', value: 'competitor' },
					{ name: 'Intelligence Task', value: 'intelligenceTask' },
					{ name: 'Mention', value: 'mention' },
					{ name: 'Metric', value: 'metrics' },
					{ name: 'Project', value: 'project' },
					{ name: 'Prompt', value: 'prompt' },
				],
				default: 'project',
			},

			// ----------------------------------
			//         Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['project'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get a project',
						description: 'Get full details of a single project',
						routing: {
							request: {
								method: 'GET',
								url: '=/dimensions/projects/{{$parameter.projectId}}',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many projects',
						description: 'List many projects the API key can access',
						routing: {
							request: {
								method: 'GET',
								url: '/dimensions/projects',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'projects',
										},
									},
								],
							},
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['prompt'],
					},
				},
				options: [
					{
						name: 'Assign Tags',
						value: 'assignTags',
						action: 'Assign tags to prompts',
						description: 'Bulk-attach tags to prompts',
						routing: {
							request: {
								method: 'POST',
								url: '/prompts/assign_tags',
							},
						},
					},
					{
						name: 'Create',
						value: 'create',
						action: 'Create prompts',
						description: 'Bulk-create prompts in a project',
						routing: {
							request: {
								method: 'POST',
								url: '/prompts',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many prompts',
						description: 'List prompts of a project',
						routing: {
							request: {
								method: 'GET',
								url: '/dimensions/prompts',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'data',
										},
									},
								],
							},
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['competitor'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create a competitor',
						description: 'Add a competitor to a project',
						routing: {
							request: {
								method: 'POST',
								url: '/competitors',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many competitors',
						description: 'List competitors of a project',
						routing: {
							request: {
								method: 'GET',
								url: '/dimensions/competitors',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'competitors',
										},
									},
								],
							},
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['collection'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create a collection',
						description: 'Create a tag/collection in a project',
						routing: {
							request: {
								method: 'POST',
								url: '/collections',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many collections',
						description: 'List tags/collections of a project',
						routing: {
							request: {
								method: 'GET',
								url: '/dimensions/collections',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'collections',
										},
									},
								],
							},
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['mention'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many mentions',
						description: 'List brand mentions of a project',
						routing: {
							request: {
								method: 'GET',
								url: '/dimensions/mentions',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'data',
										},
									},
								],
							},
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['citation'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many citations',
						description: 'List brand citations of a project',
						routing: {
							request: {
								method: 'GET',
								url: '/dimensions/citations',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'data',
										},
									},
								],
							},
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['metrics'],
					},
				},
				options: [
					{
						name: 'Get Share of Voice',
						value: 'getShareOfVoice',
						action: 'Get share of voice',
						description: 'Share of voice of the brand vs competitors',
						routing: {
							request: {
								method: 'GET',
								url: '/metrics/sov',
							},
						},
					},
					{
						name: 'Get Summary',
						value: 'getSummary',
						action: 'Get a metrics summary',
						description: 'Aggregated metrics for a period',
						routing: {
							request: {
								method: 'GET',
								url: '/metrics/summary',
							},
						},
					},
					{
						name: 'Get Timeseries',
						value: 'getTimeseries',
						action: 'Get metrics timeseries',
						description: 'Time-series metrics by day, week or month',
						routing: {
							request: {
								method: 'GET',
								url: '/metrics/timeseries',
							},
						},
					},
				],
				default: 'getSummary',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['intelligenceTask'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create an intelligence task',
						description: 'Create a GEO Writer task (brief, article, update, PR insights or custom)',
						routing: {
							request: {
								method: 'POST',
								url: '/intelligence_tasks',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get an intelligence task',
						description: 'Get a GEO Writer task with its result',
						routing: {
							request: {
								method: 'GET',
								url: '=/intelligence_tasks/{{$parameter.taskId}}',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many intelligence tasks',
						description: 'List GEO Writer tasks of a project',
						routing: {
							request: {
								method: 'GET',
								url: '/intelligence_tasks',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'data',
										},
									},
								],
							},
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['annotation'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create an annotation',
						description: 'Create a timeline annotation on the project charts',
						routing: {
							request: {
								method: 'POST',
								url: '/annotations',
							},
						},
					},
				],
				default: 'create',
			},

			// ----------------------------------
			//         Project pickers
			// ----------------------------------
			{
				displayName: 'Project Name or ID',
				name: 'projectId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['project'],
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'Project Name or ID',
				name: 'projectId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'citation',
							'collection',
							'competitor',
							'intelligenceTask',
							'mention',
							'metrics',
							'prompt',
						],
						operation: ['get', 'getAll', 'getShareOfVoice', 'getSummary', 'getTimeseries'],
					},
				},
				routing: {
					send: {
						type: 'query',
						property: 'project_id',
					},
				},
			},
			{
				displayName: 'Project Name or ID',
				name: 'projectId',
				type: 'options',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['annotation', 'collection', 'competitor', 'intelligenceTask', 'prompt'],
						operation: ['assignTags', 'create'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'project_id',
					},
				},
			},

			// ----------------------------------
			//         prompt: create
			// ----------------------------------
			{
				displayName: 'Prompts',
				name: 'prompts',
				type: 'string',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Prompt',
				},
				default: [],
				required: true,
				description: 'Prompt texts to create (max 100 per call); duplicates are skipped',
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['create'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'prompts',
					},
				},
			},
			{
				displayName: 'Country Code',
				name: 'countryCode',
				type: 'string',
				default: '',
				placeholder: 'US',
				required: true,
				description: 'ISO country code the prompts run in (e.g. US, GB, DE)',
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['create'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'country_code',
					},
				},
			},
			{
				displayName: 'Language Code',
				name: 'languageCode',
				type: 'string',
				default: '',
				placeholder: 'en',
				required: true,
				description: 'ISO language code the prompts run in (e.g. en, es, de)',
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['create'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'language_code',
					},
				},
			},

			// ----------------------------------
			//         prompt: assignTags
			// ----------------------------------
			{
				displayName: 'Prompt IDs',
				name: 'promptIds',
				type: 'number',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Prompt ID',
				},
				// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-number
				default: [],
				required: true,
				description: 'IDs of the prompts to tag',
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['assignTags'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'prompt_ids',
					},
				},
			},
			{
				displayName: 'Tag Names or IDs',
				name: 'tagIds',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getTags',
					loadOptionsDependsOn: ['projectId'],
				},
				default: [],
				description:
					'Existing tags to attach. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['assignTags'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'tag_ids',
					},
				},
			},
			{
				displayName: 'Options',
				name: 'assignTagsOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['assignTags'],
					},
				},
				options: [
					{
						displayName: 'Create Missing Tags',
						name: 'createMissing',
						type: 'boolean',
						default: false,
						description: 'Whether to create tags listed in Tag Names that do not exist yet',
						routing: {
							send: {
								type: 'body',
								property: 'create_missing',
							},
						},
					},
					{
						displayName: 'Tag Names',
						name: 'tagNames',
						type: 'string',
						typeOptions: {
							multipleValues: true,
							multipleValueButtonText: 'Add Tag Name',
						},
						default: [],
						description: 'Tag names to attach (combine with Create Missing Tags to auto-create)',
						routing: {
							send: {
								type: 'body',
								property: 'tag_names',
							},
						},
					},
				],
			},

			// ----------------------------------
			//         prompt: getAll filters
			// ----------------------------------
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['prompt'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Brand Kind',
						name: 'brandKind',
						type: 'options',
						options: BRAND_KIND_OPTIONS,
						default: 'brand',
						description:
							'Filter by brand kind: own brand, other brands (competitors) or generic prompts',
						routing: {
							send: {
								type: 'query',
								property: 'brand_kind',
							},
						},
					},
					{
						displayName: 'Collection Name or ID',
						name: 'collectionId',
						type: 'options',
						description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
						typeOptions: {
							loadOptionsMethod: 'getCollections',
							loadOptionsDependsOn: ['projectId'],
						},
						default: '',
						routing: {
							send: {
								type: 'query',
								property: 'collection_id',
							},
						},
					},
					{
						displayName: 'Country Code',
						name: 'countryCode',
						type: 'string',
						default: '',
						placeholder: 'US',
						description: 'ISO country code (e.g. US, GB, DE)',
						routing: {
							send: {
								type: 'query',
								property: 'country_code',
							},
						},
					},
					{
						displayName: 'From',
						name: 'from',
						type: 'dateTime',
						default: '',
						description: 'Only include records from this date onwards',
						routing: {
							send: {
								type: 'query',
								property: 'from',
							},
						},
					},
					{
						displayName: 'Language Code',
						name: 'languageCode',
						type: 'string',
						default: '',
						placeholder: 'en',
						description: 'ISO language code (e.g. en, es, de)',
						routing: {
							send: {
								type: 'query',
								property: 'language_code',
							},
						},
					},
					{
						displayName: 'Model',
						name: 'model',
						type: 'options',
						options: MODEL_OPTIONS,
						default: 'chatgpt',
						description: 'Filter by AI model',
						routing: {
							send: {
								type: 'query',
								property: 'model',
							},
						},
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1,
						description: 'Page number to fetch',
						routing: {
							send: {
								type: 'query',
								property: 'page',
							},
						},
					},
					{
						displayName: 'Per Page',
						name: 'perPage',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 100,
						},
						default: 20,
						description: 'Results per page (max 100)',
						routing: {
							send: {
								type: 'query',
								property: 'per_page',
							},
						},
					},
					{
						displayName: 'Prompt Type',
						name: 'promptType',
						type: 'options',
						options: PROMPT_TYPE_OPTIONS,
						default: 'informational',
						description: 'Filter by search intent',
						routing: {
							send: {
								type: 'query',
								property: 'prompt_type',
							},
						},
					},
					{
						displayName: 'To',
						name: 'to',
						type: 'dateTime',
						default: '',
						description: 'Only include records up to this date',
						routing: {
							send: {
								type: 'query',
								property: 'to',
							},
						},
					},
				],
			},

			// ----------------------------------
			//         competitor: create
			// ----------------------------------
			{
				displayName: 'Brand Name',
				name: 'brandName',
				type: 'string',
				default: '',
				required: true,
				description: 'Name of the competitor brand',
				displayOptions: {
					show: {
						resource: ['competitor'],
						operation: ['create'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'brand_name',
					},
				},
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				placeholder: 'competitor.com',
				required: true,
				description: 'Competitor domain. A full URL is accepted and normalised to the host.',
				displayOptions: {
					show: {
						resource: ['competitor'],
						operation: ['create'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'domain',
					},
				},
			},
			{
				displayName: 'Options',
				name: 'competitorOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					show: {
						resource: ['competitor'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Matching Names',
						name: 'matchingNames',
						type: 'string',
						typeOptions: {
							multipleValues: true,
							multipleValueButtonText: 'Add Matching Name',
						},
						default: [],
						description: 'Alternative names that should count as a mention of this competitor',
						routing: {
							send: {
								type: 'body',
								property: 'matching_names',
							},
						},
					},
				],
			},

			// ----------------------------------
			//         competitor: getAll options
			// ----------------------------------
			{
				displayName: 'Options',
				name: 'competitorListOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					show: {
						resource: ['competitor'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Include Project Brand',
						name: 'includeProjectBrand',
						type: 'boolean',
						default: false,
						description: 'Whether to prepend the project brand itself to the competitor list',
						routing: {
							send: {
								type: 'query',
								property: 'include_project_brand',
							},
						},
					},
				],
			},

			// ----------------------------------
			//         collection: create
			// ----------------------------------
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				description: 'Name of the tag/collection',
				displayOptions: {
					show: {
						resource: ['collection'],
						operation: ['create'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'name',
					},
				},
			},
			{
				displayName: 'Options',
				name: 'collectionOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					show: {
						resource: ['collection'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the tag/collection',
						routing: {
							send: {
								type: 'body',
								property: 'description',
							},
						},
					},
					{
						displayName: 'Prompt IDs',
						name: 'promptIds',
						type: 'number',
						typeOptions: {
							multipleValues: true,
							multipleValueButtonText: 'Add Prompt ID',
						},
						// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-number
						default: [],
						description: 'Prompts to attach to the new tag/collection',
						routing: {
							send: {
								type: 'body',
								property: 'prompt_ids',
							},
						},
					},
				],
			},

			// ----------------------------------
			//   mention / citation: getAll filters
			// ----------------------------------
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['citation', 'mention'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Collection Name or ID',
						name: 'collectionId',
						type: 'options',
						description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
						typeOptions: {
							loadOptionsMethod: 'getCollections',
							loadOptionsDependsOn: ['projectId'],
						},
						default: '',
						routing: {
							send: {
								type: 'query',
								property: 'collection_id',
							},
						},
					},
					{
						displayName: 'Country Code',
						name: 'countryCode',
						type: 'string',
						default: '',
						placeholder: 'US',
						description: 'ISO country code (e.g. US, GB, DE)',
						routing: {
							send: {
								type: 'query',
								property: 'country_code',
							},
						},
					},
					{
						displayName: 'From',
						name: 'from',
						type: 'dateTime',
						default: '',
						description: 'Only include records from this date onwards',
						routing: {
							send: {
								type: 'query',
								property: 'from',
							},
						},
					},
					{
						displayName: 'Language Code',
						name: 'languageCode',
						type: 'string',
						default: '',
						placeholder: 'en',
						description: 'ISO language code (e.g. en, es, de)',
						routing: {
							send: {
								type: 'query',
								property: 'language_code',
							},
						},
					},
					{
						displayName: 'Model',
						name: 'model',
						type: 'options',
						options: MODEL_OPTIONS,
						default: 'chatgpt',
						description: 'Filter by AI model',
						routing: {
							send: {
								type: 'query',
								property: 'model',
							},
						},
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1,
						description: 'Page number to fetch',
						routing: {
							send: {
								type: 'query',
								property: 'page',
							},
						},
					},
					{
						displayName: 'Per Page',
						name: 'perPage',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 100,
						},
						default: 20,
						description: 'Results per page (max 100)',
						routing: {
							send: {
								type: 'query',
								property: 'per_page',
							},
						},
					},
					{
						displayName: 'Prompt ID',
						name: 'prompt',
						type: 'number',
						default: 0,
						description: 'Filter by a single prompt ID',
						routing: {
							send: {
								type: 'query',
								property: 'prompt',
							},
						},
					},
					{
						displayName: 'To',
						name: 'to',
						type: 'dateTime',
						default: '',
						description: 'Only include records up to this date',
						routing: {
							send: {
								type: 'query',
								property: 'to',
							},
						},
					},
				],
			},

			// ----------------------------------
			//         metrics: getSummary filters
			// ----------------------------------
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['metrics'],
						operation: ['getSummary'],
					},
				},
				options: [
					{
						displayName: 'Brand Kind',
						name: 'brandKind',
						type: 'options',
						options: BRAND_KIND_OPTIONS,
						default: 'brand',
						description: 'Filter by brand kind of the underlying prompts',
						routing: {
							send: {
								type: 'query',
								property: 'brand_kind',
							},
						},
					},
					{
						displayName: 'Collection Name or ID',
						name: 'collectionId',
						type: 'options',
						description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
						typeOptions: {
							loadOptionsMethod: 'getCollections',
							loadOptionsDependsOn: ['projectId'],
						},
						default: '',
						routing: {
							send: {
								type: 'query',
								property: 'collection_id',
							},
						},
					},
					{
						displayName: 'Competitor Names or IDs',
						name: 'competitors',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getCompetitors',
							loadOptionsDependsOn: ['projectId'],
						},
						default: [],
						description:
							'Competitors to include. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
						routing: {
							send: {
								type: 'query',
								property: 'competitors',
								value: '={{ $value.join(",") }}',
							},
						},
					},
					{
						displayName: 'From',
						name: 'from',
						type: 'dateTime',
						default: '',
						description: 'Start of the period',
						routing: {
							send: {
								type: 'query',
								property: 'from',
							},
						},
					},
					{
						displayName: 'Granularity',
						name: 'granularity',
						type: 'options',
						options: GRANULARITY_OPTIONS,
						default: 'week',
						description: 'Aggregation granularity',
						routing: {
							send: {
								type: 'query',
								property: 'granularity',
							},
						},
					},
					{
						displayName: 'Metrics',
						name: 'metrics',
						type: 'string',
						default: '',
						placeholder: 'mentions,visibility,net_sentiment',
						description:
							'Comma-separated metrics: mentions, citations, responses, mention_rate, visibility, weighted_visibility, ai_visibility_score, citation_rate, avg_position, net_sentiment, sentiment_positive, sentiment_negative and more',
						routing: {
							send: {
								type: 'query',
								property: 'metrics',
							},
						},
					},
					{
						displayName: 'Model',
						name: 'model',
						type: 'options',
						options: MODEL_OPTIONS,
						default: 'chatgpt',
						description: 'Filter by AI model',
						routing: {
							send: {
								type: 'query',
								property: 'model',
							},
						},
					},
					{
						displayName: 'Prompt ID',
						name: 'prompt',
						type: 'number',
						default: 0,
						description: 'Filter by a single prompt ID',
						routing: {
							send: {
								type: 'query',
								property: 'prompt',
							},
						},
					},
					{
						displayName: 'Prompt Type',
						name: 'promptType',
						type: 'options',
						options: PROMPT_TYPE_OPTIONS,
						default: 'informational',
						description: 'Filter by search intent',
						routing: {
							send: {
								type: 'query',
								property: 'prompt_type',
							},
						},
					},
					{
						displayName: 'Range (Days)',
						name: 'range',
						type: 'number',
						default: 30,
						description: 'Number of days to look back (alternative to From/To)',
						routing: {
							send: {
								type: 'query',
								property: 'range',
							},
						},
					},
					{
						displayName: 'To',
						name: 'to',
						type: 'dateTime',
						default: '',
						description: 'End of the period',
						routing: {
							send: {
								type: 'query',
								property: 'to',
							},
						},
					},
				],
			},

			// ----------------------------------
			//      metrics: getShareOfVoice filters
			// ----------------------------------
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['metrics'],
						operation: ['getShareOfVoice'],
					},
				},
				options: [
					{
						displayName: 'Brand Kind',
						name: 'brandKind',
						type: 'options',
						options: BRAND_KIND_OPTIONS,
						default: 'brand',
						description: 'Filter by brand kind of the underlying prompts',
						routing: {
							send: {
								type: 'query',
								property: 'brand_kind',
							},
						},
					},
					{
						displayName: 'Collection Name or ID',
						name: 'collectionId',
						type: 'options',
						description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
						typeOptions: {
							loadOptionsMethod: 'getCollections',
							loadOptionsDependsOn: ['projectId'],
						},
						default: '',
						routing: {
							send: {
								type: 'query',
								property: 'collection_id',
							},
						},
					},
					{
						displayName: 'Competitor Names or IDs',
						name: 'competitors',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getCompetitors',
							loadOptionsDependsOn: ['projectId'],
						},
						default: [],
						description:
							'Competitors to include. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
						routing: {
							send: {
								type: 'query',
								property: 'competitors',
								value: '={{ $value.join(",") }}',
							},
						},
					},
					{
						displayName: 'From',
						name: 'from',
						type: 'dateTime',
						default: '',
						description: 'Start of the period',
						routing: {
							send: {
								type: 'query',
								property: 'from',
							},
						},
					},
					{
						displayName: 'Granularity',
						name: 'granularity',
						type: 'options',
						options: GRANULARITY_OPTIONS,
						default: 'week',
						description: 'Aggregation granularity',
						routing: {
							send: {
								type: 'query',
								property: 'granularity',
							},
						},
					},
					{
						displayName: 'Model',
						name: 'model',
						type: 'options',
						options: MODEL_OPTIONS,
						default: 'chatgpt',
						description: 'Filter by AI model',
						routing: {
							send: {
								type: 'query',
								property: 'model',
							},
						},
					},
					{
						displayName: 'Prompt ID',
						name: 'prompt',
						type: 'number',
						default: 0,
						description: 'Filter by a single prompt ID',
						routing: {
							send: {
								type: 'query',
								property: 'prompt',
							},
						},
					},
					{
						displayName: 'Prompt Type',
						name: 'promptType',
						type: 'options',
						options: PROMPT_TYPE_OPTIONS,
						default: 'informational',
						description: 'Filter by search intent',
						routing: {
							send: {
								type: 'query',
								property: 'prompt_type',
							},
						},
					},
					{
						displayName: 'Range (Days)',
						name: 'range',
						type: 'number',
						default: 30,
						description: 'Number of days to look back (alternative to From/To)',
						routing: {
							send: {
								type: 'query',
								property: 'range',
							},
						},
					},
					{
						displayName: 'To',
						name: 'to',
						type: 'dateTime',
						default: '',
						description: 'End of the period',
						routing: {
							send: {
								type: 'query',
								property: 'to',
							},
						},
					},
				],
			},

			// ----------------------------------
			//      metrics: getTimeseries filters
			// ----------------------------------
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['metrics'],
						operation: ['getTimeseries'],
					},
				},
				options: [
					{
						displayName: 'Brand Kind',
						name: 'brandKind',
						type: 'options',
						options: BRAND_KIND_OPTIONS,
						default: 'brand',
						description: 'Filter by brand kind of the underlying prompts',
						routing: {
							send: {
								type: 'query',
								property: 'brand_kind',
							},
						},
					},
					{
						displayName: 'Collection Name or ID',
						name: 'collectionId',
						type: 'options',
						description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
						typeOptions: {
							loadOptionsMethod: 'getCollections',
							loadOptionsDependsOn: ['projectId'],
						},
						default: '',
						routing: {
							send: {
								type: 'query',
								property: 'collection_id',
							},
						},
					},
					{
						displayName: 'Competitor Names or IDs',
						name: 'competitors',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getCompetitors',
							loadOptionsDependsOn: ['projectId'],
						},
						default: [],
						description:
							'Competitors to include. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
						routing: {
							send: {
								type: 'query',
								property: 'competitors',
								value: '={{ $value.join(",") }}',
							},
						},
					},
					{
						displayName: 'Country Code',
						name: 'countryCode',
						type: 'string',
						default: '',
						placeholder: 'US',
						description: 'ISO country code (e.g. US, GB, DE)',
						routing: {
							send: {
								type: 'query',
								property: 'country_code',
							},
						},
					},
					{
						displayName: 'From',
						name: 'from',
						type: 'dateTime',
						default: '',
						description: 'Start of the period',
						routing: {
							send: {
								type: 'query',
								property: 'from',
							},
						},
					},
					{
						displayName: 'Granularity',
						name: 'granularity',
						type: 'options',
						options: GRANULARITY_OPTIONS,
						default: 'week',
						description: 'Aggregation granularity of the series',
						routing: {
							send: {
								type: 'query',
								property: 'granularity',
							},
						},
					},
					{
						displayName: 'Include Project',
						name: 'includeProject',
						type: 'boolean',
						default: true,
						description: 'Whether to include the project brand series in the response',
						routing: {
							send: {
								type: 'query',
								property: 'include_project',
							},
						},
					},
					{
						displayName: 'Language Code',
						name: 'languageCode',
						type: 'string',
						default: '',
						placeholder: 'en',
						description: 'ISO language code (e.g. en, es, de)',
						routing: {
							send: {
								type: 'query',
								property: 'language_code',
							},
						},
					},
					{
						displayName: 'Metrics',
						name: 'metrics',
						type: 'string',
						default: '',
						placeholder: 'mentions,visibility,net_sentiment',
						description:
							'Comma-separated metrics: mentions, citations, responses, mention_rate, visibility, weighted_visibility, ai_visibility_score, citation_rate, avg_position, net_sentiment, sentiment_positive, sentiment_negative and more',
						routing: {
							send: {
								type: 'query',
								property: 'metrics',
							},
						},
					},
					{
						displayName: 'Model',
						name: 'model',
						type: 'options',
						options: MODEL_OPTIONS,
						default: 'chatgpt',
						description: 'Filter by AI model',
						routing: {
							send: {
								type: 'query',
								property: 'model',
							},
						},
					},
					{
						displayName: 'Prompt ID',
						name: 'prompt',
						type: 'number',
						default: 0,
						description: 'Filter by a single prompt ID',
						routing: {
							send: {
								type: 'query',
								property: 'prompt',
							},
						},
					},
					{
						displayName: 'Prompt Type',
						name: 'promptType',
						type: 'options',
						options: PROMPT_TYPE_OPTIONS,
						default: 'informational',
						description: 'Filter by search intent',
						routing: {
							send: {
								type: 'query',
								property: 'prompt_type',
							},
						},
					},
					{
						displayName: 'Range (Days)',
						name: 'range',
						type: 'number',
						default: 30,
						description: 'Number of days to look back (alternative to From/To)',
						routing: {
							send: {
								type: 'query',
								property: 'range',
							},
						},
					},
					{
						displayName: 'To',
						name: 'to',
						type: 'dateTime',
						default: '',
						description: 'End of the period',
						routing: {
							send: {
								type: 'query',
								property: 'to',
							},
						},
					},
				],
			},

			// ----------------------------------
			//      intelligenceTask: get
			// ----------------------------------
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				default: '',
				required: true,
				description: 'Numeric task ID or public_id string token',
				displayOptions: {
					show: {
						resource: ['intelligenceTask'],
						operation: ['get'],
					},
				},
			},

			// ----------------------------------
			//      intelligenceTask: getAll filters
			// ----------------------------------
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['intelligenceTask'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1,
						description: 'Page number to fetch',
						routing: {
							send: {
								type: 'query',
								property: 'page',
							},
						},
					},
					{
						displayName: 'Per Page',
						name: 'perPage',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 100,
						},
						default: 20,
						description: 'Results per page (max 100)',
						routing: {
							send: {
								type: 'query',
								property: 'per_page',
							},
						},
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'string',
						default: '',
						placeholder: 'completed',
						description: 'Filter by task status (e.g. pending, processing, completed, failed)',
						routing: {
							send: {
								type: 'query',
								property: 'status',
							},
						},
					},
					{
						displayName: 'Task Type',
						name: 'taskType',
						type: 'options',
						options: TASK_TYPE_OPTIONS,
						default: 'brief',
						description: 'Filter by task type',
						routing: {
							send: {
								type: 'query',
								property: 'task_type',
							},
						},
					},
				],
			},

			// ----------------------------------
			//      intelligenceTask: create
			// ----------------------------------
			{
				displayName: 'Task Type',
				name: 'taskType',
				type: 'options',
				options: TASK_TYPE_OPTIONS,
				default: 'brief',
				required: true,
				description: 'Type of GEO Writer task to create',
				displayOptions: {
					show: {
						resource: ['intelligenceTask'],
						operation: ['create'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'task_type',
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add field',
				default: {},
				displayOptions: {
					show: {
						resource: ['intelligenceTask'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Custom Topic',
						name: 'customTopic',
						type: 'string',
						default: '',
						description: 'Topic to write about (used instead of a prompt)',
						routing: {
							send: {
								type: 'body',
								property: 'custom_topic',
							},
						},
					},
					{
						displayName: 'Existing Content',
						name: 'existingContent',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Existing content to update (for update tasks)',
						routing: {
							send: {
								type: 'body',
								property: 'existing_content',
							},
						},
					},
					{
						displayName: 'Existing Content URL',
						name: 'existingContentUrl',
						type: 'string',
						default: '',
						placeholder: 'https://example.com/article',
						description: 'URL of the existing content to update (for update tasks)',
						routing: {
							send: {
								type: 'body',
								property: 'existing_content_url',
							},
						},
					},
					{
						displayName: 'Output Language Code',
						name: 'outputLanguageCode',
						type: 'string',
						default: '',
						placeholder: 'en',
						description: 'ISO language code of the generated output',
						routing: {
							send: {
								type: 'body',
								property: 'output_language_code',
							},
						},
					},
					{
						displayName: 'Prompt ID',
						name: 'promptId',
						type: 'number',
						default: 0,
						description: 'Prompt to base the task on (alternative to Custom Topic)',
						routing: {
							send: {
								type: 'body',
								property: 'prompt_id',
							},
						},
					},
					{
						displayName: 'User Instructions',
						name: 'userInstructions',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Extra instructions for the writer',
						routing: {
							send: {
								type: 'body',
								property: 'user_instructions',
							},
						},
					},
				],
			},

			// ----------------------------------
			//      annotation: create
			// ----------------------------------
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				description: 'Title of the annotation',
				displayOptions: {
					show: {
						resource: ['annotation'],
						operation: ['create'],
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'title',
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add field',
				default: {},
				displayOptions: {
					show: {
						resource: ['annotation'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Annotation Category ID',
						name: 'annotationCategoryId',
						type: 'number',
						default: 0,
						description: 'ID of the annotation category',
						routing: {
							send: {
								type: 'body',
								property: 'annotation_category_id',
							},
						},
					},
					{
						displayName: 'Color',
						name: 'color',
						type: 'color',
						default: '',
						description: 'Hex color of the annotation marker, e.g. #2563eb',
						routing: {
							send: {
								type: 'body',
								property: 'color',
							},
						},
					},
					{
						displayName: 'Date',
						name: 'annotationDate',
						type: 'string',
						default: '',
						placeholder: '2026-06-11',
						description: 'ISO date (YYYY-MM-DD); defaults to today',
						routing: {
							send: {
								type: 'body',
								property: 'annotation_date',
							},
						},
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description shown with the annotation',
						routing: {
							send: {
								type: 'body',
								property: 'description',
							},
						},
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			getProjects,
			getCompetitors,
			getCollections,
			getTags,
		},
	};
}

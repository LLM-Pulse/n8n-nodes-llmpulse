import { createHmac, timingSafeEqual } from 'crypto';

import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

import { getProjects, llmPulseApiRequest } from './GenericFunctions';

interface IWebhookSubscription {
	id: number;
	event: string;
	secret: string;
}

export class LlmPulseTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LLM Pulse Trigger',
		name: 'llmPulseTrigger',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:llmpulse.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when LLM Pulse events occur',
		defaults: {
			name: 'LLM Pulse Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'llmPulseApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Project Name or ID',
				name: 'projectId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProjects',
				},
				default: '',
				required: true,
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'Citation Created',
						value: 'citation.created',
						description: 'A new citation of your domain was detected in an AI answer',
					},
					{
						name: 'Competitor Mention Created',
						value: 'competitor_mention.created',
						description: 'A competitor was mentioned in an AI answer',
					},
					{
						name: 'Intelligence Task Completed',
						value: 'intelligence_task.completed',
						description: 'A GEO Writer task finished processing',
					},
					{
						name: 'Mention Created',
						value: 'mention.created',
						description: 'Your brand was mentioned in an AI answer',
					},
					{
						name: 'Negative Sentiment Detected',
						value: 'sentiment.negative_detected',
						description: 'A negative or very negative sentiment was detected for your brand',
					},
					{
						name: 'Prompt Execution Completed',
						value: 'prompt_execution.completed',
						description: 'A prompt finished executing against an AI model',
					},
					{
						name: 'Recommendation Completed',
						value: 'recommendation.completed',
						description: 'A recommendations run finished processing',
					},
				],
				default: [],
				required: true,
				description: 'The events that should trigger this workflow',
			},
			{
				displayName: 'Verify Signature',
				name: 'verifySignature',
				type: 'boolean',
				default: true,
				description:
					'Whether to validate the X-LLMPulse-Signature HMAC header of incoming deliveries and reject requests that do not match the subscription secret',
			},
		],
	};

	methods = {
		loadOptions: {
			getProjects,
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const subscriptions = webhookData.subscriptions as IWebhookSubscription[] | undefined;

				if (!subscriptions?.length) {
					return false;
				}

				const events = this.getNodeParameter('events') as string[];
				const projectId = this.getNodeParameter('projectId') as number | string;

				const subscribedEvents = subscriptions
					.map((subscription) => subscription.event)
					.sort()
					.join(',');
				const wantedEvents = [...events].sort().join(',');

				if (subscribedEvents !== wantedEvents) {
					return false;
				}

				return String(webhookData.projectId ?? '') === String(projectId);
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const projectId = this.getNodeParameter('projectId') as number | string;
				const events = this.getNodeParameter('events') as string[];

				const subscriptions: IWebhookSubscription[] = [];

				for (const eventType of events) {
					const response = await llmPulseApiRequest.call(this, 'POST', '/webhooks', {
						project_id: typeof projectId === 'string' ? parseInt(projectId, 10) : projectId,
						event_type: eventType,
						target_url: webhookUrl,
					});

					subscriptions.push({
						id: response.id as number,
						event: response.event_type as string,
						secret: response.secret as string,
					});
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.subscriptions = subscriptions;
				webhookData.projectId = projectId;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const subscriptions = webhookData.subscriptions as IWebhookSubscription[] | undefined;

				if (subscriptions?.length) {
					for (const subscription of subscriptions) {
						try {
							await llmPulseApiRequest.call(this, 'DELETE', `/webhooks/${subscription.id}`);
						} catch (error) {
							const statusCode =
								(error as { httpCode?: string; statusCode?: number }).httpCode ??
								(error as { statusCode?: number }).statusCode;
							if (String(statusCode) !== '404') {
								return false;
							}
						}
					}
				}

				delete webhookData.subscriptions;
				delete webhookData.projectId;

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const verifySignature = this.getNodeParameter('verifySignature') as boolean;

		if (verifySignature) {
			const headers = this.getHeaderData() as IDataObject;
			const signatureHeader = (headers['x-llmpulse-signature'] as string) ?? '';
			const providedHex = signatureHeader.startsWith('sha256=')
				? signatureHeader.slice('sha256='.length)
				: signatureHeader;

			const req = this.getRequestObject();
			const rawBody =
				(req.rawBody as Buffer | undefined) ?? Buffer.from(JSON.stringify(body), 'utf8');

			const webhookData = this.getWorkflowStaticData('node');
			const subscriptions = (webhookData.subscriptions ?? []) as IWebhookSubscription[];
			const subscriptionId = body.subscription_id as number | undefined;

			const candidates =
				subscriptionId === undefined
					? subscriptions
					: subscriptions.filter((subscription) => subscription.id === subscriptionId);

			const isValid = candidates.some((subscription) => {
				const expectedHex = createHmac('sha256', subscription.secret)
					.update(rawBody)
					.digest('hex');
				const expected = Buffer.from(expectedHex, 'hex');
				const provided = Buffer.from(providedHex, 'hex');
				try {
					return expected.length === provided.length && timingSafeEqual(expected, provided);
				} catch {
					return false;
				}
			});

			if (!isValid) {
				const res = this.getResponseObject();
				res.status(401).json({ error: 'Invalid X-LLMPulse-Signature' });
				return {
					noWebhookResponse: true,
				};
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}

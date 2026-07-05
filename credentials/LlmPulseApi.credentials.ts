import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class LlmPulseApi implements ICredentialType {
	name = 'llmPulseApi';

	displayName = 'LLM Pulse API';

	documentationUrl = 'https://llmpulse.ai/api-docs';

	icon = 'file:../nodes/LlmPulse/llmpulse.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your LLM Pulse API key (starts with "llmpulse_"). Generate one under Settings > API Keys. API access requires the Scale plan or above.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.llmpulse.ai/api/v1',
			url: '/ping',
			method: 'GET',
		},
	};
}

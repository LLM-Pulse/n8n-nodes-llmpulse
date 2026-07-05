import type {
	IDataObject,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

export const BASE_URL = 'https://api.llmpulse.ai/api/v1';

export async function llmPulseApiRequest(
	this: ILoadOptionsFunctions | IHookFunctions,
	method: 'GET' | 'POST' | 'DELETE',
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject> {
	return (await this.helpers.httpRequestWithAuthentication.call(this, 'llmPulseApi', {
		method,
		url: `${BASE_URL}${endpoint}`,
		body,
		qs,
		json: true,
	})) as IDataObject;
}

export async function getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const response = await llmPulseApiRequest.call(this, 'GET', '/dimensions/projects');
	const projects = (response.projects as IDataObject[] | undefined) ?? [];

	return projects.map((project) => ({
		name: `${project.name as string} (#${project.id as number})`,
		value: project.id as number,
	}));
}

export async function getCompetitors(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const projectId = this.getCurrentNodeParameter('projectId') as number | string;
	if (!projectId) return [];

	const response = await llmPulseApiRequest.call(this, 'GET', '/dimensions/competitors', undefined, {
		project_id: projectId,
	});
	const competitors = (response.competitors as IDataObject[] | undefined) ?? [];

	return competitors.map((competitor) => ({
		name: `${competitor.name as string} (${(competitor.domain as string) ?? 'no domain'})`,
		value: competitor.id as number,
	}));
}

export async function getCollections(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const projectId = this.getCurrentNodeParameter('projectId') as number | string;
	if (!projectId) return [];

	const response = await llmPulseApiRequest.call(this, 'GET', '/dimensions/collections', undefined, {
		project_id: projectId,
	});
	const collections = (response.collections as IDataObject[] | undefined) ?? [];

	return collections.map((collection) => ({
		name: collection.name as string,
		value: collection.id as number,
	}));
}

export async function getTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const projectId = this.getCurrentNodeParameter('projectId') as number | string;
	if (!projectId) return [];

	const response = await llmPulseApiRequest.call(this, 'GET', '/dimensions/tags', undefined, {
		project_id: projectId,
	});
	const tags = (response.collections as IDataObject[] | undefined) ?? [];

	return tags.map((tag) => ({
		name: tag.name as string,
		value: tag.id as number,
	}));
}

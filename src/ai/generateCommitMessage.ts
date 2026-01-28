export interface GenerateCommitMessageParams {
	baseURL: string;
	modelId: string;
	apiKey: string;
	authHeaderName: string;
	authHeaderValuePrefix: string;
	extraHeaders: Record<string, string>;
	temperature: number;
	prompt: string;
}

function toHeaders(
	authHeaderName: string,
	authHeaderValuePrefix: string,
	apiKey: string,
	extraHeaders: Record<string, string>,
): Record<string, string> {
	const name = authHeaderName.trim() || 'Authorization';
	const prefix = authHeaderValuePrefix ?? '';
	return {
		...extraHeaders,
		[name]: `${prefix}${apiKey}`,
	};
}

export async function generateCommitMessage(params: GenerateCommitMessageParams): Promise<string> {
	const { generateText } = await import('ai');
	const { createOpenAICompatible } = await import('@ai-sdk/openai-compatible');

	const headers = toHeaders(
		params.authHeaderName,
		params.authHeaderValuePrefix,
		params.apiKey,
		params.extraHeaders,
	);

	const provider = createOpenAICompatible({
		name: 'openai-compatible',
		baseURL: params.baseURL,
		headers,
	});

	const { text } = await generateText({
		model: provider.chatModel(params.modelId),
		prompt: params.prompt,
		temperature: params.temperature,
	});

	return text;
}

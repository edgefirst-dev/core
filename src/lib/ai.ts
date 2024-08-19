import type {
	Ai,
	BaseAiImageClassification,
	BaseAiImageClassificationModels,
	BaseAiImageToText,
	BaseAiImageToTextModels,
	BaseAiObjectDetection,
	BaseAiObjectDetectionModels,
	BaseAiSpeechRecognition,
	BaseAiSpeechRecognitionModels,
	BaseAiSummarization,
	BaseAiSummarizationModels,
	BaseAiTextClassification,
	BaseAiTextClassificationModels,
	BaseAiTextEmbeddings,
	BaseAiTextEmbeddingsModels,
	BaseAiTextGeneration,
	BaseAiTextGenerationModels,
	BaseAiTextToImage,
	BaseAiTextToImageModels,
	BaseAiTranslation,
	BaseAiTranslationModels,
} from "@cloudflare/workers-types";

export namespace AI {
	export namespace Model {
		export type TextToImage = BaseAiTextToImageModels;
		export type ImageToText = BaseAiImageToTextModels;
		export type Translation = BaseAiTranslationModels;
		export type Summarization = BaseAiSummarizationModels;
		export type TextEmbeddings = BaseAiTextEmbeddingsModels;
		export type TextGeneration = BaseAiTextGenerationModels;
		export type ObjectDetection = BaseAiObjectDetectionModels;
		export type SpeechRecognition = BaseAiSpeechRecognitionModels;
		export type TextClassification = BaseAiTextClassificationModels;
		export type ImageClassification = BaseAiImageClassificationModels;
	}

	export type Model =
		| Model.TextToImage
		| Model.ImageToText
		| Model.Translation
		| Model.Summarization
		| Model.TextEmbeddings
		| Model.TextGeneration
		| Model.ObjectDetection
		| Model.SpeechRecognition
		| Model.TextClassification
		| Model.ImageClassification;

	export namespace Input {
		export type TextToImage = BaseAiTextToImage["inputs"];
		export type ImageToText = BaseAiImageToText["inputs"];
		export type Translation = BaseAiTranslation["inputs"];
		export type Summarization = BaseAiSummarization["inputs"];
		export type TextEmbeddings = BaseAiTextEmbeddings["inputs"];
		export type TextGeneration = BaseAiTextGeneration["inputs"];
		export type ObjectDetection = BaseAiObjectDetection["inputs"];
		export type SpeechRecognition = BaseAiSpeechRecognition["inputs"];
		export type TextClassification = BaseAiTextClassification["inputs"];
		export type ImageClassification = BaseAiImageClassification["inputs"];
	}

	export type Input =
		| Input.TextToImage
		| Input.ImageToText
		| Input.Translation
		| Input.Summarization
		| Input.TextEmbeddings
		| Input.TextGeneration
		| Input.ObjectDetection
		| Input.SpeechRecognition
		| Input.TextClassification
		| Input.ImageClassification;

	export namespace Output {
		export type TextToImage = BaseAiTextToImage["postProcessedOutputs"];
		export type ImageToText = BaseAiImageToText["postProcessedOutputs"];
		export type Translation = BaseAiTranslation["postProcessedOutputs"];
		export type Summarization = BaseAiSummarization["postProcessedOutputs"];
		export type TextEmbeddings = BaseAiTextEmbeddings["postProcessedOutputs"];
		export type TextGeneration = BaseAiTextGeneration["postProcessedOutputs"];
		export type ObjectDetection = BaseAiObjectDetection["postProcessedOutputs"];
		export type SpeechRecognition =
			BaseAiSpeechRecognition["postProcessedOutputs"];
		export type TextClassification =
			BaseAiTextClassification["postProcessedOutputs"];
		export type ImageClassification =
			BaseAiImageClassification["postProcessedOutputs"];
	}

	export type Output =
		| Output.TextToImage
		| Output.ImageToText
		| Output.Translation
		| Output.Summarization
		| Output.TextEmbeddings
		| Output.TextGeneration
		| Output.ObjectDetection
		| Output.SpeechRecognition
		| Output.TextClassification
		| Output.ImageClassification;

	export interface GatewayOptions {
		id: string;
		cacheTtl?: number;
		skipCache?: boolean;
		metadata?: Record<string, number | string | boolean | null | bigint>;
	}

	export interface Options {
		gateway?: GatewayOptions;
		prefix?: string;
		extraHeaders?: object;
	}
}

export class AI {
	constructor(protected ai: Ai) {}

	get run() {
		return this.ai.run.bind(this.ai);
	}

	async run(
		model: AI.Model.TextClassification,
		inputs: AI.Input.TextClassification,
		options?: AI.Options,
	): Promise<AI.Output.TextClassification>;
	async run(
		model: AI.Model.ImageClassification,
		inputs: AI.Input.ImageClassification,
		options?: AI.Options,
	): Promise<AI.Output.ImageClassification>;
	async run(
		model: AI.Model.TextToImage,
		inputs: AI.Input.TextToImage,
		options?: AI.Options,
	): Promise<AI.Output.TextToImage>;
	async run(
		model: AI.Model.ImageToText,
		inputs: AI.Input.ImageToText,
		options?: AI.Options,
	): Promise<AI.Output.ImageToText>;
	async run(
		model: AI.Model.Translation,
		inputs: AI.Input.Translation,
		options?: AI.Options,
	): Promise<AI.Output.Translation>;
	async run(
		model: AI.Model.Summarization,
		inputs: AI.Input.Summarization,
		options?: AI.Options,
	): Promise<AI.Output.Summarization>;
	async run(
		model: AI.Model.TextEmbeddings,
		inputs: AI.Input.TextEmbeddings,
		options?: AI.Options,
	): Promise<AI.Output.TextEmbeddings>;
	async run(
		model: AI.Model.TextGeneration,
		inputs: AI.Input.TextGeneration,
		options?: AI.Options,
	): Promise<AI.Output.TextGeneration>;
	async run(
		model: AI.Model.ObjectDetection,
		inputs: AI.Input.ObjectDetection,
		options?: AI.Options,
	): Promise<AI.Output.ObjectDetection>;
	async run(
		model: AI.Model.SpeechRecognition,
		inputs: AI.Input.SpeechRecognition,
		options?: AI.Options,
	): Promise<AI.Output.SpeechRecognition>;
	async run(
		model: AI.Model,
		inputs: AI.Input,
		options?: AI.Options,
	): Promise<AI.Options> {
		// @ts-expect-error - The Worker AI types expect a specific model, because
		// we're using a union type, TS marks it as an error, but it's fine since we
		// are using overloads to handle the different models, inputs and outputs
		return this.ai.run(model, inputs, options);
	}
}

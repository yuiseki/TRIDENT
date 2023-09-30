import { LLM, BaseLLMParams, BaseLLMCallOptions } from "langchain/llms/base";

type LlamaCppServerCompletionCallParams = {
  temperature?: number;
  n_predict?: number;
  repeat_penalty?: number;
  stop?: string[];
};

export class LlamaCppServerCompletion extends LLM<
  BaseLLMCallOptions & LlamaCppServerCompletionCallParams
> {
  temperature = 0.8;
  n_predict = 128;
  repeat_penalty = 1.1;
  stop = [];

  constructor(fields?: BaseLLMParams & LlamaCppServerCompletionCallParams) {
    super(fields ?? {});
    this.temperature = fields?.temperature ?? this.temperature;
    this.n_predict = fields?.n_predict ?? this.n_predict;
    this.repeat_penalty = fields?.repeat_penalty ?? this.repeat_penalty;
  }

  async _call(
    prompt: string,
    options?: this["ParsedCallOptions"]
  ): Promise<string> {
    return this.caller.call(async () => {
      try {
        const res = await this.callCompletionApi(prompt, options);
        const resJson = await res.json();
        return resJson.content;
      } catch (e) {
        throw e;
      }
    });
  }

  _llmType(): string {
    return "llama-cpp-server";
  }

  private async callCompletionApi(
    input: string,
    options?: LlamaCppServerCompletionCallParams
  ) {
    options = options ?? {};
    options.temperature = this.temperature;
    options.n_predict = this.n_predict;
    options.repeat_penalty = this.repeat_penalty;
    // options.stop = this.stop;
    return fetch("http://localhost:8080/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input,
        ...options,
      }),
    });
  }
}

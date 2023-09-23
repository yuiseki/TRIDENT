import { LLM, BaseLLMParams, BaseLLMCallOptions } from "langchain/llms/base";

type LlamaCppServerCompletionCallParams = {
  temperature: number;
  n_predict: number;
  repeat_penalty: number;
  stop: string[];
};

export class LlamaCppServerCompletion extends LLM<
  BaseLLMCallOptions & LlamaCppServerCompletionCallParams
> {
  constructor(fields?: BaseLLMParams) {
    super(fields ?? {});
  }

  async _call(
    prompt: string,
    options: this["ParsedCallOptions"]
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
    options: LlamaCppServerCompletionCallParams
  ) {
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

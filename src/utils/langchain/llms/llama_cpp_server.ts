import { LLM, BaseLLMParams } from "langchain/llms/base";

export interface LlamaCppServerCompletionInput extends BaseLLMParams {
  temperature?: number;
  n_predict?: number;
  repeat_penalty?: number;
  stop?: string[];
}

export class LlamaCppServerCompletion
  extends LLM
  implements LlamaCppServerCompletionInput
{
  temperature?: number;
  n_predict?: number;
  repeat_penalty?: number;
  stop?: string[];

  constructor(fields?: LlamaCppServerCompletionInput) {
    super(fields ?? {});

    this.temperature = fields?.temperature ?? 0.0;
    this.n_predict = fields?.n_predict ?? 64;
    this.repeat_penalty = fields?.repeat_penalty ?? 1.2;
    this.stop = fields?.stop ?? [];
  }

  _llmType(): string {
    return "llama-cpp-server";
  }

  async _call(
    prompt: string,
    options: this["ParsedCallOptions"]
  ): Promise<string> {
    const res = await this.caller.callWithOptions(
      { signal: options.signal },
      this._generateText.bind(this),
      prompt
    );
    return res ?? "";
  }

  protected async _generateText(input: string) {
    const body = {
      prompt: input,
      temperature: this.temperature,
      n_predict: this.n_predict,
      repeat_penalty: this.repeat_penalty,
      stop: this.stop,
    };
    const res = await fetch("http://localhost:8080/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return json.content;
  }
}

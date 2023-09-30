import {
  BasePromptTemplate,
  BaseStringPromptTemplate,
  SerializedBasePromptTemplate,
  StringPromptValue,
  renderTemplate,
} from "langchain/prompts";
import { AgentStep, InputValues, PartialValues } from "langchain/schema";
import { Tool } from "langchain/tools";

// You MUST ALWAYS think in English.
const PREFIX = `You are an helpful assistant.
You always respond to request as accurately as possible.
You respond as quickly as possible.
You can use the following tools to help you answer the question, But you can't use the same tools over and over again.
`;
const formatInstructions = (
  toolNames: string
) => `You MUST ALWAYS use the following format in your response:

Question: the input question you must answer
Thought: you should always think about what to do as detail as possible, based on question and observation.
Action Name: the action to take, should be one of [${toolNames}]. Action always takes an input.
Action Input: the input to the action.
Observation: the result of the action.
... (this Thought/Action/Action Input/Observation can be repeated up to 10 times)
Thought: I now know the final answer.
Final Answer: the final answer to the question.
`;
const SUFFIX = `Take a deep breath, calm down, and take it one step at a time.
Begin!

Question: {input}
Thought:{agent_scratchpad}`;

export class TridentAgentPromptTemplate extends BaseStringPromptTemplate {
  tools: Tool[];

  constructor(args: { tools: Tool[]; inputVariables: string[] }) {
    super({ inputVariables: args.inputVariables });
    this.tools = args.tools;
  }

  _getPromptType(): string {
    return "prompt";
  }

  format(input: InputValues): Promise<string> {
    /** Construct the final template */
    const toolStrings = this.tools
      .map((tool) => `${tool.name}: ${tool.description}`)
      .join("\n");
    const toolNames = this.tools.map((tool) => tool.name).join("\n");
    const instructions = formatInstructions(toolNames);
    const template = [PREFIX, toolStrings, instructions, SUFFIX].join("\n\n");
    /** Construct the agent_scratchpad */
    const intermediateSteps = input.intermediate_steps as AgentStep[];
    const agentScratchpad = intermediateSteps.reduce(
      (thoughts, { action, observation }) =>
        thoughts +
        [action.log, `\nObservation: ${observation}`, "Thought:"]
          .join("\n")
          .replace("\n\n", "\n"),
      ""
    );
    const newInput = { agent_scratchpad: agentScratchpad, ...input };
    /** Format the template. */
    return Promise.resolve(renderTemplate(template, "f-string", newInput));
  }

  partial(
    values: PartialValues
  ): Promise<BasePromptTemplate<any, StringPromptValue, any>> {
    return new Promise((resolve, reject) => {
      return undefined;
    });
  }

  serialize(): SerializedBasePromptTemplate {
    throw new Error("Not implemented");
  }
}

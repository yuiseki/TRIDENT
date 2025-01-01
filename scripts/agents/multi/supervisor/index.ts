import { END, Annotation } from "@langchain/langgraph";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { START, StateGraph } from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";
import { loadSupervisorChain } from "./supervisor";
import { loadWikipediaAgent } from "../../wikipedia";
import fs from "node:fs/promises";
import { ChatOllama } from "@langchain/ollama";
import { loadTavilySearchAgent } from "../../tavily";



const model = new ChatOllama({
  model: "qwen2.5:7b",
  temperature: 0,
});

// This defines the object that is passed between each node
// in the graph. We will create different nodes for each agent and tool
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  // The agent node that last performed work
  next: Annotation<string>({
    reducer: (x, y) => y ?? x ?? END,
    default: () => END,
  }),
});

const members = ["wikipedia_researcher"] as const;

const wikipediaResearcherNode = async (
  state: typeof AgentState.State,
  config?: RunnableConfig
) => {
  const wikipediaAgent = await loadWikipediaAgent(model);
  const result = await wikipediaAgent.invoke(state, config);
  const lastMessage = result.messages[result.messages.length - 1];
  return {
    messages: [
      new HumanMessage({
        content: lastMessage.content,
        name: "Wikipedia Researcher",
      }),
    ],
  };
};

const tavilySearcherNode = async (
  state: typeof AgentState.State,
  config?: RunnableConfig
) => {
  const tavilyAgent = await loadTavilySearchAgent(model);
  const result = await tavilyAgent.invoke(state, config);
  const lastMessage = result.messages[result.messages.length - 1];
  return {
    messages: [
      new HumanMessage({
        content: lastMessage.content,
        name: "Tavily Searcher",
      }),
    ],
  };
};

const supervisorNode = async (
  state: typeof AgentState.State,
  config?: RunnableConfig
) => {
  const supervisorChain = await loadSupervisorChain(model, members);
  const result = await supervisorChain.invoke(state, config);
  return {
    next: result.next,
  };
};

// 1. Create the graph
const workflow = new StateGraph(AgentState)
  // 2. Add the nodes; these will do the work
  .addNode("wikipedia_researcher", wikipediaResearcherNode)
  .addNode("supervisor", supervisorNode);
// 3. Define the edges. We will define both regular and conditional ones
// After a worker completes, report to supervisor
members.forEach((member) => {
  workflow.addEdge(member, "supervisor");
});

workflow.addConditionalEdges(
  "supervisor",
  (x: typeof AgentState.State) => x.next
);

workflow.addEdge(START, "supervisor");

const graph = workflow.compile();

const representation = await graph.getGraphAsync();
const image = await representation.drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();
const buffer = new Uint8Array(arrayBuffer);

// ./tmp/graph.png に書き出す
await fs.writeFile("./tmp/graph.png", buffer);

let streamResults = graph.stream(
  {
    messages: [
      new HumanMessage({
        content: `以下の災害に関するGISオープンデータを探してください:

Since the end of April, heavy rainfall has been affecting several parts of Uganda, causing floods and leading to casualties and damage. According to the International Federation of Red Cross and Red Crescent Societies (IFRC), as many as 49 people died, 28 are still missing, and 296 others have been injured. In addition, almost 18,500 people have been displaced and 39,185 affected across more than 15 districts of the country. For the next 48 hours, moderate rain is expected across the northern, central and southern parts of Uganda. With DG ECHO support, IFRC, through the Uganda Red Cross Society, is providing assistance with distribution of Non-Food Items (NFIs), de-silting kits to de-silt water channels and construct partly destroyed shelters, deployment of Red Cross volunteers, and is engaged in the search and rescue response along with district authorities. ([ECHO, 15 May 2024](https://reliefweb.int/node/4062536))\n\nIn April 2024, the Eastern Uganda-Elgon region experienced heavy rainfall, as forecasted by the Uganda National Meteorological Authority (UNMA). This resulted in significant impacts from episodic floods, hailstorms, and landslides in various areas, including Mbale, Kapchorwa, Bulambuli, Bukedea, Butaleja, Sironko, Bududa, and Namisindwa. A total of 18,323 people were affected, including thousands of displaced families, with 1,129 houses and several crop lands and infrastructures completely destroyed. The rains intensified in the first half of May, causing water levels to rise and rivers such as Manafwa, Lwakhakha, Sironko, Mpologoma, Awoja, Nbuyonga, and Namatala to overflow, increasing the water flow from the slopes of Mount Elgon. Unprecedented flooding occurred, especially between May 7th and 11th, exacerbating the impacts experienced throughout April. By mid-May, 39,185 people had been affected by the floods, compounding the already dire humanitarian situation from April. Further, Ntoroko district witnessed its ever-recorded highest levels of flooding in August whose assessment reveals that 2,355 households comprising of 11,775 people have been greatly impacted. ([IFRC, 30 Aug 2024](https://reliefweb.int/node/4090368))\n\nHeavy rain downpours on 7 September in the western town of Kasese caused severe flooding after River Nyamwamba burst its banks affected residents in Nyamwamba Division of Kasese Town. Uganda Red Cross reports, as of 9 September, two fatalities, 1,469 households affected in 13 villages and more than 120 homes have been damaged or destroyed, leaving hundreds of families without shelter. ([ECHO, 10 Sep 2024](https://reliefweb.int/node/4092745))\n\nFollowing heavy rains on 27 November, the Bulambuli district in the Mount Elgon subregion has been severely affected by flooding and landslides. The roads have been cut-off by flood waters, including the main road from Sironko town to Kapchowa town, a bridge swept away and the River Simu has burst its banks. The International Federation of Red Cross and Red Crescent Societies (IFRC) indicates that 125 people are unaccounted for, and at least 15 people have been killed by landslide. Death toll may increase further. At least 22 people have been injured and are receiving medical attention in a local health centre. Local authorities have indicated that the majority of killed and injured people are children. Close to 1,000 people have been displaced. ([ECHO, 29 Nov 2024](https://reliefweb.int/node/4114459))
        `,
      }),
    ],
  },
  { recursionLimit: 100 }
);

for await (const output of await streamResults) {
  if (!output?.__end__) {
    console.log(output);
    console.log("----");
  }
}

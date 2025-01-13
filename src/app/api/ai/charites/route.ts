import { loadCharitesChain } from "@/utils/langchain/chains/charites";
import { getChatModel } from "@/utils/trident/getChatModel";
import { getEmbeddingModel } from "@/utils/trident/getEmbeddingModel";
import { Example } from "@langchain/core/prompts";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const req = await request.json();
  const fs = JSON.parse(req.fs) as {
    path: string;
    content: string;
  }[];
  const prompt = req.prompt as string;

  console.log("----- ----- -----");
  console.log("----- start charites-ai -----");
  console.log("Human:", prompt);

  const llm = getChatModel();
  const embeddings = getEmbeddingModel();

  const vectorStore = new MemoryVectorStore(embeddings);

  const charitesExamples: Example[] = fs.map((f) => {
    // {}がLangChain.jsで特別な意味を持つため、{{に置換する
    const convertedContent = f.content.replace(/{/g, "{{").replace(/}/g, "}}");
    // f.contentから # prompt: で始まる行が input
    const input =
      convertedContent
        .split("\n")
        .find((line) => line.startsWith("# prompt:")) ||
      "# prompt: 不明なファイル";
    return {
      input: input,
      // f.contentはYAML
      // f.contentの先頭にf.pathをコメントとして追加
      output: `# path: ${f.path}\n${convertedContent}`,
    };
  });

  const charitesChain = await loadCharitesChain({
    llm,
    vectorStore,
    examples: charitesExamples,
  });

  const result = await charitesChain.invoke({ input: prompt });

  // {{ を { に置換する
  // }} を } に置換する
  const convertedResultContent = result.content
    .replace(/{{/g, "{")
    .replace(/}}/g, "}");

  console.log("AI:", convertedResultContent);
  console.log("");
  console.log("----- end charites-ai -----");
  console.log("----- ----- -----");

  return NextResponse.json({
    prompt: prompt,
    content: convertedResultContent,
  });
}

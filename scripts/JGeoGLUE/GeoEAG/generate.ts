const rules = {
  GeoEAG: {
    description:
      "文章中に登場する2つの地名が同一の実体を指しているかどうかを評価するタスクである。",
    prompt:
      "例にあるように、同一の実体を指しているか2つの地名を列挙してください。",
    examples: [
      {
        sentence1: "USJ",
        sentence2: "ユニバーサル・スタジオ・ジャパン",
        label: "exact_match",
      },
      {
        sentence1: "米国",
        sentence2: "アメリカ",
        label: "partial_match",
      },
      {
        sentence1: "米国",
        sentence2: "アメリカ合衆国",
        label: "exact_match",
      },
      {
        sentence1: "東京都",
        sentence2: "東京",
        label: "partial_match",
      },
      {
        sentence1: "関空",
        sentence2: "関西国際空港",
        label: "exact_match",
      },
      {
        sentence1: "羽田",
        sentence2: "羽田空港",
        label: "partial_match",
      },
      {
        sentence1: "羽田空港",
        sentence2: "東京国際空港",
        label: "exact_match",
      },
      {
        sentence1: "成田",
        sentence2: "成田空港",
        label: "partial_match",
      },
    ],
  },
};

import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";

const promptTemplate = PromptTemplate.fromTemplate(
  `{sentence1}と{sentence2}は同じ場所を指していますか？
  以下の選択肢から選んでください。
  1. exact_match (完全一致)
  2. partial_match (部分一致)
  3. no_match (一致しない)
  4. unsure (わからない)`
);

const llm = new ChatOllama({
  model: "phi4:14b",
  temperature: 0.0,
  repeatPenalty: 1.2,
  numCtx: 1024,
  numPredict: 512,
});

for await (const example of rules.GeoEAG.examples) {
  console.log("===== ===== =====");
  const prompt = await promptTemplate.invoke({
    sentence1: example.sentence1,
    sentence2: example.sentence2,
  });
  console.log(`Sentence1: ${example.sentence1}`);
  console.log(`Sentence2: ${example.sentence2}`);
  const res = await llm.invoke(prompt);

  console.log(res.content);
  console.log("===== ===== =====");
}

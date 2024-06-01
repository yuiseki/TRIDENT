import { PromptTemplate } from "@langchain/core/prompts";

export const tridentSuggestExamplePrompt = PromptTemplate.fromTemplate(
  `Input:
{input}

Output:
{output}
`
);

export const tridentSuggestExampleInputKeys = ["input"];

export const tridentSuggestExampleList: Array<{
  input: string;
  output: string;
}> = [
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本`,
    output: `台東区を表示して
東京都を表示して
日本を表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
台東区を表示して`,
    output: `ラーメン屋を表示して
カフェを表示して
駅を表示して
病院を表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
台東区を表示して
ラーメン屋を表示して`,
    output: `蕎麦屋を表示して
寿司屋を表示して
ハンバーガー屋を表示して
カレー屋を表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
台東区を表示して
カフェを表示して`,
    output: `公園を表示して
ベンチを表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
台東区を表示して
公園を表示して`,
    output: `ベンチを表示して
川を表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
東京都を表示して`,
    output: `台東区に絞り込んで
文京区に絞り込んで
関東に広げて
日本に広げて`,
  },
  {
    input: `input:
Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
東京都を表示して
関東に広げて
台東区に絞り込んで`,
    output: `ラーメン屋を表示して
駅を表示して
公園を表示して
病院を表示して`,
  },
  {
    input: `Primary language of user: ja
Current location of user: 台東区, 東京都, 日本

Chat history:
日本を表示して`,
    output: `首都に絞り込んで
首都を表示して
広島に絞り込んで
沖縄に絞り込んで`,
  },
  {
    input: "New York",
    output: `Show the pizza shops in New York
Show the train stations in New York
Show the parks in New York
Show the hospitals in New York`,
  },
];

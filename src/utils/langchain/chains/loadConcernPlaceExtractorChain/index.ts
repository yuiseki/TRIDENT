import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SemanticSimilarityExampleSelector } from "@langchain/core/example_selectors";
import { FewShotPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { RunnableSequence } from "@langchain/core/runnables";

const concernPlaceExtractExamples: Array<{ input: string; output: string }> = [
  {
    input: `2023-11-17 配信
アメリカのバイデン政権で気候変動問題を担当するケリー特使が、NHKのインタビューに応じました。ケリー特使は、1年ぶりに行われた米中首脳会談を受けて、両国は、今月末から始まる国連の気候変動対策の会議「COP28」で、温室効果ガスの削減に向けた具体的な方策を共同で発表するという見通しを明らかにしました。`,
    output: `CurrentDate: 2023-11-17
WhatHappening: ケリー特使が、NHKのインタビューに応じました。
WhatHappening: ケリー特使が、両国は、今月末から始まる国連の気候変動対策の会議「COP28」で、温室効果ガスの削減に向けた具体的な方策を共同で発表するという見通しを明らかにしました。
DisplayMap: Unknown`,
  },
  {
    input: `2023-11-16 配信
ロシアと北朝鮮は、政府間で経済や科学技術の協力について話し合う委員会を15日に開催し、協力事業の拡大に向けて議定書に調印しました。国連安全保障理事会の決議に違反することになる、北朝鮮の労働者のロシアへの派遣についても話し合われた可能性が指摘されていて、関係国は懸念を強めています。`,
    output: `CurrentDate: 2023-11-16
WhatHappening: ロシアと北朝鮮が、政府間で経済や科学技術の協力について話し合う委員会を開催しました。
WhatHappening: ロシアと北朝鮮が、協力事業の拡大に向けて議定書に調印しました。
WhatHappening: 北朝鮮の労働者のロシアへの派遣についても話し合われた可能性が指摘されています。
WhatHappening: 関係国は、懸念を強めています。
DisplayMap: ロシアの地図を表示します。
DisplayMap: 北朝鮮の地図を表示します。`,
  },
  {
    input: `2023-11-15 配信
国連は、各国の温室効果ガスの削減目標を分析した報告書を公表し、世界全体の排出量は2030年に減少に転じる見通しであるものの、気候の破滅的な状況を避けるためには十分ではないとして対策の一層の強化を呼びかけています。`,
    output: `CurrentDate: 2023-11-15
WhatHappening: 国連が、各国の温室効果ガスの削減目標を分析した報告書を公表しました。
WhatHappening: 国連が、世界全体の排出量は2030年に減少に転じる見通しであるものの、気候の破滅的な状況を避けるためには十分ではないとして対策の一層の強化を呼びかけています。
DisplayMap: Unknown`,
  },
  {
    input: `2023-11-12 配信
"UNDP＝国連開発計画は11日、ガザ地区にある国連の事務所に砲撃があり、敷地内に避難していた多くの住民に死者やけが人が出ているという報告を受けたと発表しました。`,
    output: `CurrentDate: 2023-11-12
WhatHappening: UNDP＝国連開発計画が、ガザ地区にある国連の事務所に砲撃があったと発表しました。
WhatHappening: UNDP＝国連開発計画が、敷地内に避難していた多くの住民に死者やけが人が出ているという報告を受けたと発表しました。
DisplayMap: ガザ地区の地図を表示します。
DisplayMap: ガザ地区のUNDPの施設の地図を表示します。`,
  },
  {
    input: `2023-11-12 配信
パレスチナ難民を支援するUNRWA＝国連パレスチナ難民救済事業機関は、10日の発表で、先月7日以降ガザ地区で亡くなった国連職員やスタッフの人数があわせて101人にのぼったと明らかにしました。また、イスラエル軍はガザ地区北部の住民に南部への退避を通告していて、10日も多くの人が避難を続けています。OCHA＝国連人道問題調整事務所は一連の衝突が始まってからガザ地区ではすでに人口の6割を超える150万人以上が住まいを追われているとしています。※11月11日（日本時間）のイスラエルやパレスチナに関する動きを随時更新でお伝えします。`,
    output: `CurrentDate: 2023-11-12
WhatHappening: UNRWA＝国連パレスチナ難民救済事業機関が、ガザ地区で亡くなった国連職員やスタッフの人数があわせて101人にのぼったと明らかにしました。
WhatHappening: イスラエル軍が、ガザ地区北部の住民に南部への退避を通告しました。
WhatHappening: OCHA＝国連人道問題調整事務所が、ガザ地区の人口の6割を超える150万人以上が住まいを追われているとしました。
DisplayMap: ガザ地区の地図を表示します。
DisplayMap: ガザ地区のUNRWAの施設の地図を表示します。
DisplayMap: ガザ地区のOCHAの施設の地図を表示します。
DisplayMap: ガザ地区の避難民キャンプの地図を表示します。`,
  },
  {
    input: `2023-11-09 配信
パレスチナのガザ地区の病院でイスラエル軍による攻撃で被害が相次いでいることについて、国連安全保障理事会で緊急会合が開かれ、各国からは懸念を示す意見が相次ぎましたが、アメリカはイスラム組織ハマスが病院に武器を保管しているなどとしてイスラエルを擁護する姿勢も示しました。`,
    output: `CurrentDate: 2023-11-09
WhatHappening: ガザ地区の病院で、イスラエル軍による攻撃が相次いでいます。
WhatHappening: 国連安全保障理事会で緊急会合が開かれ、各国からは懸念を示す意見が相次ぎました。
WhatHappening: アメリカが、イスラム組織ハマスが病院に武器を保管しているなどとしてイスラエルを擁護する姿勢を示しました。
DisplayMap: ガザ地区の地図を表示します。
DisplayMap: ガザ地区の病院の地図を表示します。`,
  },
  {
    input: `2023-11-06 配信
少なくとも157人が死亡したネパール西部の山岳地帯で発生した地震では、これまでに少なくとも560人余りのけが人が確認され、その半数が子どもたちであることがわかり、ユニセフ＝国連児童基金が被災地での支援を急いでいます。`,
    output: `CurrentDate: 2023-11-06
WhatHappening: ネパールの山岳地帯で、地震が発生しました。
WhatHappening: 少なくとも157人が、死亡しました。
WhatHappening: 少なくとも560人余りのけが人が確認され、その半数が子どもたちであることがわかっています。
WhatHappening: ユニセフ＝国連児童基金が、被災地での支援を急いでいます。
DisplayMap: ネパールの地図を表示します。
DisplayMap: ネパールのユニセフの施設の地図を表示します。`,
  },
  {
    input: `2023-11-06 配信
アフガニスタンで実権を握るイスラム主義勢力タリバンが女性への抑圧を強める中、UNDP＝国連開発計画のアジア太平洋地域の責任者がNHKの取材に応じ、女性の就労の権利などが制限されている現状に懸念を示したうえで、国際社会はタリバンとの対話を試みながら、女性たちへの支援を模索していくことが重要だと、訴えました。`,
    output: `CurrentDate: 2023-11-06
WhatHappening: アフガニスタンで、実権を握るイスラム主義勢力タリバンが、女性への抑圧を強めています。
WhatHappening: UNDP＝国連開発計画のアジア太平洋地域の責任者が、女性の就労の権利などが制限されている現状に懸念を示しました。
WhatHappening: UNDP＝国連開発計画のアジア太平洋地域の責任者が、国際社会はタリバンとの対話を試みながら、女性たちへの支援を模索していくことが重要だと訴えました。
DisplayMap: アフガニスタンの地図を表示します。
DisplayMap: アフガニスタンのUNDPの施設の地図を表示します。`,
  },
  {
    input: `2023-11-05 配信
ガザ地区北部では4日、大勢の住民が避難している学校で爆発があり、地元当局は15人が死亡したと発表しました。`,
    output: `CurrentDate: 2023-11-05
WhatHappening: ガザ地区北部では、大勢の住民が避難している学校で爆発がありました。
WhatHappening: 地元当局は、15人が死亡したと発表しました。
DisplayMap: ガザ地区の地図を表示します。
DisplayMap: ガザ地区の学校の地図を表示します。
DisplayMap: ガザ地区の避難民キャンプの地図を表示します。`,
  },
  {
    input: `2023-11-01 配信
紛争地の医療支援などに取り組むUNOPS＝国連プロジェクト・サービス機関のモレイラ・ダ・シルバ事務局長がNHKの取材に応じ、パレスチナのガザ地区で民間人に被害が広がっている現状に強い懸念を示したうえで、けが人の治療にあたっている病院に電力を供給するために、人道物資とともに燃料の搬入を直ちに認めるべきだと、訴えました。`,
    output: `CurrentDate: 2023-11-01
WhatHappening: UNOPS＝国連プロジェクト・サービス機関のモレイラ・ダ・シルバ事務局長が、NHKの取材に応じました。
WhatHappening: UNOPS＝国連プロジェクト・サービス機関のモレイラ・ダ・シルバ事務局長が、パレスチナのガザ地区で民間人に被害が広がっている現状に強い懸念を示しました。
WhatHappening: UNOPS＝国連プロジェクト・サービス機関のモレイラ・ダ・シルバ事務局長が、けが人の治療にあたっている病院に電力を供給するために、人道物資とともに燃料の搬入を直ちに認めるべきだと訴えました。
DisplayMap: ガザ地区の地図を表示します。
DisplayMap: ガザ地区のUNOPSの施設の地図を表示します。
DisplayMap: ガザ地区の病院の地図を表示します。
DisplayMap: ガザ地区の発電所の地図を表示します。`,
  },
  {
    input: `2023-11-01 配信
岸田総理大臣は今月末からUAE＝アラブ首長国連邦で開かれる国連の気候変動対策の会議「COP28」に出席する方向で調整を進めています。日本の取り組みを説明した上で、対策推進に向けて国際社会の協調を呼びかける方針です。`,
    output: `CurrentDate: 2023-11-01
WhatHappening: Unknown
DisplayMap: Unknown`,
  },
  {
    input: `2023-11-01 配信
国連の安全保障理事会では、ウクライナ情勢をめぐる会合が開かれ、国連の高官は、去年2月のロシアによる軍事侵攻以降、ウクライナでは9900人以上の市民が死亡したと明らかにし、イスラエル軍とイスラム組織ハマスの軍事衝突が続く中でも、ウクライナの人道状況の悪化に国際社会が対処すべきだと訴えました。`,
    output: `CurrentDate: 2023-11-01
WhatHappening: 国連の安全保障理事会で、ウクライナ情勢をめぐる会合が開かれました。
WhatHappening: 国連の高官が、去年2月のロシアによる軍事侵攻以降、ウクライナでは9900人以上の市民が死亡したと明らかにしました。
WhatHappening: 国連の高官が、イスラエル軍とイスラム組織ハマスの軍事衝突が続く中でも、ウクライナの人道状況の悪化に国際社会が対処すべきだと訴えました。
DisplayMap: ウクライナの地図を表示します。`,
  },
  {
    input: `2023-10-20 配信
ガザ地区の人道状況が日々悪化し、20日にもエジプト側から始まる予定だった支援物資の搬入が遅れる中、国連のグテーレス事務総長がガザ地区とエジプトの境界にある検問所を訪れました。一刻も早い物資の搬入などを訴えたものの、搬入の具体的な時期については言及しませんでした。`,
    output: `CurrentDate: 2023-10-20
WhatHappening: ガザ地区の人道状況が日々悪化しています。
WhatHappening: 20日にもエジプト側から始まる予定だった支援物資の搬入が遅れています。
WhatHappening: 国連のグテーレス事務総長が、ガザ地区とエジプトの境界にある検問所を訪れました。
WhatHappening: 国連のグテーレス事務総長が、一刻も早い物資の搬入などを訴えました。
WhatHappening: 国連のグテーレス事務総長が、搬入の具体的な時期については言及しませんでした。
WhatHappening: 国連は、避難民キャンプが標的になったとして強く非難しています。
DisplayMap: ガザ地区の地図を表示します。
DisplayMap: エジプトの地図を表示します。
DisplayMap: ラファ検問所の地図を表示します。`,
  },
  {
    input: `2023-10-10 配信
ミャンマーでは、実権を握る軍と民主派勢力との間での戦闘が激しさを増す中、北部にある避難民キャンプに攻撃があり、軍と対立する武装勢力の報道官は、子ども11人を含む少なくとも29人が死亡したと明らかにしました。国連は、避難民キャンプが標的になったとして強く非難しています。`,
    output: `CurrentDate: 2023-10-10
WhatHappening: ミャンマーでは、実権を握る軍と民主派勢力との間での戦闘が激しさを増しています。
WhatHappening: 北部にある避難民キャンプに攻撃がありました。
WhatHappening: 武装勢力の報道官は、子ども11人を含む少なくとも29人が死亡したと明らかにしました。
WhatHappening: 国連は、避難民キャンプが標的になったとして強く非難しています。
DisplayMap: ミャンマーの地図を表示します。
DisplayMap: ミャンマーの軍事施設の地図を表示します。
DisplayMap: ミャンマーの国連施設の地図を表示します。
DisplayMap: ミャンマーの避難民キャンプの地図を表示します。`,
  },
  {
    input: `2023-10-05 配信
インド北東部の山あいで、大雨による洪水が起き、地元メディアは、これまでに少なくとも14人が死亡し、100人以上の行方がわからなくなっていると伝えています。`,
    output: `CurrentDate: 2023-10-05
WhatHappening: インド北東部の山あいで、大雨による洪水が起きました。
WhatHappening: 地元メディアは、これまでに少なくとも14人が死亡し、100人以上の行方がわからなくなっていると伝えています。
DisplayMap: インドの地図を表示します。`,
  },
  {
    input: `2023-09-16 配信
北アフリカのリビアで発生した大規模な洪水について、大きな被害を受けた地元の市長は、これまでにおよそ8000人が死亡し、さらに多くの犠牲者が出ているおそれがあるとしています。国連は救助活動や医療体制の整備が求められているとして、国際社会に緊急の支援を呼びかけています。`,
    output: `CurrentDate: 2023-09-16
WhatHappening: リビアで、大規模な洪水が発生しました。
WhatHappening: 地元の市長は、これまでにおよそ8000人が死亡し、さらに多くの犠牲者が出ているおそれがあるとしています。
WhatHappening: 国連は、救助活動や医療体制の整備が求められているとして、国際社会に緊急の支援を呼びかけています。
DisplayMap: リビアの地図を表示します。
DisplayMap: リビアの国連施設の地図を表示します。`,
  },
];

export const setupConcernPlaceExtractorDynamicPrompt = async () => {
  let embeddings: OpenAIEmbeddings;
  embeddings = new OpenAIEmbeddings();
  const memoryVectorStore = new MemoryVectorStore(embeddings);
  const concernPlaceExtractExampleSelector =
    new SemanticSimilarityExampleSelector({
      vectorStore: memoryVectorStore,
      k: 3,
      inputKeys: ["input"],
    });
  for (const example of concernPlaceExtractExamples) {
    await concernPlaceExtractExampleSelector.addExample(example);
  }

  const concernPlaceExtractorExamplePrompt = PromptTemplate.fromTemplate(
    `Input:
{input}

Output:
{output}
`
  );

  const dynamicPrompt = new FewShotPromptTemplate({
    exampleSelector: concernPlaceExtractExampleSelector,
    examplePrompt: concernPlaceExtractorExamplePrompt,
    prefix: `You are a text mining system that extracts events and their locations mentioned in a input text.

Entity Definition and Output Format:
CurrentDate: Current date mentioned in the text.
WhatHappening: Concise summary of event, SHOULD be includes where, who, what, MUST be same language as input text.
DisplayMap: Instruction to generate the best maps to describe the input text.
... (You MUST ALWAYS output only one CurrentDate. If it is unclear, output as Unknown)
... (You MUST ALWAYS output at least one WhatHappening. If it is unclear, output as Unknown)
... (You MUST ALWAYS output at least one DisplayMap. If it is unclear, output as Unknown)
... (this WhatHappening/DisplayMap can repeat N times)

You will always reply according to the following rules:
- You extract WhatHappening as only past events that have already occurred or are in progress.
- If it is a future event, you MUST output WhatHappening as Unknown.
- You MUST ALWAYS, without fail, output DisplayMap for the place mentioned in the input.

Examples:`,
    suffix: `===
Input:
{input}

Output:
`,
    inputVariables: ["input"],
  });
  return dynamicPrompt;
};

export const loadConcernPlaceExtractorChain = async ({
  llm,
}: {
  llm: BaseLanguageModel;
}): Promise<RunnableSequence<any, any>> => {
  const dynamicPrompt = await setupConcernPlaceExtractorDynamicPrompt();
  const chain = RunnableSequence.from([dynamicPrompt, llm]);
  return chain;
};

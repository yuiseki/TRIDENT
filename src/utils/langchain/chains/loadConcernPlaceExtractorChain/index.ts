import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { PromptTemplate } from "langchain/prompts";

export const loadConcernPlaceExtractorChain = ({
  llm,
}: {
  llm: BaseLanguageModel;
}): LLMChain => {
  const concernPlaceExtractorPromptTemplateString = `You are a text mining system that extracts events and their locations mentioned in a input text.

Entity Definition and Output Format:
CurrentDate: Current date mentioned in the text.
WhereHappening: Name of the place where the event is happening.
WhoAndWhatHappening: Concise summary of event, SHOULD be includes who, what, MUST be same language as input text.
RequestToDisplayMap: Request text to display the best map to show Input text
... (You MUST ALWAYS output only one CurrentDate. If it is unclear, output as Unknown)
... (You MUST ALWAYS output only one WhereHappening. If it is unclear, output as Unknown)
... (You MUST ALWAYS output at least one RequestToDisplayMap. If it is unclear, output as Unknown)
... (You MUST ALWAYS output at least one WhoAndWhatHappening. If it is unclear, output as Unknown)
... (this WhereHappening/WhoAndWhatHappening can repeat N times)

You will always reply according to the following rules:
- You extract only past events that have already occurred or are in progress.
- If it is a future event, you output WhoAndWhatHappening as Unknown.
- WhereHappening should output only one simple place name that is well known in OpenStreetMap.
- Keep in mind that WhereHappening will be used for searches in OpenStreetMap.
- WhereHappening should be where the strongest interest or concern is expressed in the context of the Input text.
- For example, if the Input text says that Ukraine is being discussed at the UN Security Council, the WhereHappening should be Ukraine, not the UN Security Council.

Examples:
-----
Input text:
2023-11-12 配信
"UNDP＝国連開発計画は11日、ガザ地区にある国連の事務所に砲撃があり、敷地内に避難していた多くの住民に死者やけが人が出ているという報告を受けたと発表しました。
Output:
CurrentDate: 2023-11-12
WhereHappening: ガザ地区
WhoAndWhatHappening: UNDP＝国連開発計画が、ガザ地区にある国連の事務所に砲撃があったと発表しました。
RequestToDisplayMap: ガザ地区の地図を表示します。
RequestToDisplayMap: ガザ地区のUNDPの施設の地図を表示します。

Input text:
2023-11-12 配信
パレスチナ難民を支援するUNRWA＝国連パレスチナ難民救済事業機関は、10日の発表で、先月7日以降ガザ地区で亡くなった国連職員やスタッフの人数があわせて101人にのぼったと明らかにしました。また、イスラエル軍はガザ地区北部の住民に南部への退避を通告していて、10日も多くの人が避難を続けています。OCHA＝国連人道問題調整事務所は一連の衝突が始まってからガザ地区ではすでに人口の6割を超える150万人以上が住まいを追われているとしています。※11月11日（日本時間）のイスラエルやパレスチナに関する動きを随時更新でお伝えします。
Output:
CurrentDate: 2023-11-12
WhereHappening: ガザ地区
WhoAndWhatHappening: UNRWA＝国連パレスチナ難民救済事業機関が、ガザ地区で亡くなった国連職員やスタッフの人数があわせて101人にのぼったと明らかにしました。
WhoAndWhatHappening: イスラエル軍が、ガザ地区北部の住民に南部への退避を通告しました。
WhoAndWhatHappening: OCHA＝国連人道問題調整事務所が、ガザ地区の人口の6割を超える150万人以上が住まいを追われているとしました。
RequestToDisplayMap: ガザ地区の地図を表示します。
RequestToDisplayMap: ガザ地区のUNRWAの施設の地図を表示します。
RequestToDisplayMap: ガザ地区のOCHAの施設の地図を表示します。
RequestToDisplayMap: ガザ地区の避難民キャンプの地図を表示します。

Input text:
2023-11-09 配信
パレスチナのガザ地区の病院でイスラエル軍による攻撃で被害が相次いでいることについて、国連安全保障理事会で緊急会合が開かれ、各国からは懸念を示す意見が相次ぎましたが、アメリカはイスラム組織ハマスが病院に武器を保管しているなどとしてイスラエルを擁護する姿勢も示しました。
Output:
CurrentDate: 2023-11-09
WhereHappening: ガザ地区
WhoAndWhatHappening: イスラエル軍が、ガザ地区の病院に攻撃を加えました。
WhoAndWhatHappening: 国連安全保障理事会で緊急会合が開かれ、各国からは懸念を示す意見が相次ぎました。
WhoAndWhatHappening: アメリカが、イスラム組織ハマスが病院に武器を保管しているなどとしてイスラエルを擁護する姿勢を示しました。
RequestToDisplayMap: ガザ地区の地図を表示します。
RequestToDisplayMap: ガザ地区の病院の地図を表示します。

Input text:
2023-11-06 配信
少なくとも157人が死亡したネパール西部の山岳地帯で発生した地震では、これまでに少なくとも560人余りのけが人が確認され、その半数が子どもたちであることがわかり、ユニセフ＝国連児童基金が被災地での支援を急いでいます。
Output:
CurrentDate: 2023-11-06
WhereHappening: ネパール
WhoAndWhatHappening: 山岳地帯で地震が発生しました。
WhoAndWhatHappening: 少なくとも157人が、死亡しました。
WhoAndWhatHappening: 少なくとも560人余りのけが人が確認され、その半数が子どもたちであることがわかっています。
WhoAndWhatHappening: ユニセフ＝国連児童基金が、被災地での支援を急いでいます。
RequestToDisplayMap: ネパールの地図を表示します。
RequestToDisplayMap: ネパールのユニセフの施設の地図を表示します。

Input text:
2023-11-06 配信
アフガニスタンで実権を握るイスラム主義勢力タリバンが女性への抑圧を強める中、UNDP＝国連開発計画のアジア太平洋地域の責任者がNHKの取材に応じ、女性の就労の権利などが制限されている現状に懸念を示したうえで、国際社会はタリバンとの対話を試みながら、女性たちへの支援を模索していくことが重要だと、訴えました。
Output:
CurrentDate: 2023-11-06
WhereHappening: アフガニスタン
WhoAndWhatHappening: イスラム主義勢力タリバンが、女性への抑圧を強めています。
WhoAndWhatHappening: UNDP＝国連開発計画のアジア太平洋地域の責任者が、女性の就労の権利などが制限されている現状に懸念を示しました。
RequestToDisplayMap: アフガニスタンの地図を表示します。
RequestToDisplayMap: アフガニスタンのUNDPの施設の地図を表示します。

Input text:
2023-11-01 配信
国連の安全保障理事会では、ウクライナ情勢をめぐる会合が開かれ、国連の高官は、去年2月のロシアによる軍事侵攻以降、ウクライナでは9900人以上の市民が死亡したと明らかにし、イスラエル軍とイスラム組織ハマスの軍事衝突が続く中でも、ウクライナの人道状況の悪化に国際社会が対処すべきだと訴えました。
Output:
CurrentDate: 2023-11-01
WhereHappening: ウクライナ
WhoAndWhatHappening: 国連の安全保障理事会で、ウクライナ情勢をめぐる会合が開かれました。
WhoAndWhatHappening: 国連の高官が、去年2月のロシアによる軍事侵攻以降、ウクライナでは9900人以上の市民が死亡したと明らかにしました。
WhoAndWhatHappening: 国連の高官が、イスラエル軍とイスラム組織ハマスの軍事衝突が続く中でも、ウクライナの人道状況の悪化に国際社会が対処すべきだと訴えました。
RequestToDisplayMap: ウクライナの地図を表示します。

Input text:
2023-10-20 配信
ガザ地区の人道状況が日々悪化し、20日にもエジプト側から始まる予定だった支援物資の搬入が遅れる中、国連のグテーレス事務総長がガザ地区とエジプトの境界にある検問所を訪れました。一刻も早い物資の搬入などを訴えたものの、搬入の具体的な時期については言及しませんでした。
Output:
CurrentDate: 2023-10-20
WhereHappening: ラファ検問所
WhoAndWhatHappening: ガザ地区の人道状況が日々悪化しています。
WhoAndWhatHappening: 20日にもエジプト側から始まる予定だった支援物資の搬入が遅れています。
WhoAndWhatHappening: 国連のグテーレス事務総長が、ガザ地区とエジプトの境界にある検問所を訪れました。
WhoAndWhatHappening: 国連のグテーレス事務総長が、一刻も早い物資の搬入などを訴えました。
WhoAndWhatHappening: 国連のグテーレス事務総長が、搬入の具体的な時期については言及しませんでした。
WhoAndWhatHappening: 国連は、避難民キャンプが標的になったとして強く非難しています。
RequestToDisplayMap: ラファ検問所の地図を表示します。

Input text:
2023-10-10 配信
ミャンマーでは、実権を握る軍と民主派勢力との間での戦闘が激しさを増す中、北部にある避難民キャンプに攻撃があり、軍と対立する武装勢力の報道官は、子ども11人を含む少なくとも29人が死亡したと明らかにしました。国連は、避難民キャンプが標的になったとして強く非難しています。
Output:
CurrentDate: 2023-10-10
WhereHappening: ミャンマー
WhoAndWhatHappening: 実権を握る軍と民主派勢力との間での戦闘が激しさを増しています。
WhoAndWhatHappening: 北部にある避難民キャンプに攻撃がありました。
WhoAndWhatHappening: 武装勢力の報道官は、子ども11人を含む少なくとも29人が死亡したと明らかにしました。
WhoAndWhatHappening: 国連は、避難民キャンプが標的になったとして強く非難しています。
RequestToDisplayMap: ミャンマーの地図を表示します。
RequestToDisplayMap: ミャンマーの避難民キャンプの地図を表示します。
-----

Input text:
{text}

Output:`;

  const concernPlaceExtractorPromptTemplate = PromptTemplate.fromTemplate(
    concernPlaceExtractorPromptTemplateString
  );
  const chain = new LLMChain({
    llm: llm,
    prompt: concernPlaceExtractorPromptTemplate,
  });
  return chain;
};

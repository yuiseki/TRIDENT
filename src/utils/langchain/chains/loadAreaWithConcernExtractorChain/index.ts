import { LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { PromptTemplate } from "langchain/prompts";

export const loadAreaWithConcernExtractorChain = ({
  llm,
}: {
  llm: BaseLanguageModel;
}): LLMChain => {
  const templateString = `You are a text mining system that extracts area and concerns mentioned in the input text.

Entity Definition and Output Format:
Area: geospatial area mentioned in the text.
AreaWithConcern: pair of geospatial area and specific concern mentioned in the text.
... (You MUST ALWAYS output at least one Area. If it is unclear, output as Unknown)
... (You MUST ALWAYS output at least one AreaWithConcern. If it is unclear, output as Unknown)
... (this Area/AreaWithConcern can repeat N times)

You will always reply according to the following rules:
- Note that what we call Concerns here is an interest in concrete categories of geographic features in OpenStreetMap.
- So, Be careful, You MUTS NOT include specific natural disasters like Floods or specific epidemics link Dengue hotspots, Dengue cases in Concerns.
- Also note that You MUST NOT include disruption, damages, risk, or impact of the disaster in Concerns.
- You ALWAYS, MUST NOT include too common geographic features like Houses, Roads and Bridges, Farmland and Coastal strip or Coastal areas. because it is too many and too general!!

Examples:
===
Input:
Heavy rainfall has been affecting southern and eastern Ethiopia, in particular the Somali Region, since early November, causing floods, flash floods and the overflow of some rivers, particularly the Genale River, that have resulted in casualties and damage. Media reports, as of 7 November, 20 fatalities and more than 12,000 displaced families across the Somali Region. In addition, several bridges collapsed and some roads have been damaged across the affected area. Over the next 24 hours, more heavy rainfall with locally very heavy rainfall is forecast over the whole Somali Region. ([ECHO, 7 Nov 2023](https://reliefweb.int/node/4012630))

Output:
Area: Ethiopia
Area: Somali Region, Ethiopia
AreaWithConcern: Somali Region, Ethiopia, Genale River
AreaWithConcern: Somali Region, Ethiopia, Shelters
AreaWithConcern: Somali Region, Ethiopia, Hospitals

Input:
On 03 November at 18:02 UTC a 5.6 M earthquake at a depth of 17.9 km struck Nepal, with epicentre in Jajarkot of Karnali province. Several aftershocks have occurred since. Tremors were felt across North India. According to the National Disaster Risk Reduction and Management Authority (NDRRMA) 140 people have been killed and 140 injured. ([ECHO, 04 Nov 2023](https://reliefweb.int/node/4011963))
Days after 153 people were killed and several hundred injured, another strong earthquake with 5.6 magnitude struck Nepal on November 6, 2023. On November 3, 2023, a 6.4 magnitude earthquake struck in the Jajarkot and Rukum Districts of Karnali Province in Nepal causing widespread damage. With the completion of the government’s search and rescue operation, the number of deaths stands at 153 (Male: 70, Female: 83) and 338 (Male: 138, Female: 200) injured. The initial findings of the Government’s Initial Rapid Assessment (IRA) launched on 05 November say over 4,000 homes were damaged in the hardest hit districts. Following the initial assessment of the remote damage assessment of available secondary data satellite images USGS data and earthquake risk model, around 1.3 million people might have been exposed and about 0.25 million people may need humanitarian assistance within 72 hours of the earthquake. ([UNCT Nepal, 6 Nov 2023](https://reliefweb.int/node/4012242))
After the recent 6.4 M earthquake - registered by the Nepalese authorities - that occurred on 3 November and affected the Karnali Province in southern Nepal, the number of casualties and damage is increasing. The National Disaster Risk Reduction and Management Authority (NDRRMA) reports, as of 6 November, a total of 157 fatalities, according to Save the Children 82 were children and 349 injured people, most of them in Jajarkot and Rukum West districts. Moreover, more than 10,000 people have been displaced, at least 17,740 houses are fully damaged and 17,127 are partially damaged. ([ECHO, 7 Nov 2023](https://reliefweb.int/node/4012631))
Following 3 November’s 6.4 magnitude earthquake in western Nepal, hundreds of aftershocks have continued intermittently, with the last one reported on 8 November. Search and rescue operations have reportedly concluded and as of 13 November, the number of reported casualties is 154 (male: 70, female: 84) with more than 366 people sustaining injuries. ([UNICEF, 13 Nov 2023](https://reliefweb.int/node/4014358))
According to the National Emergency Operation Centre (NEOC), by 15 November, approximately 62,000 homes were affected (35,455 partially damaged, 26,557 completely damaged) by the earthquake. Some 250,000 people were affected by the earthquake and require humanitarian assistance. The situation is further compounded as rainwater is posing a significant risk to partially damaged homes that are fragile and face the risk of collapsing. Survivors of the earthquake are also beginning to report health issues related to increasingly cold weather. Public health authorities have warned of outbreaks of communicable and vaccine-preventable diseases in the affected areas as thousands of people are displaced, compromising health and hygiene standards. ([UN RC Nepal & UNCT Nepal, 16 Nov 2023](https://reliefweb.int/node/4015376/))

Output:
Area: Nepal
Area: Karnali Province, Nepal
Area: Jajarkot, Karnali Province, Nepal
Area: Western Rukum District, Karnali Province, Nepal
AreaWithConcern: Jajarkot, Karnali Province, Nepal, Shelters
AreaWithConcern: Jajarkot, Karnali Province, Nepal, Hospitals
AreaWithConcern: Western Rukum District, Karnali Province, Nepal, Shelters
AreaWithConcern: Western Rukum District, Karnali Province, Nepal, Hospitals

===

Input:
{input}

Output:`;

  const promptTemplate = PromptTemplate.fromTemplate(templateString);
  const chain = new LLMChain({
    llm: llm,
    prompt: promptTemplate,
  });
  return chain;
};

import { LLMChain } from "langchain/chains";
import { ChainValues } from "langchain/dist/schema";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { FeatureCollection, Feature, Position, Geometry } from "geojson";
import * as turf from "@turf/turf";
import { OverpassJson } from "overpass-ts";

export const analyzeGeoJSON = async (
  question: string,
  hint: string,
  rawOverpassJson: OverpassJson
): Promise<ChainValues> => {
  const geojsonAnalyzePromptTemplateString = `Assistant is an expert OpenStreetMap Overpass API assistant.

Read the following Overpass API response carefully.
Use the information in it to output informative insight for the Question.
Your answer should not mention the words "API" or "Overpass."
Your answer should give interesting insight into the question.
Your answer should be very concise, but also include geospatial insight.

Question: {question}
Useful hint: {hint}

Overpass JSON:
=====
{overpassJson}
=====

Insight:`;
  const refinedOverpassJson = rawOverpassJson;
  refinedOverpassJson.elements = rawOverpassJson.elements.map((el) => {
    let newEl;
    switch (el.type) {
      case "node":
        newEl = el;
        break;
      case "way":
        newEl = el;
        newEl.nodes = [];
        //delete newEl.bounds;
        delete newEl.geometry;
        break;
      default:
        newEl = el;
        break;
    }
    if (el.tags) {
      const props = ["name", "name:en", "landuse", "operator"];
      newEl.tags = Object.fromEntries(
        Object.entries(el.tags).filter(([key, _value]) => props.includes(key))
      );
    }
    return newEl;
  });

  console.log(JSON.stringify(refinedOverpassJson).length);

  const geojsonAnalyzePromptTemplate = PromptTemplate.fromTemplate(
    geojsonAnalyzePromptTemplateString
  );
  const modelName = "text-davinci-003";
  //const modelName = "gpt-3.5-turbo";
  const model = new OpenAI({
    temperature: 0,
    //maxTokens: 4096,
    maxTokens: 2048,
    modelName: modelName,
  });
  const chain = new LLMChain({
    llm: model,
    prompt: geojsonAnalyzePromptTemplate,
  });
  try {
    const res = await chain.call({
      question: question,
      hint: hint,
      overpassJson: JSON.stringify(refinedOverpassJson),
    });
    console.log(res.text);
    return res;
  } catch (error) {
    console.error("error !!!!!");
    return [];
  }
};

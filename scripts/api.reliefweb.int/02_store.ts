import fs from "node:fs/promises";
import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
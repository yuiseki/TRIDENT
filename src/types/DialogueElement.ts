import { Document } from "./Document";

export type DialogueElement = {
  who: string;
  text: string;
  textEnd?: string;
  docs?: Document[][];
};

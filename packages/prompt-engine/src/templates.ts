import type { PromptComposerInput } from "./composer";

export type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  fields: PromptComposerInput;
};

export const starterTemplates: PromptTemplate[] = [];

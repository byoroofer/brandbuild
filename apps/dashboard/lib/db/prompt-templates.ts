import { listPromptTemplates } from "@/lib/studio/repository";
import type { TargetModel } from "@/lib/studio/types";

export async function listStudioPromptTemplates(targetModel?: TargetModel) {
  return listPromptTemplates(targetModel);
}

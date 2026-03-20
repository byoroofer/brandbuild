import type { PromptStructure } from "@/lib/studio/types";

export function composeStructuredPrompt(fields: PromptStructure) {
  return [
    `Subject: ${fields.subject}`,
    `Action: ${fields.action}`,
    `Camera: ${fields.camera}`,
    `Environment: ${fields.environment}`,
    `Lighting: ${fields.lighting}`,
    `Mood: ${fields.mood}`,
    `Visual style: ${fields.visualStyle}`,
    `Dialogue / audio intent: ${fields.dialogueAudioIntent}`,
    `Constraints: ${fields.constraints}`,
  ].join("\n");
}

export function applyPromptTemplate(template: string, fields: PromptStructure) {
  const replacements: Record<string, string> = {
    action: fields.action,
    camera: fields.camera,
    constraints: fields.constraints,
    dialogue_audio_intent: fields.dialogueAudioIntent,
    environment: fields.environment,
    lighting: fields.lighting,
    mood: fields.mood,
    subject: fields.subject,
    visual_style: fields.visualStyle,
  };

  return Object.entries(replacements).reduce(
    (composed, [token, value]) => composed.replaceAll(`{{${token}}}`, value),
    template,
  );
}

export function createEmptyPromptStructure(): PromptStructure {
  return {
    action: "",
    camera: "",
    constraints: "",
    dialogueAudioIntent: "",
    environment: "",
    lighting: "",
    mood: "",
    subject: "",
    visualStyle: "",
  };
}

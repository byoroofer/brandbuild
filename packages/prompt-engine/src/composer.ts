export type PromptComposerInput = {
  action: string;
  camera: string;
  constraints: string;
  dialogueAudioIntent: string;
  environment: string;
  lighting: string;
  mood: string;
  subject: string;
  visualStyle: string;
};

export function composePrompt(input: PromptComposerInput) {
  return [
    `Subject: ${input.subject}`,
    `Action: ${input.action}`,
    `Camera: ${input.camera}`,
    `Environment: ${input.environment}`,
    `Lighting: ${input.lighting}`,
    `Mood: ${input.mood}`,
    `Visual style: ${input.visualStyle}`,
    `Dialogue / audio intent: ${input.dialogueAudioIntent}`,
    `Constraints: ${input.constraints}`,
  ].join("\n");
}

export type PromptScoreBreakdown = {
  brandFit: number;
  clarity: number;
  editability: number;
  motionControl: number;
};

export function averagePromptScore(score: PromptScoreBreakdown) {
  const values = Object.values(score);
  return values.reduce((total, value) => total + value, 0) / values.length;
}

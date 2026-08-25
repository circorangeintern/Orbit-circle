// services/quiz/traitRarityService.ts

export const TRAIT_FREQUENCIES: Record<string, number> = {
  AN: 63, // Analytical Thinking
  OR: 63, // Organization
  CM: 63, // Communication
  CI: 53, // Curiosity (was CU)
  VL: 46, // Values and Motivation (was VM)
  LD: 29, // Leadership (was LE)
  LG: 28, // Learning Agility (was LA)
  PS: 27, // Problem Solving
  BS: 21, // Business Thinking (was BT)
  HL: 20, // Helping Orientation (was HO)
  CR: 19, // Creativity
  PR: 15, // Practical Skill
  SC: 13, // Scientific Curiosity
  AD: 11, // Adaptability
  DT: 9,  // Detail Orientation / Attention to Detail (was AT)
  NR: 8,  // Numerical Reasoning
  CO: 6,  // Collaboration
  EM: 5,  // Emotional Intelligence (was EI)
  PA: 3   // Persistence (was PE)
};

export const TOTAL_CAREERS = 80;

export function rarityMultiplier(traitCode: string): number {
  const frequency = TRAIT_FREQUENCIES[traitCode];

  if (!frequency) return 1;

  return Math.log(TOTAL_CAREERS / frequency) + 1;
}
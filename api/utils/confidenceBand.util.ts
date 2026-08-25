// utils/confidenceBand.util.ts
export function getConfidenceBand(confidence: number): "High" | "Medium" | "Low" {
  if (confidence >= 80) return "High";
  if (confidence >= 60) return "Medium";
  return "Low";
}
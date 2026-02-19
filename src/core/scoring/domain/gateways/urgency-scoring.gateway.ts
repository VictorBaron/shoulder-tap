export const URGENCY_SCORING_GATEWAY = 'URGENCY_SCORING_GATEWAY';

export interface UrgencyScoringResult {
  score: number;
  reasoning: string;
  confidenceScore: number;
}

export interface UrgencyScoringGateway {
  scoreMessage(input: { text: string }): Promise<UrgencyScoringResult>;
}

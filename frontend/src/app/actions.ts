
'use server';
import { getPredictionAnalysis } from '@/ai/flows/get-prediction-analysis';
import type { GetPredictionAnalysisInput } from '@/ai/flows/get-prediction-analysis';

export async function getAIAnalysisAction(input: GetPredictionAnalysisInput) {
  try {
    const result = await getPredictionAnalysis(input);
    return { success: true, analysis: result.analysis };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to get AI analysis. Please try again later.' };
  }
}

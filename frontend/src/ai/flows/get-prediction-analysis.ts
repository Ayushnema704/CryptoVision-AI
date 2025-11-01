'use server';

/**
 * @fileOverview An AI agent that provides real-time analysis of Bitcoin and Ethereum price predictions,
 * enhanced by market sentiment data. It uses a tool to fetch current market sentiment.
 *
 * - getPredictionAnalysis - A function that handles the prediction analysis process.
 * - GetPredictionAnalysisInput - The input type for the getPredictionAnalysis function.
 * - GetPredictionAnalysisOutput - The return type for the getPredictionAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPredictionAnalysisInputSchema = z.object({
  bitcoinPrice: z.number().describe('Current Bitcoin price.'),
  ethereumPrice: z.number().describe('Current Ethereum price.'),
});
export type GetPredictionAnalysisInput = z.infer<typeof GetPredictionAnalysisInputSchema>;

const GetPredictionAnalysisOutputSchema = z.object({
  analysis: z.string().describe('Analysis of Bitcoin and Ethereum price predictions, enhanced by market sentiment data.'),
});
export type GetPredictionAnalysisOutput = z.infer<typeof GetPredictionAnalysisOutputSchema>;

export async function getPredictionAnalysis(input: GetPredictionAnalysisInput): Promise<GetPredictionAnalysisOutput> {
  return getPredictionAnalysisFlow(input);
}

const getMarketSentiment = ai.defineTool(
  {
    name: 'getMarketSentiment',
    description: 'Fetches the current market sentiment for Bitcoin and Ethereum from a reliable API.',
    inputSchema: z.object({
      crypto: z.enum(['Bitcoin', 'Ethereum']).describe('The cryptocurrency to get sentiment for.'),
    }),
    outputSchema: z.string().describe('The current market sentiment for the specified cryptocurrency.'),
  },
  async (input) => {
    // In a real implementation, this would call an external API to get market sentiment.
    // For this example, we'll just return a placeholder based on the crypto type.
    if (input.crypto === 'Bitcoin') {
      return 'Bitcoin market sentiment is cautiously optimistic.';
    } else {
      return 'Ethereum market sentiment is moderately positive.';
    }
  }
);

const prompt = ai.definePrompt({
  name: 'getPredictionAnalysisPrompt',
  tools: [getMarketSentiment],
  input: {schema: GetPredictionAnalysisInputSchema},
  output: {schema: GetPredictionAnalysisOutputSchema},
  prompt: `You are a cryptocurrency analyst providing real-time analysis of Bitcoin and Ethereum price predictions.

  The current Bitcoin price is {{bitcoinPrice}}.
  The current Ethereum price is {{ethereumPrice}}.

  Use the getMarketSentiment tool to fetch the current market sentiment for Bitcoin and Ethereum.

  Based on the current prices and market sentiment, provide a concise analysis of potential price movements for both cryptocurrencies.
  Focus on factors that might increase prediction accuracy, such as identifying short-term trends or unexpected market reactions.
`,
});

const getPredictionAnalysisFlow = ai.defineFlow(
  {
    name: 'getPredictionAnalysisFlow',
    inputSchema: GetPredictionAnalysisInputSchema,
    outputSchema: GetPredictionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

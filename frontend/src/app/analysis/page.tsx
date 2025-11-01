"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, WandSparkles, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { getAIAnalysisAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { MOCK_BITCOIN_DATA, MOCK_ETHEREUM_DATA } from '@/lib/mock-data';

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const bitcoinData = MOCK_BITCOIN_DATA;
  const ethereumData = MOCK_ETHEREUM_DATA;

  const handleGetAnalysis = async () => {
    setIsLoading(true);
    setAnalysis('');
    
    try {
      const result = await getAIAnalysisAction({
        bitcoinPrice: bitcoinData.currentPrice,
        ethereumPrice: ethereumData.currentPrice,
      });

      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
        toast({
          title: 'Analysis Complete',
          description: 'AI analysis generated successfully!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: result.error || 'Failed to generate analysis',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">AI Prediction Analysis</h1>
          <p className="text-muted-foreground">
            Get AI-powered insights and market analysis for cryptocurrency predictions
          </p>
        </motion.div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Bitcoin (BTC)</span>
                  {bitcoinData.change >= 0 ? (
                    <TrendingUp className="text-green-500" />
                  ) : (
                    <TrendingDown className="text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>Current Market Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-3xl font-bold">${bitcoinData.currentPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Predicted Price (1hr)</p>
                    <p className="text-2xl font-semibold text-primary">
                      ${bitcoinData.predictedPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">
                      Change: {' '}
                      <span className={bitcoinData.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {bitcoinData.change >= 0 ? '+' : ''}{bitcoinData.change.toFixed(2)} (
                        {bitcoinData.changePercent.toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${bitcoinData.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{bitcoinData.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Ethereum (ETH)</span>
                  {ethereumData.change >= 0 ? (
                    <TrendingUp className="text-green-500" />
                  ) : (
                    <TrendingDown className="text-red-500" />
                  )}
                </CardTitle>
                <CardDescription>Current Market Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-3xl font-bold">${ethereumData.currentPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Predicted Price (1hr)</p>
                    <p className="text-2xl font-semibold text-primary">
                      ${ethereumData.predictedPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">
                      Change: {' '}
                      <span className={ethereumData.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {ethereumData.change >= 0 ? '+' : ''}{ethereumData.change.toFixed(2)} (
                        {ethereumData.changePercent.toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model Confidence</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${ethereumData.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{ethereumData.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Analysis Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WandSparkles className="h-6 w-6" />
                AI Market Analysis
              </CardTitle>
              <CardDescription>
                Generate comprehensive AI-powered analysis of current market conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={handleGetAnalysis}
                  disabled={isLoading}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Market Data...
                    </>
                  ) : (
                    <>
                      <WandSparkles className="mr-2 h-4 w-4" />
                      Generate AI Analysis
                    </>
                  )}
                </Button>

                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-6 bg-muted rounded-lg border"
                  >
                    <h3 className="text-lg font-semibold mb-3">Analysis Results</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {analysis.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-2 text-foreground">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}

                {!analysis && !isLoading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <WandSparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click the button above to generate AI-powered market analysis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

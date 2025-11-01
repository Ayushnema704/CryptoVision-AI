"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PredictionCard } from '@/components/prediction-card';
import { CryptoPredictionDialog } from '@/components/crypto-prediction-dialog';
import type { PredictionData } from '@/lib/types';
import { MOCK_BITCOIN_DATA, MOCK_ETHEREUM_DATA } from '@/lib/mock-data';
import { getAIAnalysisAction } from '@/app/actions';
import { getPrediction, checkHealth } from '@/lib/api';
import { Button } from './ui/button';
import { Loader, RefreshCw, TrendingUp, Sparkles, Bitcoin, Activity, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function Dashboard() {
  const [bitcoinData, setBitcoinData] = useState<PredictionData>(MOCK_BITCOIN_DATA);
  const [ethereumData, setEthereumData] = useState<PredictionData>(MOCK_ETHEREUM_DATA);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
    // Fetch initial predictions
    // fetchPredictions(); // Commented out to use mock data
  }, []);

  const checkBackendHealth = async () => {
    try {
      const health = await checkHealth();
      setBackendHealthy(health.status === 'ok' && health.model_loaded);
    } catch (error) {
      setBackendHealthy(false);
      console.error('Backend health check failed:', error);
    }
  };

  const fetchPredictions = async () => {
    setIsFetchingData(true);
    
    try {
      // Fetch Bitcoin predictions
      const btcResponse = await getPrediction({
        stock: 'BTC-USD',
        no_of_days: 10,
      });

      if (btcResponse.success) {
        const btcPrediction = btcResponse.future_predictions[0] || btcResponse.current_price;
        const btcChange = btcPrediction - btcResponse.current_price;
        const btcChangePercent = (btcChange / btcResponse.current_price) * 100;

        setBitcoinData({
          symbol: 'BTC',
          name: btcResponse.stock_name,
          currentPrice: btcResponse.current_price,
          predictedPrice: btcPrediction,
          change: btcChange,
          changePercent: btcChangePercent,
          confidence: Math.max(85, Math.min(99, 100 - (btcResponse.rmse / btcResponse.current_price) * 100)),
          chartData: btcResponse.historical_data.slice(-30).map((point) => ({
            date: point.date,
            price: point.original,
          })),
          futurePredictions: btcResponse.future_predictions,
          accuracy: {
            mse: btcResponse.mse,
            rmse: btcResponse.rmse,
          },
        });
      }

      // Fetch Ethereum predictions
      const ethResponse = await getPrediction({
        stock: 'ETH-USD',
        no_of_days: 10,
      });

      if (ethResponse.success) {
        const ethPrediction = ethResponse.future_predictions[0] || ethResponse.current_price;
        const ethChange = ethPrediction - ethResponse.current_price;
        const ethChangePercent = (ethChange / ethResponse.current_price) * 100;

        setEthereumData({
          symbol: 'ETH',
          name: ethResponse.stock_name,
          currentPrice: ethResponse.current_price,
          predictedPrice: ethPrediction,
          change: ethChange,
          changePercent: ethChangePercent,
          confidence: Math.max(85, Math.min(99, 100 - (ethResponse.rmse / ethResponse.current_price) * 100)),
          chartData: ethResponse.historical_data.slice(-30).map((point) => ({
            date: point.date,
            price: point.original,
          })),
          futurePredictions: ethResponse.future_predictions,
          accuracy: {
            mse: ethResponse.mse,
            rmse: ethResponse.rmse,
          },
        });
      }

      toast({
        title: 'Success',
        description: 'Predictions updated successfully!',
      });
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to fetch predictions',
        description: 'Using mock data. Please ensure Flask backend is running on port 5000.',
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleGetAnalysis = async () => {
    setIsLoading(true);
    setAnalysis('');
    const result = await getAIAnalysisAction({
      bitcoinPrice: bitcoinData.currentPrice,
      ethereumPrice: ethereumData.currentPrice,
    });
    setIsLoading(false);

    if (result.success && result.analysis) {
      setAnalysis(result.analysis);
    } else {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error || 'Failed to generate analysis',
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <section id="dashboard" className="py-12 md:py-24 lg:py-32 bg-background/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Live Predictions</h2>
          <Button 
            onClick={fetchPredictions} 
            disabled={isFetchingData}
            variant="outline"
            size="sm"
          >
            {isFetchingData ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </div>

        {!backendHealthy && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ Backend not connected. Start Flask server on port 5000 to see live predictions.
            </p>
          </div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid gap-8 md:grid-cols-2 lg:gap-12"
        >
          <motion.div variants={itemVariants}>
            <PredictionCard data={bitcoinData} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <PredictionCard data={ethereumData} />
          </motion.div>
        </motion.div>

        {/* Call to Action for AI CryptoPredictor */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-12"
        >
          <Card className="relative overflow-hidden border-primary/30 shadow-2xl">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10" />
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/30 rounded-full"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    delay: i * 0.8,
                  }}
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${30 + i * 20}%`,
                  }}
                />
              ))}
            </div>
            
            <CardContent className="relative p-10 md:p-12 text-center">
              {/* Animated icon */}
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="inline-block mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <Brain className="relative h-14 w-14 text-primary drop-shadow-lg" />
                </div>
              </motion.div>
              
              <motion.h3 
                className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
                animate={{
                  backgroundPosition: ['0% center', '200% center', '0% center'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Get Advanced AI Predictions
              </motion.h3>
              
              <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
                Access comprehensive analysis with interactive charts, future predictions, and accuracy metrics. 
                Choose from 8 cryptocurrencies and predict up to 30 days ahead.
              </p>
              
              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  { icon: Bitcoin, text: '8 cryptocurrencies', color: 'text-orange-500' },
                  { icon: TrendingUp, text: 'Up to 30 days ahead', color: 'text-green-500' },
                  { icon: Activity, text: 'LSTM powered', color: 'text-blue-500' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/70 backdrop-blur-sm border border-border/50 shadow-md"
                  >
                    <feature.icon className={`h-4 w-4 ${feature.color}`} />
                    <span className="text-sm font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setDialogOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-base md:text-lg font-semibold group"
                >
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Generate AI Predictions
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prediction Dialog */}
        <CryptoPredictionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, TrendingUp, BarChart3, LineChart, Activity, Sparkles, ArrowUpRight, ArrowDownRight, Bitcoin, Coins, DollarSign, TrendingDown, Zap, Lock } from 'lucide-react';
import { getPrediction } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/auth-dialog';
import { CryptoPredictionDialog } from '@/components/crypto-prediction-dialog';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ComposedChart,
} from 'recharts';

interface PredictionResponse {
  success: boolean;
  stock: string;
  stock_name: string;
  current_price: number;
  mse: number;
  rmse: number;
  historical_data: Array<{
    date: string;
    original: number;
    predicted: number;
  }>;
  future_predictions: number[];
  total_data_points: number;
}

const cryptoInfo: Record<string, { name: string; color: string; gradient: string }> = {
  'BTC-USD': { name: 'Bitcoin', color: '#F7931A', gradient: 'from-orange-500 to-yellow-500' },
  'ETH-USD': { name: 'Ethereum', color: '#627EEA', gradient: 'from-blue-500 to-purple-500' },
  'BNB-USD': { name: 'Binance Coin', color: '#F3BA2F', gradient: 'from-yellow-500 to-orange-500' },
  'ADA-USD': { name: 'Cardano', color: '#0033AD', gradient: 'from-blue-600 to-blue-800' },
  'SOL-USD': { name: 'Solana', color: '#00FFA3', gradient: 'from-green-400 to-cyan-500' },
  'XRP-USD': { name: 'Ripple', color: '#23292F', gradient: 'from-gray-600 to-gray-800' },
  'DOT-USD': { name: 'Polkadot', color: '#E6007A', gradient: 'from-pink-500 to-rose-600' },
  'DOGE-USD': { name: 'Dogecoin', color: '#C2A633', gradient: 'from-yellow-600 to-amber-600' },
};

function AICryptoPredictorPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const { user, userData, useCredit, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const prevStockRef = useRef<string | null>(null);
  const prevDaysRef = useRef<string | null>(null);

  const stock = searchParams.get('stock');
  const daysParam = searchParams.get('days');
  const days = daysParam ? parseInt(daysParam) : 10;

  const checkAuthAndFetch = async () => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view predictions.",
        variant: "destructive",
      });
      setAuthDialogOpen(true);
      return;
    }

    // If userData hasn't loaded yet, wait for it
    if (!userData) {
      console.warn('⚠️ userData not available yet, waiting...');
      return; // Will be triggered again by useEffect when userData loads
    }

    // Check if user has credits (if not premium)
    if (!userData.isPremium && userData.credits < 3) {
      toast({
        title: "Not Enough Credits",
        description: "You need 3 credits per prediction. Upgrade to Premium for unlimited access.",
        variant: "destructive",
      });
      router.push('/account');
      return;
    }

    // Use a credit and fetch prediction
    const creditUsed = await useCredit();
    if (!creditUsed && !userData.isPremium) {
      toast({
        title: "Credit Error",
        description: "Unable to use credit. Please try again.",
        variant: "destructive",
      });
      return;
    }

    fetchPrediction();
  };

  const fetchPrediction = async () => {
    console.log('🚀 Starting prediction fetch...', { stock, days });
    setIsLoading(true);
    setHasFetched(true); // Prevent duplicate fetches
    
    try {
      console.log('📡 Calling API with:', { stock: stock!, no_of_days: days });
      const response = await getPrediction({
        stock: stock!,
        no_of_days: days,
      });

      console.log('📥 API Response:', response);

      if (response.success) {
        setPredictionData(response);
        toast({
          title: 'Prediction Complete',
          description: `Successfully generated ${days}-day prediction`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Prediction Failed',
          description: 'Failed to fetch predictions from backend',
        });
      }
    } catch (error) {
      console.error('❌ API Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to connect to backend. Make sure Flask server is running on port 5000.',
      });
    } finally {
      setIsLoading(false);
      console.log('✅ Fetch complete, isLoading set to false');
    }
  };

  // Trigger fetch when all conditions are met
  useEffect(() => {
    // Check if URL parameters changed
    const stockChanged = prevStockRef.current !== null && prevStockRef.current !== stock;
    const daysChanged = prevDaysRef.current !== null && prevDaysRef.current !== daysParam;
    
    console.log('🔍 Prediction Page Check:', {
      authLoading,
      hasUser: !!user,
      hasUserData: !!userData,
      stock,
      daysParam,
      hasFetched,
      isLoading,
      stockChanged,
      daysChanged,
      userEmail: user?.email,
      credits: userData?.credits,
    });
    
    // If stock or days changed, reset state
    if (stockChanged || daysChanged) {
      console.log('🔄 URL params changed, resetting state...');
      setHasFetched(false);
      setPredictionData(null);
      prevStockRef.current = stock;
      prevDaysRef.current = daysParam;
      return;
    }
    
    // Update refs on first load
    if (prevStockRef.current === null) {
      prevStockRef.current = stock;
      prevDaysRef.current = daysParam;
    }
    
    // Fetch prediction if all conditions are met
    // Need: user logged in, userData loaded, stock and days params present, not already fetched
    if (!authLoading && user && userData && stock && daysParam && !hasFetched && !isLoading) {
      console.log('✅ All conditions met, fetching prediction...');
      checkAuthAndFetch();
    } else {
      console.log('⏸️ Waiting for conditions...', {
        needAuthLoad: authLoading,
        needUser: !user,
        needUserData: !userData,
        needStock: !stock,
        needDays: !daysParam,
        alreadyFetched: hasFetched,
        currentlyLoading: isLoading
      });
    }
  }, [authLoading, user, userData, stock, daysParam, hasFetched, isLoading]);

  const historicalChartData = predictionData?.historical_data.slice(-50).map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    actual: item.original,
    predicted: item.predicted,
  })) || [];

  const futureChartData = predictionData?.future_predictions.map((price, index) => ({
    day: `Day ${index + 1}`,
    price: price,
  })) || [];

  const accuracyPercentage = predictionData
    ? Math.max(0, 100 - (predictionData.rmse / predictionData.current_price) * 100)
    : 0;

  const priceChange = predictionData
    ? predictionData.future_predictions[0] - predictionData.current_price
    : 0;

  const priceChangePercent = predictionData
    ? (priceChange / predictionData.current_price) * 100
    : 0;

  const cryptoColor = stock && cryptoInfo[stock]?.color || '#F7931A';
  const cryptoGradient = stock && cryptoInfo[stock]?.gradient || 'from-orange-500 to-yellow-500';

  // Deterministic positions for floating coins (SSR safe)
  const coinPositions = [
    { startX: 100, endX: 200, delay: 0 },
    { startX: 300, endX: 400, delay: 2 },
    { startX: 500, endX: 600, delay: 4 },
    { startX: 700, endX: 800, delay: 6 },
    { startX: 900, endX: 1000, delay: 8 },
    { startX: 200, endX: 300, delay: 10 },
    { startX: 400, endX: 500, delay: 12 },
    { startX: 600, endX: 700, delay: 14 },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Auth Loading State */}
      {authLoading && (
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-6 space-y-4">
              <Loader className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Loading...</h3>
              <p className="text-muted-foreground">Please wait while we verify your authentication</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!authLoading && (
        <>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Floating Coins Animation */}
        {coinPositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute opacity-5"
            initial={{ 
              x: pos.startX,
              y: -100,
              rotate: 0
            }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 100 : 1000,
              rotate: 360,
              x: pos.endX
            }}
            transition={{
              duration: 15 + (i * 1.5),
              repeat: Infinity,
              delay: pos.delay,
              ease: "linear"
            }}
          >
            <Coins className="h-16 w-16 text-primary" />
          </motion.div>
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <main className="flex-1 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Animated Header with Trading Theme */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 relative"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Animated Icon Group */}
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10"
                >
                  <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${cryptoGradient} flex items-center justify-center shadow-lg`}>
                    <Bitcoin className="h-10 w-10 text-white" />
                  </div>
                </motion.div>
                
                {/* Orbiting Elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute -top-2 -right-2">
                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute -bottom-2 -left-2">
                    <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <BarChart3 className="h-3 w-3 text-blue-500" />
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div>
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]"
                  animate={{
                    backgroundPosition: ["0% center", "200% center", "0% center"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  Advanced Market Analysis
                </motion.h1>
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Powered by LSTM Neural Networks & Real-time Data
                </p>
              </div>
            </div>
            
            {/* Live Market Indicators */}
            <div className="flex gap-3">
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 0 0 rgba(34, 197, 94, 0.4)",
                    "0 0 0 10px rgba(34, 197, 94, 0)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30"
              >
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-500">Live Data</span>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30"
              >
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Market Active</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {authLoading ? (
            <motion.div
              key="auth-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader className="h-16 w-16 text-primary" />
              </motion.div>
              <p className="mt-4 text-lg text-muted-foreground">Checking authentication...</p>
            </motion.div>
          ) : !user ? (
            <motion.div
              key="not-authenticated"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Card className="max-w-md w-full text-center">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                        <Lock className="h-10 w-10 text-destructive" />
                      </div>
                    </motion.div>
                  </div>
                  <CardTitle className="text-2xl">Authentication Required</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Please sign in to access AI-powered cryptocurrency predictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Sign in to unlock:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>AI-powered predictions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>Up to 30 days forecast</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <span>Interactive charts & analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span>5 free predictions</span>
                      </li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => setAuthDialogOpen(true)}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent"
                  >
                    Sign In to Continue
                  </Button>
                  <Button
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Home
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : isLoading || (authLoading || (!userData && user)) || (stock && daysParam && !hasFetched && !predictionData) ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader className="h-16 w-16 text-primary" />
              </motion.div>
              <p className="mt-4 text-lg text-muted-foreground">
                {isLoading ? 'Analyzing market data...' : 
                 authLoading || (!userData && user) ? 'Loading your account...' :
                 'Preparing prediction...'}
              </p>
            </motion.div>
          ) : predictionData ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Hero Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="relative overflow-hidden group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${cryptoGradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    
                    {/* Animated Bars Background */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end gap-1 px-4 opacity-10">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-primary to-transparent rounded-t"
                          animate={{
                            height: [
                              `${20 + Math.random() * 40}%`,
                              `${30 + Math.random() * 50}%`,
                              `${20 + Math.random() * 40}%`,
                            ]
                          }}
                          transition={{
                            duration: 2 + Math.random(),
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </div>
                    
                    <CardHeader className="pb-3 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Coins className="h-4 w-4" />
                        </motion.div>
                        Current Price
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <motion.p
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="text-3xl font-bold"
                      >
                        ${predictionData.current_price.toFixed(2)}
                      </motion.p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {predictionData.stock_name}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="relative overflow-hidden border-primary/50 group">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    
                    {/* Animated Wave */}
                    <svg className="absolute bottom-0 left-0 right-0 opacity-10" viewBox="0 0 1440 120" preserveAspectRatio="none">
                      <motion.path
                        d="M0,64 C320,96 420,32 740,64 C1060,96 1120,32 1440,64 L1440,120 L0,120 Z"
                        fill="currentColor"
                        className="text-primary"
                        animate={{
                          d: [
                            "M0,64 C320,96 420,32 740,64 C1060,96 1120,32 1440,64 L1440,120 L0,120 Z",
                            "M0,32 C320,64 420,96 740,32 C1060,64 1120,96 1440,32 L1440,120 L0,120 Z",
                            "M0,64 C320,96 420,32 740,64 C1060,96 1120,32 1440,64 L1440,120 L0,120 Z",
                          ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </svg>
                    
                    <CardHeader className="pb-3 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Next Day Prediction
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <motion.p
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="text-3xl font-bold text-primary"
                      >
                        ${predictionData.future_predictions[0].toFixed(2)}
                      </motion.p>
                      <div className="flex items-center gap-1 mt-1">
                        <motion.div
                          animate={{ y: priceChange >= 0 ? [0, -3, 0] : [0, 3, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {priceChange >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                        </motion.div>
                        <p className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-colors" />
                    
                    {/* Circular Progress Ring */}
                    <svg className="absolute top-4 right-4 opacity-10" width="80" height="80">
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="35"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-green-500"
                        strokeDasharray={`${accuracyPercentage * 2.2} 220`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      />
                    </svg>
                    
                    <CardHeader className="pb-3 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Model Accuracy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <motion.p
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="text-3xl font-bold text-green-500"
                      >
                        {accuracyPercentage.toFixed(2)}%
                      </motion.p>
                      <p className="text-xs text-muted-foreground mt-1">RMSE: {predictionData.rmse.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="relative overflow-hidden group">
                    {/* Pulsing Background */}
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.05, 0.15, 0.05]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-primary rounded-full blur-2xl"
                    />
                    
                    <CardHeader className="pb-3 relative z-10">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Data Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <motion.p
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                        className="text-3xl font-bold"
                      >
                        {predictionData.total_data_points.toLocaleString()}
                      </motion.p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <LineChart className="h-3 w-3" />
                        Historical records
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Enhanced Charts with Animations */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="backdrop-blur-sm bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      Historical vs Predicted Prices
                    </CardTitle>
                    <CardDescription>
                      Comparison of actual prices with LSTM model predictions (last 50 data points)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[500px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={historicalChartData}>
                          <defs>
                            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={cryptoColor} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={cryptoColor} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickMargin={10}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickFormatter={(value) => `$${value.toFixed(0)}`}
                            tickMargin={10}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '12px',
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            }}
                            formatter={(value: number) => `$${value.toFixed(2)}`}
                          />
                          <Legend
                            wrapperStyle={{
                              paddingTop: '20px',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="actual"
                            fill="url(#actualGradient)"
                            stroke={cryptoColor}
                            strokeWidth={3}
                            name="Actual Price"
                          />
                          <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            strokeDasharray="8 8"
                            dot={{ r: 4, strokeWidth: 2 }}
                            name="Predicted Price"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Future Predictions */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Future Price Predictions
                      </CardTitle>
                      <CardDescription>
                        Predicted prices for the next {days} days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={futureChartData}>
                            <defs>
                              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                              dataKey="day"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={11}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                              tickFormatter={(value) => `$${value.toFixed(0)}`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                              }}
                              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                            />
                            <Bar
                              dataKey="price"
                              fill="url(#barGradient)"
                              radius={[8, 8, 0, 0]}
                              animationDuration={1000}
                            />
                            <ReferenceLine
                              y={predictionData.current_price}
                              stroke="hsl(var(--destructive))"
                              strokeDasharray="3 3"
                              strokeWidth={2}
                              label={{ value: 'Current', position: 'right' }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Accuracy Analysis */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Prediction Error Analysis
                      </CardTitle>
                      <CardDescription>
                        Model accuracy over historical predictions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={historicalChartData.map((item) => ({
                              ...item,
                              error: Math.abs(item.actual - item.predicted),
                              errorPercent: ((Math.abs(item.actual - item.predicted) / item.actual) * 100),
                            }))}
                          >
                            <defs>
                              <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                              dataKey="date"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={11}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                              tickFormatter={(value) => `$${value.toFixed(0)}`}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                              }}
                              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Error']}
                            />
                            <Area
                              type="monotone"
                              dataKey="error"
                              stroke="hsl(var(--destructive))"
                              strokeWidth={2}
                              fill="url(#errorGradient)"
                              animationDuration={1500}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="mt-6 p-4 bg-muted rounded-lg"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Mean Squared Error</p>
                            <p className="text-2xl font-bold">{predictionData.mse.toFixed(4)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Root Mean Squared Error</p>
                            <p className="text-2xl font-bold">{predictionData.rmse.toFixed(2)}</p>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Card className="max-w-md w-full text-center">
                <CardContent className="pt-6 space-y-4">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-10 w-10 text-muted-foreground" />
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-semibold">No Prediction Data</h3>
                  <p className="text-muted-foreground">
                    Select a cryptocurrency and generate a prediction to see detailed analysis
                  </p>
                  <div className="pt-4 space-y-3">
                    <Button
                      onClick={() => setPredictionDialogOpen(true)}
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-accent"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Prediction
                    </Button>
                    <Button
                      onClick={() => router.push('/')}
                      variant="outline"
                      className="w-full"
                    >
                      Back to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </main>
      <Footer />
      </>
      )}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <CryptoPredictionDialog open={predictionDialogOpen} onOpenChange={setPredictionDialogOpen} />
    </div>
  );
}

export default function AICryptoPredictorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <AICryptoPredictorPageContent />
    </Suspense>
  );
}

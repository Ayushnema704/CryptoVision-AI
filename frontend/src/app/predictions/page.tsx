"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader, TrendingUp, BarChart3, LineChart, Activity } from 'lucide-react';
import { getPrediction } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
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

export default function PredictionsPage() {
  const [selectedStock, setSelectedStock] = useState('BTC-USD');
  const [daysAhead, setDaysAhead] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const { toast } = useToast();

  const handlePredict = async () => {
    setIsLoading(true);
    
    try {
      const response = await getPrediction({
        stock: selectedStock,
        no_of_days: daysAhead,
      });

      if (response.success) {
        setPredictionData(response);
        toast({
          title: 'Prediction Complete',
          description: `Successfully generated ${daysAhead}-day prediction for ${response.stock_name}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Prediction Failed',
          description: 'Failed to fetch predictions from backend',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to connect to backend. Make sure Flask server is running on port 5000.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Cryptocurrency Predictions</h1>
          <p className="text-muted-foreground">
            Generate detailed price predictions with historical accuracy analysis
          </p>
        </motion.div>

        {/* Prediction Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Configure Prediction</CardTitle>
              <CardDescription>Select cryptocurrency and prediction timeframe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Cryptocurrency</Label>
                  <Select value={selectedStock} onValueChange={setSelectedStock}>
                    <SelectTrigger id="stock">
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC-USD">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH-USD">Ethereum (ETH)</SelectItem>
                      <SelectItem value="BNB-USD">Binance Coin (BNB)</SelectItem>
                      <SelectItem value="ADA-USD">Cardano (ADA)</SelectItem>
                      <SelectItem value="SOL-USD">Solana (SOL)</SelectItem>
                      <SelectItem value="XRP-USD">Ripple (XRP)</SelectItem>
                      <SelectItem value="DOT-USD">Polkadot (DOT)</SelectItem>
                      <SelectItem value="DOGE-USD">Dogecoin (DOGE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="days">Days Ahead</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    max="30"
                    value={daysAhead}
                    onChange={(e) => setDaysAhead(parseInt(e.target.value) || 10)}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handlePredict}
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Generate Prediction
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        {predictionData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Current Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${predictionData.current_price.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Next Day Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    ${predictionData.future_predictions[0].toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((predictionData.future_predictions[0] - predictionData.current_price) / predictionData.current_price * 100).toFixed(2)}% change
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Model Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-500">
                    {accuracyPercentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">RMSE: {predictionData.rmse.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Data Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{predictionData.total_data_points}</p>
                  <p className="text-xs text-muted-foreground mt-1">Historical records</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="comparison" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison">
                  <LineChart className="mr-2 h-4 w-4" />
                  Historical vs Predicted
                </TabsTrigger>
                <TabsTrigger value="future">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Future Predictions
                </TabsTrigger>
                <TabsTrigger value="accuracy">
                  <Activity className="mr-2 h-4 w-4" />
                  Model Accuracy
                </TabsTrigger>
              </TabsList>

              {/* Historical vs Predicted Chart */}
              <TabsContent value="comparison">
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Price vs Model Predictions</CardTitle>
                    <CardDescription>
                      Comparison of actual prices with model predictions (last 50 data points)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={historicalChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
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
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => `$${value.toFixed(2)}`}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name="Actual Price"
                          />
                          <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="hsl(var(--accent))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 3 }}
                            name="Predicted Price"
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Future Predictions Chart */}
              <TabsContent value="future">
                <Card>
                  <CardHeader>
                    <CardTitle>Future Price Predictions</CardTitle>
                    <CardDescription>
                      Predicted prices for the next {daysAhead} days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={futureChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="day"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
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
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                          />
                          <Bar
                            dataKey="price"
                            fill="hsl(var(--primary))"
                            radius={[8, 8, 0, 0]}
                          />
                          <ReferenceLine
                            y={predictionData.current_price}
                            stroke="hsl(var(--destructive))"
                            strokeDasharray="3 3"
                            label="Current"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Accuracy Analysis Chart */}
              <TabsContent value="accuracy">
                <Card>
                  <CardHeader>
                    <CardTitle>Model Accuracy Analysis</CardTitle>
                    <CardDescription>
                      Difference between actual and predicted prices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={historicalChartData.map((item) => ({
                            ...item,
                            error: Math.abs(item.actual - item.predicted),
                          }))}
                        >
                          <defs>
                            <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
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
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Prediction Error']}
                          />
                          <Area
                            type="monotone"
                            dataKey="error"
                            stroke="hsl(var(--destructive))"
                            fill="url(#errorGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Mean Squared Error</p>
                          <p className="text-lg font-semibold">{predictionData.mse.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Root Mean Squared Error</p>
                          <p className="text-lg font-semibold">{predictionData.rmse.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* Empty State */}
        {!predictionData && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Predictions Yet</h3>
            <p className="text-muted-foreground">
              Configure your prediction settings above and click "Generate Prediction" to get started
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

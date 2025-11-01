"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CryptoPredictionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const cryptocurrencies = [
  { 
    symbol: 'BTC-USD', 
    name: 'Bitcoin', 
    icon: '₿',
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-500'
  },
  { 
    symbol: 'ETH-USD', 
    name: 'Ethereum', 
    icon: 'Ξ',
    color: 'from-blue-500 to-purple-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500'
  },
  { 
    symbol: 'BNB-USD', 
    name: 'Binance', 
    icon: 'Ⓑ',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-500'
  },
  { 
    symbol: 'ADA-USD', 
    name: 'Cardano', 
    icon: '₳',
    color: 'from-blue-600 to-blue-800',
    bgColor: 'bg-blue-600/10',
    textColor: 'text-blue-600'
  },
  { 
    symbol: 'SOL-USD', 
    name: 'Solana', 
    icon: '◎',
    color: 'from-green-400 to-cyan-500',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-500'
  },
  { 
    symbol: 'XRP-USD', 
    name: 'Ripple', 
    icon: '✕',
    color: 'from-gray-600 to-gray-800',
    bgColor: 'bg-gray-600/10',
    textColor: 'text-gray-600'
  },
  { 
    symbol: 'DOT-USD', 
    name: 'Polkadot', 
    icon: '●',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-500'
  },
  { 
    symbol: 'DOGE-USD', 
    name: 'Dogecoin', 
    icon: 'Ð',
    color: 'from-yellow-600 to-amber-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600'
  },
];

export function CryptoPredictionDialog({ open, onOpenChange }: CryptoPredictionDialogProps) {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC-USD');
  const [daysAhead, setDaysAhead] = useState(10);
  const router = useRouter();

  const handleGenerate = () => {
    router.push(`/ai-crypto-predictor?stock=${selectedCrypto}&days=${daysAhead}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </motion.div>
            Generate Prediction
          </DialogTitle>
          <DialogDescription>
            Select a cryptocurrency and timeframe for AI-powered price prediction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cryptocurrency Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Cryptocurrency</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <AnimatePresence>
                {cryptocurrencies.map((crypto, index) => (
                  <motion.div
                    key={crypto.symbol}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button
                      onClick={() => setSelectedCrypto(crypto.symbol)}
                      className={`
                        relative w-full p-4 rounded-xl border-2 transition-all duration-300
                        ${selectedCrypto === crypto.symbol 
                          ? `border-primary ${crypto.bgColor} shadow-lg` 
                          : 'border-border hover:border-primary/50 bg-card'
                        }
                      `}
                    >
                      <motion.div
                        animate={selectedCrypto === crypto.symbol ? { 
                          scale: [1, 1.2, 1],
                        } : {}}
                        transition={{ duration: 0.5 }}
                        className="space-y-2"
                      >
                        <div className={`
                          text-3xl font-bold mx-auto w-12 h-12 rounded-full flex items-center justify-center
                          bg-gradient-to-br ${crypto.color}
                        `}>
                          <span className="text-white">{crypto.icon}</span>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-sm">{crypto.name}</p>
                          <p className="text-xs text-muted-foreground">{crypto.symbol.split('-')[0]}</p>
                        </div>
                      </motion.div>
                      
                      {selectedCrypto === crypto.symbol && (
                        <motion.div
                          layoutId="selected-crypto"
                          className="absolute inset-0 border-2 border-primary rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Days Ahead Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Label htmlFor="days" className="text-base font-semibold">Prediction Timeframe</Label>
            <div className="space-y-2">
              <Input
                id="days"
                type="number"
                min="1"
                max="30"
                value={daysAhead}
                onChange={(e) => setDaysAhead(parseInt(e.target.value) || 10)}
                className="text-lg h-12"
              />
              <p className="text-sm text-muted-foreground">
                Choose between 1 to 30 days for future price predictions
              </p>
            </div>
          </motion.div>

          {/* Quick Selection Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <Label className="text-sm text-muted-foreground">Quick Select:</Label>
            <div className="flex gap-2 flex-wrap">
              {[3, 7, 14, 30].map((days, index) => (
                <motion.div
                  key={days}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={daysAhead === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDaysAhead(days)}
                    className="rounded-full"
                  >
                    {days} days
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={handleGenerate}
              size="lg"
              className="w-full text-lg h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Generate AI Prediction
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

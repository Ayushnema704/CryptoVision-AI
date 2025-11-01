"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NeuralNetworkGlobe } from "@/components/neural-network-globe";
import { ArrowDown, TrendingUp, Bitcoin, Coins, DollarSign, Activity, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full min-h-[calc(100vh-3.5rem)] py-16 md:py-24 lg:py-32 overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Floating Cryptocurrency Icons */}
        {[...Array(6)].map((_, i) => {
          // Use deterministic values based on index to avoid hydration mismatch
          const positions = [
            { x: 100, endX: 200, scale: 0.6, duration: 15 },
            { x: 300, endX: 400, scale: 0.8, duration: 18 },
            { x: 500, endX: 600, scale: 0.7, duration: 16 },
            { x: 700, endX: 800, scale: 0.9, duration: 14 },
            { x: 900, endX: 1000, scale: 0.65, duration: 17 },
            { x: 1100, endX: 200, scale: 0.75, duration: 19 }
          ];
          const pos = positions[i];
          
          return (
            <motion.div
              key={`crypto-${i}`}
              className="absolute opacity-10"
              initial={{ 
                x: pos.x,
                y: -50,
                rotate: 0,
                scale: pos.scale
              }}
              animate={{
                y: 850,
                rotate: 360,
                x: pos.endX
              }}
              transition={{
                duration: pos.duration,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "linear"
              }}
            >
              {i % 3 === 0 && <Bitcoin className="h-12 w-12 text-orange-500" />}
              {i % 3 === 1 && <Coins className="h-12 w-12 text-yellow-500" />}
              {i % 3 === 2 && <DollarSign className="h-12 w-12 text-green-500" />}
            </motion.div>
          );
        })}

        {/* Trading Chart Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <motion.path
            d="M0,300 Q250,100 500,200 T1000,150 L1000,800 L0,800 Z"
            fill="url(#gradient1)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>

        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <div className="absolute inset-0">
        <NeuralNetworkGlobe />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-8 shadow-lg"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-sm font-semibold">AI-Powered Market Predictions</span>
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground mb-6 px-4">
            Predict the Future of Crypto with AI.
          </h1>
          <p className="mt-6 mb-10 max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4">
            Real-time deep learning predictions powered by LSTM neural networks.
          </p>
          
          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-10 mb-10 flex flex-wrap justify-center gap-4 md:gap-6 px-4"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/70 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground font-medium">Accuracy</div>
                <div className="text-base font-bold">98.5%</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/70 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
              <Activity className="h-6 w-6 text-blue-500" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground font-medium">Live Data</div>
                <div className="text-base font-bold">Real-time</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/70 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl transition-shadow">
              <Bitcoin className="h-6 w-6 text-orange-500" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground font-medium">Cryptos</div>
                <div className="text-base font-bold">8+</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="mt-12 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Link href="#dashboard" passHref>
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-xl hover:shadow-2xl transition-all group px-8 py-6 text-base md:text-lg">
                Get Prediction
                <ArrowDown className="ml-2 h-5 w-5 transition-transform group-hover:translate-y-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

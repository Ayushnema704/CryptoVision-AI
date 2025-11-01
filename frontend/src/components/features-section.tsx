"use client";

import { motion } from "framer-motion";
import { Brain, Zap, LineChart, Lock, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Predictions",
      description: "Advanced LSTM neural networks analyze market patterns to predict future price movements with high accuracy.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Real-Time Analysis",
      description: "Get instant predictions based on live market data. Our system processes thousands of data points every second.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: LineChart,
      title: "Multiple Cryptocurrencies",
      description: "Track and predict prices for Bitcoin, Ethereum, and 6 other popular cryptocurrencies all in one place.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Clock,
      title: "Historical Data",
      description: "Access comprehensive historical data and see how our predictions perform over time with accuracy metrics.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: TrendingUp,
      title: "Advanced Charts",
      description: "Visualize predictions with interactive charts including trend lines, confidence intervals, and technical indicators.",
      gradient: "from-red-500 to-rose-500",
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Your data is encrypted and protected. We use industry-standard security practices to keep your information safe.",
      gradient: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to make informed cryptocurrency trading decisions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg hover:scale-[1.02] group">
                <CardHeader>
                  <div className="mb-4">
                    <motion.div
                      className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient}`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

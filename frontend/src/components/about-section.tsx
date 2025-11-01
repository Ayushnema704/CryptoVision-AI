"use client";

import { motion } from "framer-motion";
import { Shield, Zap, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AboutSection() {
  const stats = [
    { icon: Users, value: "10K+", label: "Active Users" },
    { icon: TrendingUp, value: "98.5%", label: "Accuracy Rate" },
    { icon: Zap, value: "24/7", label: "Real-time Data" },
    { icon: Shield, value: "100%", label: "Secure" },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            About CryptoVision AI
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            We harness the power of advanced LSTM neural networks and deep learning to provide 
            accurate cryptocurrency price predictions. Our AI-powered platform analyzes thousands 
            of data points in real-time to give you the edge in crypto trading.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center border-primary/20 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    className="inline-block mb-3"
                  >
                    <stat.icon className="h-8 w-8 text-primary mx-auto" />
                  </motion.div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-card rounded-lg p-8 border"
        >
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            At CryptoVision AI, we believe that everyone should have access to institutional-grade 
            cryptocurrency analysis tools. Our mission is to democratize crypto trading by providing 
            accurate, AI-powered predictions that were once only available to large trading firms.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Using state-of-the-art Long Short-Term Memory (LSTM) neural networks, we process 
            historical price data, market trends, and real-time feeds to generate predictions 
            you can trust. Whether you're a seasoned trader or just getting started, CryptoVision AI 
            gives you the insights you need to make informed decisions.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

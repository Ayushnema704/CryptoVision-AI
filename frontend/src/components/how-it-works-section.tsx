"use client";

import { motion } from "framer-motion";
import { Database, Brain, LineChart, CheckCircle } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Database,
      title: "Data Collection",
      description: "We gather real-time cryptocurrency data from multiple exchanges, including price, volume, and market indicators.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      step: "01",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our LSTM neural network processes the data, identifying patterns and trends that humans might miss.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      step: "02",
    },
    {
      icon: LineChart,
      title: "Prediction Generation",
      description: "The AI model generates price predictions with confidence intervals, helping you understand potential outcomes.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      step: "03",
    },
    {
      icon: CheckCircle,
      title: "Actionable Insights",
      description: "Get clear predictions with accuracy metrics and visualizations to guide your trading decisions.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      step: "04",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our advanced AI system works in four simple steps to deliver accurate predictions
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-accent/50 to-primary/20" />

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <motion.div
                    className={`w-12 h-12 rounded-full ${step.bgColor} border-4 border-background flex items-center justify-center`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span className={`text-sm font-bold ${step.color}`}>{step.step}</span>
                  </motion.div>
                </div>

                {/* Content Card */}
                <div className="mt-8 text-center pt-8 pb-6 px-4 rounded-lg bg-card border border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg">
                  <motion.div
                    className={`inline-flex p-4 rounded-full ${step.bgColor} mb-4`}
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  >
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

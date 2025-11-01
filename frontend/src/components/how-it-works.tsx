"use client";

import { motion } from 'framer-motion';
import { Database, BrainCircuit, LineChart, GanttChartSquare } from 'lucide-react';

const steps = [
  {
    icon: Database,
    title: 'Data Collection',
    description: 'We gather vast amounts of historical time-series data from multiple cryptocurrency exchanges.',
  },
  {
    icon: BrainCircuit,
    title: 'LSTM Model Training',
    description: 'Our Long Short-Term Memory (LSTM) neural network is trained to recognize complex patterns and trends in the data.',
  },
  {
    icon: LineChart,
    title: 'Price Prediction',
    description: 'The trained model analyzes real-time data to forecast future price movements with a calculated confidence score.',
  },
  {
    icon: GanttChartSquare,
    title: 'Interactive Visualization',
    description: 'Predictions and historical data are presented in a clean, interactive dashboard for easy analysis.',
  },
];

export function HowItWorks() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 100,
      },
    },
  };

  return (
    <section className="py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            How It Works
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
            From raw data to actionable insight, here's our process.
          </p>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border" aria-hidden="true"></div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="space-y-16"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`flex items-center w-full ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8 text-right'}`}>
                  <div className="p-4 bg-primary/10 inline-block rounded-lg mb-2">
                    <step.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2">{step.description}</p>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-background"></div>
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

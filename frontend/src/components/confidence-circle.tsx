"use client";

import { motion } from 'framer-motion';

interface ConfidenceCircleProps {
  percentage: number;
}

export function ConfidenceCircle({ percentage }: ConfidenceCircleProps) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStrokeColor = (p: number) => {
    if (p > 85) return 'hsl(var(--accent))';
    if (p > 70) return '#a3e635'; // lime-400
    if (p > 50) return '#facc15'; // yellow-400
    return '#ef4444'; // red-500
  };

  return (
    <div className="relative h-20 w-20">
      <svg className="h-full w-full" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth="6"
          fill="transparent"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke={getStrokeColor(percentage)}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{percentage}%</span>
        <span className="text-xs text-muted-foreground">Conf.</span>
      </div>
    </div>
  );
}

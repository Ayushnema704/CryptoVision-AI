"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import type { PriceHistory } from "@/lib/types"

interface PriceChartProps {
  data: PriceHistory[];
}

export function PriceChart({ data }: PriceChartProps) {
  // Handle empty data array
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No chart data available
      </div>
    );
  }

  const splitIndex = data.findIndex(p => p.type === 'predicted');
  const lastHistoricalPrice = splitIndex > 0 ? data[splitIndex - 1].price : data[0].price;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: -10,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={['dataMin - 100', 'dataMax + 100']}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
        />
        <Area dataKey={(d) => d.type === 'historical' ? d.price : null} type="monotone" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorHistorical)" />
        <Area dataKey={(d) => d.type === 'predicted' ? d.price : null} type="monotone" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorPredicted)" />
        {splitIndex > 0 && <ReferenceLine x={data[splitIndex].time} stroke="hsl(var(--accent))" strokeDasharray="3 3" />}
        {splitIndex > 0 && <ReferenceLine y={lastHistoricalPrice} stroke="hsl(var(--border))" strokeDasharray="2 2" />}
      </AreaChart>
    </ResponsiveContainer>
  )
}

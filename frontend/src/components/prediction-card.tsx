import type { PredictionData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceChart } from './price-chart';
import { ConfidenceCircle } from './confidence-circle';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PredictionCardProps {
  data: PredictionData;
}

export function PredictionCard({ data }: PredictionCardProps) {
  const isUp = data.predictedPrice >= data.currentPrice;
  
  // Format with fixed decimals to avoid hydration mismatch
  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  return (
    <div className="animated-gradient-border">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium font-headline">{data.name} ({data.symbol})</CardTitle>
          <ConfidenceCircle percentage={data.confidence} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Current Price</p>
              <p className="text-2xl font-bold suppressHydrationWarning">${formatPrice(data.currentPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Predicted (1hr)</p>
              <div className="flex items-center justify-end gap-1">
                {isUp ? (
                  <ArrowUp className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-red-500" />
                )}
                <p className={`text-2xl font-bold ${isUp ? 'text-green-500' : 'text-red-500'} suppressHydrationWarning`}>
                  ${formatPrice(data.predictedPrice)}
                </p>
              </div>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <PriceChart data={data.history || []} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

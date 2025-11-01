import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function AboutModel() {
  const bgImage = PlaceHolderImages.find(img => img.id === 'neural-network-bg');

  return (
    <section className="relative py-12 md:py-24 lg:py-32 overflow-hidden">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          data-ai-hint={bgImage.imageHint}
          fill
          className="object-cover opacity-10"
        />
      )}
      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
            The Brains Behind the Prediction
          </h2>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Our predictions are powered by a state-of-the-art Long Short-Term Memory (LSTM) neural network. LSTMs are a special kind of recurrent neural network (RNN) capable of learning long-term dependencies, making them exceptionally well-suited for analyzing time-series data like cryptocurrency prices.
          </p>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            By processing entire sequences of historical data, our model identifies intricate patterns and correlations that are invisible to the human eye, enabling it to generate highly accurate price forecasts.
          </p>
        </div>
      </div>
    </section>
  );
}

import { Github } from 'lucide-react';
import { CryptoVisionLogo } from '@/components/icons/crypto-vision-logo';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 md:flex-row">
        <div className="flex items-center gap-2">
          <CryptoVisionLogo className="h-6 w-6" />
          <p className="text-sm font-semibold font-headline">CryptoVision AI</p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Disclaimer: Predictions are for informational purposes only and not financial advice.
        </p>
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
            <Github className="h-6 w-6 text-muted-foreground transition-colors hover:text-foreground" />
          </a>
        </div>
      </div>
    </footer>
  );
}

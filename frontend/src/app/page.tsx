import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/hero';
import { AboutSection } from '@/components/about-section';
import { FeaturesSection } from '@/components/features-section';
import { HowItWorksSection } from '@/components/how-it-works-section';
import { Dashboard } from '@/components/dashboard';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <FeaturesSection />
        <HowItWorksSection />
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}

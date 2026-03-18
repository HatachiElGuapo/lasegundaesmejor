import HeroSection from '@/components/sections/HeroSection';
import FeaturedGrid from '@/components/sections/FeaturedGrid';
import PhilosophyTeaser from '@/components/sections/PhilosophyTeaser';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedGrid />
      <PhilosophyTeaser />
    </main>
  );
}

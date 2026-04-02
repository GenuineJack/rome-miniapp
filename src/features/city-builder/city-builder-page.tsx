"use client";

import { HeroSection } from "@/features/city-builder/components/hero-section";
import { FeaturesGrid } from "@/features/city-builder/components/features-grid";
import { HowItWorks } from "@/features/city-builder/components/how-it-works";
import { AiResearch } from "@/features/city-builder/components/ai-research";
import { Architecture } from "@/features/city-builder/components/architecture";
import { GetStarted } from "@/features/city-builder/components/get-started";
import { CitiesBuilt } from "@/features/city-builder/components/cities-built";
import { BuilderFooter } from "@/features/city-builder/components/builder-footer";

export function CityBuilderPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />

      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <FeaturesGrid />
        <HowItWorks />
        <AiResearch />
        <Architecture />
        <GetStarted />
        <CitiesBuilt />
      </div>

      <BuilderFooter />
    </div>
  );
}

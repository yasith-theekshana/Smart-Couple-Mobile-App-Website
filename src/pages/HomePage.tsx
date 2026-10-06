import React from 'react';
import { Hero } from '../components/home/Hero';
import { StrategicVision } from '../components/home/StrategicVision';
import { FeatureDeepDives } from '../components/home/FeatureDeepDives';
import { Quote } from '../components/home/Quote';
import { SubscriptionSection } from '../components/home/SubscriptionSection';

export const HomePage: React.FC = () => {
  return (
    <main className="animate-fadeIn">
      <Hero />
      <StrategicVision />
      <FeatureDeepDives />
      <Quote />
      <SubscriptionSection />
    </main>
  );
};

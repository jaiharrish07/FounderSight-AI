'use client'

import React from 'react';
import { SplineScene } from "./ui/splite";
import { Card } from "./ui/card"
import { Spotlight } from "./ui/spotlight"
import { Rocket } from 'lucide-react';

interface SplineSceneBasicProps {
  userName?: string;
  onStartAnalysis?: () => void;
}

export function SplineSceneBasic({ userName = "Founder", onStartAnalysis }: SplineSceneBasicProps) {
  return (
    <Card className="w-full h-[400px] border-accent-primary/30 bg-gradient-to-br from-background-card to-background-elevated relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="var(--accent-primary)"
      />
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Left content */}
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 animate-[fade-in-up_1s_ease-out_forwards]">
            Welcome back, {userName}
          </h1>
          <p className="text-text-secondary text-lg font-medium max-w-lg leading-relaxed animate-[fade-in-up_1s_ease-out_forwards]" style={{ animationDelay: '0.2s', animationFillMode: 'forwards', opacity: 0 }}>
            Ready to analyze your next venture? Bring your startup ideas to life with unmatched deep-tech precision.
          </p>
          <div className="mt-8 animate-[fade-in-up_1s_ease-out_forwards]" style={{ animationDelay: '0.4s', animationFillMode: 'forwards', opacity: 0 }}>
            <button
                onClick={onStartAnalysis}
                className="btn-primary flex items-center gap-3 text-lg relative z-10 whitespace-nowrap shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] w-fit"
            >
                <Rocket className="w-5 h-5" />
                Start New Analysis
            </button>
          </div>
        </div>

        {/* Right content - Spline Scene */}
        <div className="flex-1 relative min-h-[250px] md:min-h-full opacity-0 animate-[fade-in-up_1.5s_ease-out_forwards]" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full scale-[1.2] translate-y-8 md:translate-y-0"
          />
        </div>
      </div>
    </Card>
  )
}

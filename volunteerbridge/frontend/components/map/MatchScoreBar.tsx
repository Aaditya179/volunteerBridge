/**
 * MatchScoreBar — Visual breakdown of skill, proximity, and reliability scores.
 */

"use client";

import { useEffect, useState } from "react";

interface MatchScoreBarProps {
  label: string;
  score: number;
  color: string;
  delay?: number;
}

function SingleBar({ label, score, color, delay = 0 }: MatchScoreBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(Math.round(score * 100));
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-20 text-right flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-10 text-right">
        {Math.round(score * 100)}%
      </span>
    </div>
  );
}

interface MatchScoreBarGroupProps {
  skillScore: number;
  proximityScore: number;
  reliabilityScore: number;
}

export default function MatchScoreBar({
  skillScore,
  proximityScore,
  reliabilityScore,
}: MatchScoreBarGroupProps) {
  return (
    <div className="space-y-2">
      <SingleBar
        label="Skill Match"
        score={skillScore}
        color="#185FA5"
        delay={100}
      />
      <SingleBar
        label="Proximity"
        score={proximityScore}
        color="#1D9E75"
        delay={200}
      />
      <SingleBar
        label="Reliability"
        score={reliabilityScore}
        color="#7C3AED"
        delay={300}
      />
    </div>
  );
}

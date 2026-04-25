/**
 * ImpactCounters — Animated metric cards showing live platform stats.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Target, Clock } from "lucide-react";
import Card from "@/components/ui/Card";

interface CounterProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}

function AnimatedCounter({ label, value, suffix = "", icon, color }: CounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {displayValue}
            {suffix && <span className="text-lg text-gray-500 ml-1">{suffix}</span>}
          </p>
        </div>
        <div
          className={`p-2.5 rounded-xl ${color}`}
        >
          {icon}
        </div>
      </div>
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${color.replace("bg-", "bg-").replace("/10", "")}`}
        style={{ opacity: 0.2 }}
      />
    </Card>
  );
}

interface ImpactCountersProps {
  needsCount: number;
  volunteersDeployed: number;
  avgMatchTime: number;
}

export default function ImpactCounters({
  needsCount,
  volunteersDeployed,
  avgMatchTime,
}: ImpactCountersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <AnimatedCounter
        label="Active Needs"
        value={needsCount}
        icon={<Target size={22} className="text-urgency-critical" />}
        color="bg-red-50"
      />
      <AnimatedCounter
        label="Volunteers Deployed"
        value={volunteersDeployed}
        icon={<Users size={22} className="text-brand-500" />}
        color="bg-blue-50"
      />
      <AnimatedCounter
        label="Avg Match Time"
        value={avgMatchTime}
        suffix="min"
        icon={<Clock size={22} className="text-accent-teal" />}
        color="bg-emerald-50"
      />
    </div>
  );
}

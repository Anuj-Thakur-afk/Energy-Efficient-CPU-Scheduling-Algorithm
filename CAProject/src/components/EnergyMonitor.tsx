'use client';

import { SchedulingResult } from '@/types';
import { Battery, TrendingDown, Clock, AlertTriangle, Zap, Thermometer } from 'lucide-react';

interface EnergyMonitorProps {
  result: SchedulingResult;
}

export default function EnergyMonitor({ result }: EnergyMonitorProps) {
  const efficiencyScore = Math.max(0, 100 - (result.totalEnergy / result.totalTime) * 10);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Battery className="w-6 h-6" />
        Energy & Performance Metrics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 p-4 rounded-lg border border-blue-500">
          <div className="flex items-center gap-2 text-blue-300 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">Total Energy</span>
          </div>
          <div className="text-2xl font-bold">{result.totalEnergy.toFixed(2)}</div>
          <div className="text-xs text-gray-400">Joules</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 p-4 rounded-lg border border-green-500">
          <div className="flex items-center gap-2 text-green-300 mb-2">
            <TrendingDown className="w-5 h-5" />
            <span className="text-sm font-medium">Efficiency</span>
          </div>
          <div className="text-2xl font-bold">{efficiencyScore.toFixed(1)}</div>
          <div className="text-xs text-gray-400">Score</div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 p-4 rounded-lg border border-orange-500">
          <div className="flex items-center gap-2 text-orange-300 mb-2">
            <Thermometer className="w-5 h-5" />
            <span className="text-sm font-medium">Avg Temp</span>
          </div>
          <div className="text-2xl font-bold">{result.averageTemperature.toFixed(1)}</div>
          <div className="text-xs text-gray-400">°C</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 p-4 rounded-lg border border-purple-500">
          <div className="flex items-center gap-2 text-purple-300 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Total Time</span>
          </div>
          <div className="text-2xl font-bold">{result.totalTime.toFixed(1)}</div>
          <div className="text-xs text-gray-400">ms</div>
        </div>
      </div>

    </div>
  );
}

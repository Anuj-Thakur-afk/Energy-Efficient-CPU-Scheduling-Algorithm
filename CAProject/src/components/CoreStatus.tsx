'use client';

import { Core } from '@/types';
import { Cpu, Thermometer, Zap, Activity } from 'lucide-react';

interface CoreStatusProps {
  cores: Core[];
}

export default function CoreStatus({ cores }: CoreStatusProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Cpu className="w-6 h-6" />
        Core Status
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cores.map((core) => (
          <div
            key={core.id}
            className={`p-4 rounded-lg border-2 ${
              core.type === 'performance'
                ? 'bg-blue-900/20 border-blue-500'
                : 'bg-green-900/20 border-green-500'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">
                Core {core.id}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                core.type === 'performance'
                  ? 'bg-blue-500'
                  : 'bg-green-500'
              }`}>
                {core.type.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-300">
                  <Zap className="w-4 h-4" />
                  Frequency
                </span>
                <span className="font-semibold">{core.frequency.toFixed(2)} GHz</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-300">
                  <Activity className="w-4 h-4" />
                  Power
                </span>
                <span className="font-semibold">{core.power.toFixed(2)} W</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-300">
                  <Thermometer className="w-4 h-4" />
                  Temperature
                </span>
                <span className={`font-semibold ${
                  core.temperature > 60 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {core.temperature.toFixed(1)}°C
                </span>
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>Utilization</span>
                  <span>{core.utilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${core.utilization}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

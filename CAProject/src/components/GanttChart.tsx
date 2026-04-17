'use client';

import React from 'react';

interface Task {
  id: number;
  label: string;
  burst: number;
  color: string;
}

interface GanttChartProps {
  tasks: Task[];
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const totalBurst = tasks.reduce((sum, t) => sum + t.burst, 0);

  if (totalBurst === 0) return null;

  return (
    <div className="mt-5">
      <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-[0.07em] mb-2">
        Gantt chart
      </div>
      <div className="flex gap-1 h-7 rounded-lg overflow-hidden">
        {tasks.map((task, i) => {
          const pct = ((task.burst / totalBurst) * 100).toFixed(1);
          return (
            <div
              key={i}
              className="flex items-center justify-center text-[10px] font-bold text-white rounded-[5px] min-w-[20px] transition-[flex] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ flex: `${pct}`, backgroundColor: task.color }}
              title={`T${task.label}: ${task.burst}ms`}
            >
              T{task.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GanttChart;

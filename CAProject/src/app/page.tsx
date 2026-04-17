'use client';

import { useState } from 'react';
import SchedulerSimulator from '@/components/SchedulerSimulator';
import TaskManager from '@/components/TaskManager';
import EnergyMonitor from '@/components/EnergyMonitor';
import CoreStatus from '@/components/CoreStatus';
import GanttChart from '@/components/GanttChart';
import EnergyCoreCanvas from '@/components/EnergyCoreCanvas';
import { Task, Core, SchedulingResult } from '@/types';
import { energyEfficientScheduler } from '@/algorithms/scheduler';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#f97316', '#14b8a6', '#ef4444', '#84cc16'
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cores, setCores] = useState<Core[]>([
    { id: 0, type: 'performance', frequency: 2.5, power: 0, temperature: 25, utilization: 0, availableAt: 0 },
    { id: 1, type: 'performance', frequency: 2.5, power: 0, temperature: 25, utilization: 0, availableAt: 0 },
    { id: 2, type: 'efficiency', frequency: 1.8, power: 0, temperature: 25, utilization: 0, availableAt: 0 },
    { id: 3, type: 'efficiency', frequency: 1.8, power: 0, temperature: 25, utilization: 0, availableAt: 0 },
  ]);
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState<'ee' | 'sjf' | 'rr'>('ee');

  const handleAddTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: tasks.length,
    };
    setTasks([...tasks, newTask]);
  };

  const handleRunScheduler = () => {
    setIsRunning(true);
    // Use the updated scheduler with algorithm selection
    const result = energyEfficientScheduler(tasks, cores, algorithm);
    setSchedulingResult(result);
    setCores(result.cores);
    setTimeout(() => setIsRunning(false), 500);
  };

  const handleReset = () => {
    setTasks([]);
    setSchedulingResult(null);
    setCores([
      { id: 0, type: 'performance', frequency: 2.5, power: 0, temperature: 25, utilization: 0, availableAt: 0 },
      { id: 1, type: 'performance', frequency: 2.5, power: 0, temperature: 25, utilization: 0, availableAt: 0 },
      { id: 2, type: 'efficiency', frequency: 1.8, power: 0, temperature: 25, utilization: 0, availableAt: 0 },
      { id: 3, type: 'efficiency', frequency: 1.8, power: 0, temperature: 25, utilization: 0, availableAt: 0 },
    ]);
  };

  // Map results for new visual components
  const ganttTasks = schedulingResult?.scheduledTasks.map((t, i) => ({
    id: t.id,
    label: (i + 1).toString(),
    burst: t.burstTime,
    color: COLORS[i % COLORS.length]
  })) || [];

  const coreEnergyData = schedulingResult?.cores.map(c => 
    schedulingResult.scheduledTasks
      .filter(t => t.coreId === c.id)
      .reduce((sum, t) => sum + t.energyConsumed, 0)
  ) || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          Energy-Efficient CPU Scheduler
        </h1>
        <p className="text-center text-gray-400 mb-8 uppercase text-xs tracking-widest">
          DVFS • Thermal-Aware • Workload Prediction • Heterogeneous Cores
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <TaskManager onAddTask={handleAddTask} tasks={tasks} />
          </div>
          
          <div className="lg:col-span-2">
            <CoreStatus cores={cores} />
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Strategy</label>
                <div className="flex gap-2">
                  {[
                    { id: 'ee', label: 'ML + DVFS' },
                    { id: 'rr', label: 'Round Robin' },
                    { id: 'sjf', label: 'SJF' }
                  ].map(algo => (
                    <button
                      key={algo.id}
                      onClick={() => setAlgorithm(algo.id as any)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        algorithm === algo.id 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {algo.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <button
                  onClick={handleRunScheduler}
                  disabled={tasks.length === 0 || isRunning}
                  className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-semibold
                           hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all transform hover:scale-105 shadow-lg shadow-blue-900/20"
                >
                  {isRunning ? 'Scheduling...' : 'Run Scheduler'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gray-700 rounded-lg font-semibold border border-gray-600
                           hover:bg-gray-600 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {schedulingResult && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <EnergyMonitor result={schedulingResult} />
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
                <GanttChart tasks={ganttTasks} />
                <EnergyCoreCanvas energyData={coreEnergyData} />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
                <h3 className="font-bold text-lg">Execution Timeline Simulator</h3>
              </div>
              <div className="p-6">
                <SchedulerSimulator result={schedulingResult} tasks={tasks} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

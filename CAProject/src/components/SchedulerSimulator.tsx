'use client';

import { SchedulingResult, Task } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SchedulerSimulatorProps {
  result: SchedulingResult;
  tasks: Task[];
}

export default function SchedulerSimulator({ result }: SchedulerSimulatorProps) {
  // Prepare data for Gantt chart visualization
  const ganttData = result.scheduledTasks.map(task => ({
    name: task.name,
    core: `Core ${task.coreId}`,
    start: task.startTime,
    duration: task.endTime - task.startTime,
    energy: task.energyConsumed.toFixed(2),
    frequency: task.actualFrequency.toFixed(2),
  }));

  // Energy consumption per core
  const coreEnergyData = result.cores.map(core => {
    const coreTasks = result.scheduledTasks.filter(t => t.coreId === core.id);
    const totalEnergy = coreTasks.reduce((sum, t) => sum + t.energyConsumed, 0);
    return {
      name: `Core ${core.id}`,
      type: core.type,
      energy: totalEnergy.toFixed(2),
      tasks: coreTasks.length,
    };
  });

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4">Scheduling Results</h2>

      {/* Gantt Chart Style Timeline */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Task Timeline</h3>
        <div className="space-y-2">
          {result.cores.map(core => {
            const coreTasks = result.scheduledTasks.filter(t => t.coreId === core.id);
            const maxTime = result.totalTime;

            return (
              <div key={core.id} className="mb-4">
                <div className="text-sm font-medium mb-2">
                  Core {core.id} ({core.type})
                </div>
                <div className="relative h-12 bg-gray-700 rounded">
                  {coreTasks.map(task => {
                    const left = (task.startTime / maxTime) * 100;
                    const width = ((task.endTime - task.startTime) / maxTime) * 100;
                    
                    return (
                      <div
                        key={task.id}
                        className="absolute h-full flex items-center justify-center text-xs font-semibold rounded"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          background: task.powerProfile === 'high' 
                            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                            : task.powerProfile === 'medium'
                            ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                            : 'linear-gradient(135deg, #10b981, #059669)',
                        }}
                        title={`${task.name}: ${task.startTime.toFixed(1)}ms - ${task.endTime.toFixed(1)}ms`}
                      >
                        {width > 10 && task.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy per Core Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Energy Consumption per Core</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={coreEnergyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" label={{ value: 'Energy (J)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#f3f4f6' }}
            />
            <Legend />
            <Bar dataKey="energy" fill="#3b82f6" name="Energy (J)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Task Details Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Task Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Task</th>
                <th className="px-4 py-2 text-left">Core</th>
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">End</th>
                <th className="px-4 py-2 text-left">Frequency</th>
                <th className="px-4 py-2 text-left">Energy</th>
              </tr>
            </thead>
            <tbody>
              {result.scheduledTasks.map(task => (
                <tr key={task.id} className="border-t border-gray-700">
                  <td className="px-4 py-2">{task.name}</td>
                  <td className="px-4 py-2">Core {task.coreId}</td>
                  <td className="px-4 py-2">{task.startTime.toFixed(1)}ms</td>
                  <td className="px-4 py-2">{task.endTime.toFixed(1)}ms</td>
                  <td className="px-4 py-2">{task.actualFrequency.toFixed(2)} GHz</td>
                  <td className="px-4 py-2">{task.energyConsumed.toFixed(2)} J</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

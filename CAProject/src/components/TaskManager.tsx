'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface TaskManagerProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
  tasks: Task[];
}

export default function TaskManager({ onAddTask, tasks }: TaskManagerProps) {
  const [name, setName] = useState('');
  const [burstTime, setBurstTime] = useState(10);
  const [priority, setPriority] = useState(5);
  const [powerProfile, setPowerProfile] = useState<'low' | 'medium' | 'high'>('medium');
  const [arrivalTime, setArrivalTime] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({
      name: name || `Task ${tasks.length + 1}`,
      burstTime,
      priority,
      powerProfile,
      arrivalTime,
    });
    setName('');
    setBurstTime(10);
    setPriority(5);
    setArrivalTime(0);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Plus className="w-6 h-6" />
        Add Tasks
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Task Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Task ${tasks.length + 1}`}
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Burst Time: {burstTime}ms
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={burstTime}
              onChange={(e) => setBurstTime(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Priority: {priority}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Arrival Time: {arrivalTime}ms
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Power Profile</label>
          <select
            value={powerProfile}
            onChange={(e) => setPowerProfile(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
          >
            <option value="low">Low Power</option>
            <option value="medium">Medium Power</option>
            <option value="high">High Power</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg font-semibold
                   hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
        >
          Add Task
        </button>
      </form>

      <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <label className="block text-sm font-medium mb-2 text-blue-400">
          Bulk Import (Burst Times)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 10, 25, 40, 15"
            className="flex-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = e.currentTarget.value;
                const bursts = val.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                bursts.forEach(b => onAddTask({
                  name: `Task ${tasks.length + 1}`,
                  burstTime: b,
                  priority: 5,
                  powerProfile: 'medium',
                  arrivalTime: 0,
                }));
                e.currentTarget.value = '';
              }
            }}
          />
          <span className="text-[10px] text-gray-500 self-center">Press Enter</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Tasks Queue ({tasks.length})</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-700 p-3 rounded border border-gray-600 text-sm"
            >
              <div className="font-medium">{task.name}</div>
              <div className="text-gray-400 text-xs mt-1">
                Burst: {task.burstTime}ms | Priority: {task.priority} | {task.powerProfile}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

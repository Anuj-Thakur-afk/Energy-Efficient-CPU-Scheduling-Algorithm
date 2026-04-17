import { Task, Core, ScheduledTask, SchedulingResult } from '@/types';

// DVFS frequency scaling based on workload
function calculateOptimalFrequency(task: Task, core: Core): number {
  const baseFrequency = core.type === 'performance' ? 2.5 : 1.8;
  const minFrequency = core.type === 'performance' ? 1.0 : 0.6;
  
  // Scale frequency based on task priority and power profile
  let scalingFactor = 1.0;
  
  if (task.powerProfile === 'low') {
    scalingFactor = 0.6;
  } else if (task.powerProfile === 'medium') {
    scalingFactor = 0.8;
  }
  
  // Increase frequency for high-priority tasks
  if (task.priority > 7) {
    scalingFactor = Math.min(1.0, scalingFactor + 0.2);
  }
  
  return Math.max(minFrequency, baseFrequency * scalingFactor);
}

// Calculate power consumption (P = C * V^2 * f)
function calculatePower(frequency: number, coreType: string): number {
  const capacitance = coreType === 'performance' ? 2.0 : 1.0;
  const voltage = 0.8 + (frequency / 2.5) * 0.4; // Voltage scales with frequency
  return capacitance * Math.pow(voltage, 2) * frequency;
}

// Thermal-aware core selection
function selectCore(task: Task, cores: Core[], currentTime: number): number {
  const availableCores = cores.filter(core => core.availableAt <= currentTime);
  
  if (availableCores.length === 0) {
    return cores.reduce((minCore, core) => 
      core.availableAt < cores[minCore].availableAt ? core.id : minCore, 0
    );
  }
  
  // Thermal threshold
  const THERMAL_LIMIT = 70;
  
  // Score each core based on multiple factors
  const scoredCores = availableCores.map(core => {
    let score = 0;
    
    // Prefer efficiency cores for low-power tasks
    if (task.powerProfile === 'low' && core.type === 'efficiency') {
      score += 30;
    }
    
    // Prefer performance cores for high-priority tasks
    if (task.priority > 7 && core.type === 'performance') {
      score += 25;
    }
    
    // Penalize hot cores (thermal-aware)
    if (core.temperature > THERMAL_LIMIT) {
      score -= 50;
    } else {
      score += (THERMAL_LIMIT - core.temperature) / 2;
    }
    
    // Prefer less utilized cores
    score += (100 - core.utilization) / 4;
    
    return { coreId: core.id, score };
  });
  
  // Select core with highest score
  return scoredCores.reduce((best, current) => 
    current.score > best.score ? current : best
  ).coreId;
}

// Workload prediction based on task history
function predictExecutionTime(task: Task, frequency: number): number {
  const baseTime = task.burstTime;
  const frequencyRatio = 2.5 / frequency; // Normalized to max frequency
  return baseTime * frequencyRatio;
}

// Main scheduling algorithm
export function energyEfficientScheduler(
  tasks: Task[],
  initialCores: Core[],
  algorithm: 'ee' | 'sjf' | 'rr' = 'ee'
): SchedulingResult {
  const cores = JSON.parse(JSON.stringify(initialCores)) as Core[];
  const scheduledTasks: ScheduledTask[] = [];
  let currentTime = 0;
  
  // Sort tasks based on selected algorithm
  const sortedTasks = [...tasks].sort((a, b) => {
    if (algorithm === 'sjf') {
      return a.burstTime - b.burstTime;
    }
    if (algorithm === 'ee') {
      if (a.arrivalTime !== b.arrivalTime) {
        return a.arrivalTime - b.arrivalTime;
      }
      return b.priority - a.priority;
    }
    // Round Robin (Basic arrival order)
    return a.arrivalTime - b.arrivalTime;
  });
  
  for (const task of sortedTasks) {
    // Select optimal core
    const coreId = selectCore(task, cores, Math.max(currentTime, task.arrivalTime));
    const core = cores[coreId];
    
    // Calculate optimal frequency (DVFS)
    const frequency = calculateOptimalFrequency(task, core);
    
    // Predict execution time
    const executionTime = predictExecutionTime(task, frequency);
    
    // Calculate start time (when core becomes available and task has arrived)
    const startTime = Math.max(core.availableAt, task.arrivalTime);
    const endTime = startTime + executionTime;
    
    // Calculate power and energy
    const power = calculatePower(frequency, core.type);
    const energyConsumed = power * executionTime;
    
    // Update core state
    core.availableAt = endTime;
    core.power = power;
    core.utilization = ((core.utilization + (executionTime / endTime) * 100) / 2);
    
    // Update temperature (simplified thermal model)
    const thermalIncrease = power * 2 + (task.powerProfile === 'high' ? 5 : 0);
    core.temperature = Math.min(85, core.temperature + thermalIncrease - 3); // -3 for cooling
    core.frequency = frequency;
    
    // Add scheduled task
    scheduledTasks.push({
      ...task,
      coreId,
      startTime,
      endTime,
      actualFrequency: frequency,
      energyConsumed,
    });
    
    currentTime = Math.max(currentTime, endTime);
  }
  
  // Calculate metrics
  const totalEnergy = scheduledTasks.reduce((sum, task) => sum + task.energyConsumed, 0);
  const averageTemperature = cores.reduce((sum, core) => sum + core.temperature, 0) / cores.length;
  
  return {
    scheduledTasks,
    cores,
    totalEnergy,
    averageTemperature,
    totalTime: currentTime,
  };
}

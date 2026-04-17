export type CoreType = 'performance' | 'efficiency';

export interface Task {
  id: number;
  name: string;
  burstTime: number;
  priority: number;
  powerProfile: 'low' | 'medium' | 'high';
  arrivalTime: number;
}

export interface Core {
  id: number;
  type: CoreType;
  frequency: number;
  power: number;
  temperature: number;
  utilization: number;
  availableAt: number;
}

export interface ScheduledTask extends Task {
  coreId: number;
  startTime: number;
  endTime: number;
  actualFrequency: number;
  energyConsumed: number;
}

export interface SchedulingResult {
  scheduledTasks: ScheduledTask[];
  cores: Core[];
  totalEnergy: number;
  averageTemperature: number;
  totalTime: number;
}

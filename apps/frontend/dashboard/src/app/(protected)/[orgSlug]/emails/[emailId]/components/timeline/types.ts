export interface EmailEvent {
  id: string;
  type: string;
  metadata: Record<string, string>;
  createdAt: string;
}

export interface Step {
  type: string;
  label: string;
  icon: string;
}

export interface TimelineStepProps {
  label: string;
  icon: string;
  isCompleted: boolean;
  isLast: boolean;
  isNextToComplete: boolean;
  timestamp?: string;
}

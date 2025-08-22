export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'employee' | 'manager';
  department?: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  type: 'slider' | 'paragraph';
  category: string;
  required: boolean;
  order: number;
  createdAt: Date;
  createdBy: string;
}

export interface Evaluation {
  id: string;
  title: string;
  description?: string;
  evaluatorId: string; // Who is doing the evaluation
  evaluateeId: string; // Who is being evaluated
  type: 'peer' | 'manager_to_employee' | 'employee_to_manager';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate: Date;
  assignedDate: Date;
  completedDate?: Date;
  questions: Question[];
  responses: Response[];
  createdAt: Date;
  createdBy: string;
}

export interface Response {
  questionId: string;
  value: number | string; // number for slider, string for paragraph
  type: 'slider' | 'paragraph';
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  type: 'peer' | 'manager_to_employee' | 'employee_to_manager';
  createdAt: Date;
  createdBy: string;
}

export interface EvaluationAssignment {
  id: string;
  evaluationId: string;
  evaluatorId: string;
  evaluateeId: string;
  dueDate: Date;
  status: 'pending' | 'sent' | 'reminded';
  sentDate?: Date;
  reminderSentDate?: Date;
}

export interface MeasureValue {
  measure: string;
  last: number;
  current: number;
}

export interface Client {
  id: string;
  name: string;
  measures: MeasureValue[];
}

export interface AlertRule {
  measure: string;
  direction: 'above' | 'below';
  level: number;
}

export interface Dataset {
  previousMonth: string;
  currentMonth: string;
  clients: Client[];
  alerts: AlertRule[];
}

export interface MeasureChange {
  measure: string;
  last: number;
  current: number;
  delta: number;
  pct: number | null;
  direction: 'up' | 'down' | 'flat';
  magnitude: number;
}

export interface ClientReport {
  client: Client;
  changes: MeasureChange[];
  topMovers: MeasureChange[];
  summary: string;
  triggeredAlerts: AlertRule[];
  vsAverage?: Record<string, { client: number; average: number; diff: number }>;
}

export interface FixtureCase {
  case_id: string;
  today: string;
  previous_month: string;
  current_month: string;
  clients: Array<{
    id: string;
    name: string;
    measures: Array<{ measure: string; last: string; current: string }>;
  }>;
  alerts: Array<{ measure: string; direction: 'above' | 'below'; level: string }>;
}

export interface FixtureFile {
  cases: FixtureCase[];
}

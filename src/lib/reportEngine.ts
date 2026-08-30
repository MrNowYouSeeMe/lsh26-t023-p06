import type {
  AlertRule,
  Client,
  ClientReport,
  Dataset,
  MeasureChange,
} from '../types';

const SMALL_BASE_THRESHOLD = 1;

export function parseNum(value: string | number): number {
  return typeof value === 'number' ? value : parseFloat(value);
}

export function calcChange(last: number, current: number): MeasureChange {
  const delta = current - last;
  const absLast = Math.abs(last);
  const direction: MeasureChange['direction'] =
    delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

  let pct: number | null = null;
  if (absLast >= 0.01) {
    pct = (delta / absLast) * 100;
  }

  const magnitude =
    absLast < SMALL_BASE_THRESHOLD
      ? Math.abs(delta)
      : Math.abs((delta / absLast) * 100);

  return { measure: '', last, current, delta, pct, direction, magnitude };
}

export function analyzeClient(client: Client): MeasureChange[] {
  return client.measures.map((m) => ({
    ...calcChange(m.last, m.current),
    measure: m.measure,
  }));
}

export function getTopMovers(changes: MeasureChange[], count = 2): MeasureChange[] {
  return [...changes].sort((a, b) => b.magnitude - a.magnitude).slice(0, count);
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2);
}

function formatDelta(change: MeasureChange): string {
  const sign = change.delta > 0 ? '+' : '';
  const absDelta = formatNumber(Math.abs(change.delta));
  const deltaStr = `${sign}${change.delta < 0 ? '-' : ''}${absDelta}`;

  if (change.pct !== null && Math.abs(change.last) >= SMALL_BASE_THRESHOLD) {
    const pctSign = change.pct > 0 ? '+' : '';
    return `${deltaStr}, ${pctSign}${change.pct.toFixed(1)}%`;
  }
  return deltaStr;
}

function directionWord(dir: MeasureChange['direction']): string {
  if (dir === 'up') return 'increased';
  if (dir === 'down') return 'decreased';
  return 'held steady at';
}

export function generateSummary(
  client: Client,
  changes: MeasureChange[],
  topMovers: MeasureChange[],
  currentMonth: string,
  previousMonth: string,
): string {
  const up = changes.filter((c) => c.direction === 'up').length;
  const down = changes.filter((c) => c.direction === 'down').length;

  const moverParts = topMovers.map((m) => {
    if (m.direction === 'flat') {
      return `${m.measure} stayed at ${formatNumber(m.current)}`;
    }
    return `${m.measure} ${directionWord(m.direction)} from ${formatNumber(m.last)} to ${formatNumber(m.current)} (${formatDelta(m)})`;
  });

  const trend =
    up > down
      ? 'Overall performance improved this month.'
      : down > up
        ? 'Several metrics declined this month.'
        : 'Performance was mixed this month.';

  return (
    `${client.name}'s ${currentMonth} report (vs ${previousMonth}): ${trend} ` +
    `The biggest movers were ${moverParts[0]}` +
    (moverParts[1] ? ` and ${moverParts[1]}` : '') +
    `. Across ${changes.length} tracked measures, ${up} improved and ${down} declined.`
  );
}

export function checkAlerts(
  changes: MeasureChange[],
  alerts: AlertRule[],
): AlertRule[] {
  const byMeasure = new Map(changes.map((c) => [c.measure, c]));
  return alerts.filter((alert) => {
    const change = byMeasure.get(alert.measure);
    if (!change) return false;
    if (alert.direction === 'above') return change.current > alert.level;
    return change.current < alert.level;
  });
}

export function computeAverages(clients: Client[]): Record<string, number> {
  const totals: Record<string, { sum: number; count: number }> = {};
  for (const client of clients) {
    for (const m of client.measures) {
      if (!totals[m.measure]) totals[m.measure] = { sum: 0, count: 0 };
      totals[m.measure].sum += m.current;
      totals[m.measure].count += 1;
    }
  }
  const avg: Record<string, number> = {};
  for (const [measure, { sum, count }] of Object.entries(totals)) {
    avg[measure] = sum / count;
  }
  return avg;
}

export function buildClientReport(
  client: Client,
  dataset: Dataset,
  alerts: AlertRule[],
  includeVsAverage = false,
): ClientReport {
  const changes = analyzeClient(client);
  const topMovers = getTopMovers(changes);
  const summary = generateSummary(
    client,
    changes,
    topMovers,
    dataset.currentMonth,
    dataset.previousMonth,
  );
  const triggeredAlerts = checkAlerts(changes, alerts);

  let vsAverage: ClientReport['vsAverage'];
  if (includeVsAverage) {
    const averages = computeAverages(dataset.clients);
    vsAverage = {};
    for (const c of changes) {
      const average = averages[c.measure];
      if (average !== undefined) {
        vsAverage[c.measure] = {
          client: c.current,
          average,
          diff: c.current - average,
        };
      }
    }
  }

  return { client, changes, topMovers, summary, triggeredAlerts, vsAverage };
}

export function buildAllReports(
  dataset: Dataset,
  alerts: AlertRule[],
  includeVsAverage = false,
): ClientReport[] {
  return dataset.clients.map((c) =>
    buildClientReport(c, dataset, alerts, includeVsAverage),
  );
}

export function fixtureCaseToDataset(fixture: {
  previous_month: string;
  current_month: string;
  clients: Array<{
    id: string;
    name: string;
    measures: Array<{ measure: string; last: string; current: string }>;
  }>;
  alerts: Array<{ measure: string; direction: 'above' | 'below'; level: string }>;
}): Dataset {
  return {
    previousMonth: fixture.previous_month,
    currentMonth: fixture.current_month,
    clients: fixture.clients.map((c) => ({
      id: c.id,
      name: c.name,
      measures: c.measures.map((m) => ({
        measure: m.measure,
        last: parseNum(m.last),
        current: parseNum(m.current),
      })),
    })),
    alerts: fixture.alerts.map((a) => ({
      measure: a.measure,
      direction: a.direction,
      level: parseNum(a.level),
    })),
  };
}

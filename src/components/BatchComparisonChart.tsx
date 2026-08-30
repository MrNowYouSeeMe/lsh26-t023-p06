import { useMemo, useState } from 'react';
import type { ClientReport } from '../types';
import { getClientBrand } from '../lib/branding';

interface Props {
  reports: ClientReport[];
  currentMonth: string;
  previousMonth: string;
  onSelectClient: (clientId: string) => void;
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2);
}

export function BatchComparisonChart({ reports, currentMonth, onSelectClient }: Props) {
  // Extract all available measures across clients
  const availableMeasures = useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => r.changes.forEach((c) => set.add(c.measure)));
    return [...set].sort();
  }, [reports]);

  const [selectedMeasure, setSelectedMeasure] = useState<string>(
    availableMeasures[0] ?? 'Sales',
  );

  // Extract client values for selected measure
  const comparisonData = useMemo(() => {
    const items = reports
      .map((r) => {
        const change = r.changes.find((c) => c.measure === selectedMeasure);
        const brand = getClientBrand(r.client.id, r.client.name);
        return {
          clientId: r.client.id,
          clientName: r.client.name,
          current: change ? change.current : 0,
          last: change ? change.last : 0,
          delta: change ? change.delta : 0,
          pct: change ? change.pct : null,
          direction: change ? change.direction : 'flat',
          brand,
        };
      })
      .sort((a, b) => b.current - a.current);

    const sum = items.reduce((acc, curr) => acc + curr.current, 0);
    const average = items.length > 0 ? sum / items.length : 0;
    const maxVal = Math.max(...items.map((i) => Math.abs(i.current)), 1);

    return { items, average, maxVal };
  }, [reports, selectedMeasure]);

  return (
    <div className="batch-comparison-card">
      <div className="batch-chart-header">
        <div className="chart-title-wrap">
          <div className="chart-icon-box">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h4>Cross-Client Metric Benchmark Chart</h4>
            <span className="chart-subtitle">
              Comparing all {reports.length} client accounts for <strong>{currentMonth}</strong>
            </span>
          </div>
        </div>

        <div className="batch-metric-selector">
          <label htmlFor="batch-metric-select" className="selector-label">
            Compare Measure:
          </label>
          <select
            id="batch-metric-select"
            className="select-metric"
            aria-label="Select metric to compare across all clients"
            value={selectedMeasure}
            onChange={(e) => setSelectedMeasure(e.target.value)}
          >
            {availableMeasures.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="batch-chart-summary-bar">
        <div className="summary-stat">
          <span className="stat-label">Agency Mean ({selectedMeasure}):</span>
          <span className="stat-value">{fmt(comparisonData.average)}</span>
        </div>
        <div className="summary-stat">
          <span className="stat-label">Top Performer:</span>
          <span className="stat-value text-success">
            {comparisonData.items[0]?.clientName} ({fmt(comparisonData.items[0]?.current ?? 0)})
          </span>
        </div>
      </div>

      <div className="batch-bars-container">
        {comparisonData.items.map((item) => {
          const widthPct = Math.max(6, (Math.abs(item.current) / comparisonData.maxVal) * 100);
          const isAboveAvg = item.current >= comparisonData.average;
          const diffFromAvg = item.current - comparisonData.average;

          return (
            <div
              key={item.clientId}
              className="batch-bar-row"
              onClick={() => onSelectClient(item.clientId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectClient(item.clientId)}
              aria-label={`View report for ${item.clientName}: ${fmt(item.current)}`}
            >
              <div className="bar-client-info">
                <span className="bar-client-avatar" style={{ background: item.brand.accent }}>
                  {item.brand.initials}
                </span>
                <span className="bar-client-name" title={item.clientName}>
                  {item.clientName}
                </span>
              </div>

              <div className="bar-interactive-track">
                <div
                  className="bar-progress-fill"
                  style={{
                    width: `${widthPct}%`,
                    background: `linear-gradient(90deg, ${item.brand.color} 0%, ${item.brand.accent} 100%)`,
                  }}
                >
                  <span className="bar-val-text">{fmt(item.current)}</span>
                </div>
              </div>

              <div className="bar-variance-badge">
                <span className={`badge-pill ${isAboveAvg ? 'above' : 'below'}`}>
                  {isAboveAvg ? '▲ +' : '▼ '}{fmt(diffFromAvg)} vs avg
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="batch-chart-footer-note">💡 Click any client bar to open their full monthly digest.</p>
    </div>
  );
}

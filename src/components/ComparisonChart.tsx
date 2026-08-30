import { useState } from 'react';
import type { MeasureChange } from '../types';

interface Props {
  changes: MeasureChange[];
  vsAverage?: Record<string, { client: number; average: number; diff: number }>;
  currentMonth: string;
  previousMonth: string;
  clientName: string;
  brandColor?: string;
}

type ChartMode = 'mom' | 'benchmark';

function fmt(n: number): string {
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2);
}

export function ComparisonChart({
  changes,
  vsAverage,
  currentMonth,
  previousMonth,
  clientName,
  brandColor = '#3b82f6',
}: Props) {
  const [mode, setMode] = useState<ChartMode>(vsAverage ? 'benchmark' : 'mom');
  const hasBenchmark = Boolean(vsAverage && Object.keys(vsAverage).length > 0);

  return (
    <div className="comparison-chart-card">
      <div className="chart-card-header">
        <div className="chart-title-wrap">
          <div className="chart-icon-box">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h4>Visual Performance Comparison</h4>
            <span className="chart-subtitle">
              {mode === 'mom'
                ? `Month-over-month shifts (${currentMonth} vs ${previousMonth})`
                : `${clientName} vs dataset agency average`}
            </span>
          </div>
        </div>

        <div className="chart-mode-toggles">
          <button
            type="button"
            className={`btn-chart-toggle ${mode === 'mom' ? 'active' : ''}`}
            onClick={() => setMode('mom')}
          >
            Month-over-Month
          </button>
          {hasBenchmark && (
            <button
              type="button"
              className={`btn-chart-toggle ${mode === 'benchmark' ? 'active' : ''}`}
              onClick={() => setMode('benchmark')}
            >
              vs Agency Average
            </button>
          )}
        </div>
      </div>

      <div className="chart-legend">
        {mode === 'mom' ? (
          <>
            <span className="legend-item">
              <span className="legend-swatch swatch-prev" />
              <span>{previousMonth} (Previous)</span>
            </span>
            <span className="legend-item">
              <span className="legend-swatch swatch-curr" style={{ background: brandColor }} />
              <span>{currentMonth} (Current)</span>
            </span>
          </>
        ) : (
          <>
            <span className="legend-item">
              <span className="legend-swatch swatch-client" style={{ background: brandColor }} />
              <span>{clientName}</span>
            </span>
            <span className="legend-item">
              <span className="legend-swatch swatch-avg" />
              <span>Agency Average Benchmark</span>
            </span>
          </>
        )}
      </div>

      <div className="chart-bars-list">
        {changes.map((c) => {
          if (mode === 'mom') {
            const maxVal = Math.max(Math.abs(c.last), Math.abs(c.current), 1);
            const prevWidth = Math.max(4, (Math.abs(c.last) / maxVal) * 100);
            const currWidth = Math.max(4, (Math.abs(c.current) / maxVal) * 100);
            const isUp = c.direction === 'up';
            const isDown = c.direction === 'down';

            return (
              <div key={c.measure} className="chart-row">
                <div className="chart-row-meta">
                  <span className="chart-measure-label">{c.measure}</span>
                  <span className={`chart-diff-badge dir-${c.direction}`}>
                    {isUp ? '▲' : isDown ? '▼' : '—'}{' '}
                    {c.delta > 0 ? '+' : ''}{fmt(c.delta)}
                    {c.pct !== null && ` (${c.pct > 0 ? '+' : ''}${c.pct.toFixed(1)}%)`}
                  </span>
                </div>

                <div className="chart-track-group">
                  <div className="chart-bar-lane">
                    <span className="lane-tag">{previousMonth.slice(0, 3)}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill bar-fill-prev"
                        style={{ width: `${prevWidth}%` }}
                        title={`${c.measure} (${previousMonth}): ${fmt(c.last)}`}
                      >
                        <span className="bar-label-inner">{fmt(c.last)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="chart-bar-lane">
                    <span className="lane-tag current-tag">{currentMonth.slice(0, 3)}</span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill bar-fill-curr dir-${c.direction}`}
                        style={{
                          width: `${currWidth}%`,
                          background: isUp ? 'var(--success)' : isDown ? 'var(--danger)' : brandColor,
                        }}
                        title={`${c.measure} (${currentMonth}): ${fmt(c.current)}`}
                      >
                        <span className="bar-label-inner">{fmt(c.current)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Benchmark mode
          const bench = vsAverage?.[c.measure];
          if (!bench) return null;

          const maxVal = Math.max(Math.abs(bench.client), Math.abs(bench.average), 1);
          const clientWidth = Math.max(4, (Math.abs(bench.client) / maxVal) * 100);
          const avgWidth = Math.max(4, (Math.abs(bench.average) / maxVal) * 100);
          const isAbove = bench.diff >= 0;
          const pctDiff = bench.average !== 0 ? (bench.diff / Math.abs(bench.average)) * 100 : 0;

          return (
            <div key={c.measure} className="chart-row">
              <div className="chart-row-meta">
                <span className="chart-measure-label">{c.measure}</span>
                <span className={`chart-diff-badge ${isAbove ? 'above-avg' : 'below-avg'}`}>
                  {isAbove ? '▲' : '▼'} {Math.abs(pctDiff).toFixed(1)}% {isAbove ? 'above average' : 'below average'}
                </span>
              </div>

              <div className="chart-track-group">
                <div className="chart-bar-lane">
                  <span className="lane-tag client-tag">Client</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill bar-fill-client"
                      style={{
                        width: `${clientWidth}%`,
                        background: brandColor,
                      }}
                      title={`${clientName}: ${fmt(bench.client)}`}
                    >
                      <span className="bar-label-inner">{fmt(bench.client)}</span>
                    </div>
                  </div>
                </div>

                <div className="chart-bar-lane">
                  <span className="lane-tag avg-tag">Avg</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill bar-fill-avg"
                      style={{ width: `${avgWidth}%` }}
                      title={`Agency Average: ${fmt(bench.average)}`}
                    >
                      <span className="bar-label-inner">{fmt(bench.average)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

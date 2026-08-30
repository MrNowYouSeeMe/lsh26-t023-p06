import { useState } from 'react';
import type { ClientReport } from '../types';
import { getClientBrand } from '../lib/branding';
import { ComparisonChart } from './ComparisonChart';
import { MeasuresTable } from './MeasuresTable';

interface Props {
  report: ClientReport;
  currentMonth: string;
  previousMonth: string;
  summary: string;
  onSummaryChange: (text: string) => void;
  onSummaryReset: () => void;
  isEdited: boolean;
  showVsAverage?: boolean;
  onPrint?: () => void;
}

export function ClientReportCard({
  report,
  currentMonth,
  previousMonth,
  summary,
  onSummaryChange,
  onSummaryReset,
  isEdited,
  showVsAverage,
  onPrint,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(summary);
  const brand = getClientBrand(report.client.id, report.client.name);

  const saveEdit = () => {
    onSummaryChange(draft);
    setEditing(false);
  };

  return (
    <article className="report-card" style={{ '--brand': brand.color, '--accent': brand.accent } as React.CSSProperties}>
      <header className="report-header">
        <div className="report-header-left">
          <div className="client-logo" style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.accent})` }}>
            {brand.initials}
          </div>
          <div>
            <div className="client-title-row">
              <h2>{report.client.name}</h2>
              <span className="client-id-badge">{report.client.id}</span>
            </div>
            <p className="report-period">
              <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                <path fillRule="evenodd" d="M4 1.75a.75.75 0 011.5 0V3h5V1.75a.75.75 0 011.5 0V3a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2V1.75zM3.5 6v6a.5.5 0 00.5.5h8a.5.5 0 00.5-.5V6h-9z" clipRule="evenodd" />
              </svg>
              Performance Period: <strong>{currentMonth}</strong> vs <strong>{previousMonth}</strong>
            </p>
          </div>
        </div>

        <div className="report-header-actions">
          {onPrint && (
            <button type="button" className="btn btn-print" onClick={onPrint}>
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v3a2 2 0 002 2h1v3a1 1 0 001 1h6a1 1 0 001-1v-3h1a2 2 0 002-2V5a2 2 0 00-2-2H4zm8 8H4v2h8v-2zm-8-5h8a1 1 0 011 1v1H3V7a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Print Digest
            </button>
          )}
        </div>
      </header>

      {report.triggeredAlerts.length > 0 && (
        <div className="alert-banner">
          <div className="alert-banner-icon">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="alert-banner-content">
            <strong>Attention: {report.triggeredAlerts.length} Alert Threshold(s) Crossed</strong>
            <div className="alert-banner-tags">
              {report.triggeredAlerts.map((a, i) => (
                <span key={i} className="alert-banner-pill">
                  {a.measure} is {a.direction} {a.level}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="summary-section executive-briefing-card">
        <div className="briefing-header">
          <div className="briefing-badge">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M7.53 1.282a.5.5 0 01.94 0l.914 2.743a.5.5 0 00.475.342h2.884a.5.5 0 01.294.905l-2.333 1.695a.5.5 0 00-.182.559l.914 2.743a.5.5 0 01-.769.56L8.44 9.134a.5.5 0 00-.588 0l-2.227 1.694a.5.5 0 01-.769-.56l.914-2.743a.5.5 0 00-.182-.559L3.257 5.272a.5.5 0 01.294-.905h2.884a.5.5 0 00.475-.342L7.53 1.282z" />
            </svg>
            Automated Executive Briefing
          </div>
          {!editing ? (
            <button type="button" className="btn btn-sm btn-edit-summary" onClick={() => { setDraft(summary); setEditing(true); }}>
              <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.609zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM9.75 4.81L3.905 10.655a.25.25 0 00-.064.108l-.587 2.053 2.053-.587a.25.25 0 00.108-.064L11.19 6.25 9.75 4.81z" />
              </svg>
              Edit Summary
            </button>
          ) : (
            <div className="edit-actions">
              <button type="button" className="btn btn-sm btn-primary" onClick={saveEdit}>Save Changes</button>
              <button type="button" className="btn btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="edit-container">
            <textarea
              className="summary-edit"
              aria-label={`Edit executive performance summary for ${report.client.name}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              placeholder="Edit the client summary here..."
            />
            <span className="edit-hint">Changes are persisted automatically for this client report.</span>
          </div>
        ) : (
          <div className="briefing-body">
            <p className="summary-text">
              {summary}
            </p>
            {isEdited && (
              <div className="summary-status-row">
                <span className="edited-tag">
                  <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                    <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
                  </svg>
                  Custom summary edited by analyst
                </span>
                <button type="button" className="btn-reset-link" onClick={onSummaryReset}>
                  Restore Generated
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="movers-section">
        <div className="section-title-wrap">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
          <h3>Top Movers This Month</h3>
          <span className="subtitle-tag">Largest absolute & relative shifts</span>
        </div>

        <div className="movers-spotlight-grid">
          {report.topMovers.map((m, idx) => (
            <div key={m.measure} className={`mover-spotlight-card dir-${m.direction}`}>
              <div className="mover-card-top">
                <span className="mover-rank">#{idx + 1} Biggest Mover</span>
                <span className={`mover-dir-badge dir-${m.direction}`}>
                  {m.direction === 'up' ? '▲ Increased' : m.direction === 'down' ? '▼ Decreased' : '— Flat'}
                </span>
              </div>
              <h4 className="mover-measure-name">{m.measure}</h4>
              <div className="mover-transition">
                <div className="transition-step">
                  <span className="transition-label">Previous</span>
                  <span className="transition-val">{m.last.toLocaleString()}</span>
                </div>
                <span className="transition-arrow">→</span>
                <div className="transition-step">
                  <span className="transition-label">Current</span>
                  <span className="transition-val">{m.current.toLocaleString()}</span>
                </div>
              </div>
              <div className="mover-change-pill">
                <span className="change-delta">
                  {m.delta > 0 ? '+' : ''}{m.delta.toLocaleString()}
                </span>
                {m.pct !== null && (
                  <span className="change-pct">
                    ({m.pct > 0 ? '+' : ''}{m.pct.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="chart-comparison-section">
        <ComparisonChart
          changes={report.changes}
          vsAverage={showVsAverage ? report.vsAverage : undefined}
          currentMonth={currentMonth}
          previousMonth={previousMonth}
          clientName={report.client.name}
          brandColor={brand.accent}
        />
      </section>

      <section className="all-measures-section">
        <div className="section-title-wrap">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <h3>Full Metric Breakdown</h3>
          <span className="subtitle-tag">{report.changes.length} tracked measures</span>
        </div>
        <MeasuresTable changes={report.changes} topMovers={report.topMovers} />
      </section>

      {showVsAverage && report.vsAverage && (
        <section className="benchmark-section">
          <div className="section-title-wrap">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <h3>Benchmark: Performance vs Agency Client Average</h3>
            <span className="bonus-pill">Bonus Feature</span>
          </div>
          <div className="table-wrap">
            <table className="measures-table benchmark-table">
              <thead>
                <tr>
                  <th>Measure</th>
                  <th>{report.client.name}</th>
                  <th>Agency Average</th>
                  <th>Variance</th>
                  <th>Benchmark Standing</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.vsAverage).map(([measure, v]) => {
                  const isAbove = v.diff >= 0;
                  const pctDiff = v.average !== 0 ? (v.diff / Math.abs(v.average)) * 100 : 0;
                  return (
                    <tr key={measure}>
                      <td className="measure-cell"><strong>{measure}</strong></td>
                      <td>{v.client.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td>{v.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className={isAbove ? 'delta-up' : 'delta-down'}>
                        {isAbove ? '+' : ''}{v.diff.toFixed(2)}
                      </td>
                      <td>
                        <span className={`benchmark-pill ${isAbove ? 'above' : 'below'}`}>
                          {isAbove ? '▲' : '▼'} {Math.abs(pctDiff).toFixed(1)}% {isAbove ? 'above avg' : 'below avg'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </article>
  );
}

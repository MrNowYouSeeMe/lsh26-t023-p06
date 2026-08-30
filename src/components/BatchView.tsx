import type { AlertRule, ClientReport } from '../types';
import { getClientBrand } from '../lib/branding';
import { BatchComparisonChart } from './BatchComparisonChart';

interface Props {
  reports: ClientReport[];
  currentMonth: string;
  previousMonth: string;
  getSummary: (clientId: string, generated: string) => string;
  onSelectClient: (id: string) => void;
}

export function BatchView({ reports, currentMonth, previousMonth, getSummary, onSelectClient }: Props) {
  const alertClients = reports.filter((r) => r.triggeredAlerts.length > 0);
  const cleanClients = reports.filter((r) => r.triggeredAlerts.length === 0);

  return (
    <div className="batch-view">
      <div className="batch-stats">
        <div className="stat stat-total">
          <div className="stat-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">Total Client Reports</span>
            <span className="stat-num">{reports.length}</span>
            <span className="stat-sub">Fully analyzed & calculated</span>
          </div>
        </div>

        <div className="stat stat-alert">
          <div className="stat-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">Action Required</span>
            <span className="stat-num">{alertClients.length}</span>
            <span className="stat-sub">Threshold alerts flagged</span>
          </div>
        </div>

        <div className="stat stat-ok">
          <div className="stat-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-body">
            <span className="stat-label">Healthy Performance</span>
            <span className="stat-num">{cleanClients.length}</span>
            <span className="stat-sub">Within expected limits</span>
          </div>
        </div>
      </div>

      <BatchComparisonChart
        reports={reports}
        currentMonth={currentMonth}
        previousMonth={previousMonth}
        onSelectClient={onSelectClient}
      />

      {alertClients.length > 0 && (
        <section className="batch-section">
          <div className="batch-section-header">
            <div className="header-badge alert-indicator">
              <span className="pulse-dot" />
              Flagged Alerts
            </div>
            <h3>Clients Requiring Attention</h3>
            <span className="count-pill warning">{alertClients.length}</span>
          </div>
          <div className="batch-grid">
            {alertClients.map((r) => (
              <BatchCard
                key={r.client.id}
                report={r}
                currentMonth={currentMonth}
                previousMonth={previousMonth}
                summary={getSummary(r.client.id, r.summary)}
                onSelect={() => onSelectClient(r.client.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="batch-section">
        <div className="batch-section-header">
          <div className="header-badge ok-indicator">
            <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
              <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 01.208 1.04l-5 7.5a.75.75 0 01-1.154.114l-3-3a.75.75 0 011.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 011.04-.207z" clipRule="evenodd" />
            </svg>
            {alertClients.length > 0 ? 'Standard' : 'All Accounts'}
          </div>
          <h3>{alertClients.length > 0 ? 'All Other Clients' : 'All Client Reports'}</h3>
          <span className="count-pill">{alertClients.length > 0 ? cleanClients.length : reports.length}</span>
        </div>
        <div className="batch-grid">
          {(alertClients.length > 0 ? cleanClients : reports).map((r) => (
            <BatchCard
              key={r.client.id}
              report={r}
              currentMonth={currentMonth}
              previousMonth={previousMonth}
              summary={getSummary(r.client.id, r.summary)}
              onSelect={() => onSelectClient(r.client.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function BatchCard({
  report,
  currentMonth,
  previousMonth,
  summary,
  onSelect,
}: {
  report: ClientReport;
  currentMonth: string;
  previousMonth: string;
  summary: string;
  onSelect: () => void;
}) {
  const hasAlert = report.triggeredAlerts.length > 0;
  const brand = getClientBrand(report.client.id, report.client.name);

  return (
    <article
      className={`batch-card ${hasAlert ? 'has-alert' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`Open detailed report for ${report.client.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{ '--card-brand': brand.color, '--card-accent': brand.accent } as React.CSSProperties}
    >
      <header className="batch-card-header">
        <div className="batch-card-title-group">
          <div className="client-avatar-mini" style={{ background: brand.accent }}>
            {brand.initials}
          </div>
          <div>
            <h4>{report.client.name}</h4>
            <span className="batch-period">{currentMonth} vs {previousMonth}</span>
          </div>
        </div>
        <span className="card-arrow" aria-hidden="true">→</span>
      </header>

      {hasAlert && (
        <div className="batch-alert-tags">
          {report.triggeredAlerts.map((a: AlertRule, i: number) => (
            <span key={i} className="alert-tag">
              <svg viewBox="0 0 16 16" fill="currentColor" width="10" height="10">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {a.measure} {a.direction} {a.level}
            </span>
          ))}
        </div>
      )}

      <p className="batch-summary">{summary.slice(0, 135)}…</p>

      <div className="batch-movers">
        <span className="movers-caption">Top Movers:</span>
        {report.topMovers.map((m) => (
          <span key={m.measure} className={`mover-chip dir-${m.direction}`}>
            <span className="chip-icon">
              {m.direction === 'up' ? '↑' : m.direction === 'down' ? '↓' : '•'}
            </span>
            <span className="chip-label">{m.measure}</span>
            <span className="chip-val">
              {m.delta > 0 ? '+' : ''}{m.delta.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          </span>
        ))}
      </div>
    </article>
  );
}

import type { ClientReport } from '../types';
import { getClientBrand } from '../lib/branding';

interface Props {
  report: ClientReport;
  currentMonth: string;
  previousMonth: string;
  summary: string;
}

export function PrintReport({ report, currentMonth, previousMonth, summary }: Props) {
  const brand = getClientBrand(report.client.id, report.client.name);

  return (
    <div className="print-report" style={{ '--brand': brand.color, '--accent': brand.accent } as React.CSSProperties}>
      <header className="print-header">
        <div className="print-logo">{brand.initials}</div>
        <div>
          <h1>{report.client.name}</h1>
          <p>Monthly Performance Report — {currentMonth} (vs {previousMonth})</p>
        </div>
      </header>

      <section className="print-summary">
        <h2>Executive Summary</h2>
        <p>{summary}</p>
      </section>

      <section>
        <h2>Key Changes</h2>
        <ul>
          {report.topMovers.map((m) => (
            <li key={m.measure}>
              {m.measure}: {m.last.toLocaleString()} → {m.current.toLocaleString()}
              ({m.direction === 'up' ? '+' : ''}{m.delta.toLocaleString()})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Full Metrics</h2>
        <table>
          <thead>
            <tr><th>Measure</th><th>Last</th><th>Current</th><th>Change</th></tr>
          </thead>
          <tbody>
            {report.changes.map((c) => (
              <tr key={c.measure}>
                <td>{c.measure}</td>
                <td>{c.last.toLocaleString()}</td>
                <td>{c.current.toLocaleString()}</td>
                <td>{c.delta > 0 ? '+' : ''}{c.delta.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {report.triggeredAlerts.length > 0 && (
        <section className="print-alerts">
          <h2>Alerts Triggered</h2>
          <ul>
            {report.triggeredAlerts.map((a, i) => (
              <li key={i}>{a.measure} is {a.direction} {a.level}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

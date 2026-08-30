import type { MeasureChange } from '../types';

function fmt(n: number): string {
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2);
}

interface Props {
  changes: MeasureChange[];
  topMovers: MeasureChange[];
}

export function MeasuresTable({ changes, topMovers }: Props) {
  const moverSet = new Set(topMovers.map((m) => m.measure));

  return (
    <div className="table-wrap">
      <table className="measures-table">
        <thead>
          <tr>
            <th>Measure</th>
            <th>Previous Month</th>
            <th>Current Month</th>
            <th>Net Change</th>
            <th>Direction</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => {
            const isTopMover = moverSet.has(c.measure);
            return (
              <tr key={c.measure} className={isTopMover ? 'row-top-mover' : ''}>
                <td className="measure-name-cell">
                  <div className="measure-name-wrap">
                    <span className="measure-name">{c.measure}</span>
                    {isTopMover && (
                      <span className="top-mover-pill">
                        <svg viewBox="0 0 16 16" fill="currentColor" width="10" height="10">
                          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                        </svg>
                        Top Mover
                      </span>
                    )}
                  </div>
                </td>
                <td className="number-cell">{fmt(c.last)}</td>
                <td className="number-cell font-semibold">{fmt(c.current)}</td>
                <td className={`delta-cell delta-${c.direction}`}>
                  <span className="delta-val">
                    {c.delta > 0 ? '+' : ''}{fmt(c.delta)}
                  </span>
                  {c.pct !== null && (
                    <span className="delta-pct">
                      ({c.pct > 0 ? '+' : ''}{c.pct.toFixed(1)}%)
                    </span>
                  )}
                </td>
                <td>
                  <span className={`direction-badge dir-${c.direction}`}>
                    <span className="dir-icon">
                      {c.direction === 'up' ? '▲' : c.direction === 'down' ? '▼' : '—'}
                    </span>
                    <span className="dir-text">
                      {c.direction === 'up' ? 'Improved' : c.direction === 'down' ? 'Declined' : 'Unchanged'}
                    </span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

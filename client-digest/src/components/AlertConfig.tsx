import type { AlertRule } from '../types';

interface Props {
  alerts: AlertRule[];
  availableMeasures: string[];
  onChange: (alerts: AlertRule[]) => void;
}

export function AlertConfig({ alerts, availableMeasures, onChange }: Props) {
  const addAlert = () => {
    const measure = availableMeasures[0] ?? 'Sales';
    onChange([...alerts, { measure, direction: 'below', level: 100 }]);
  };

  const updateAlert = (index: number, patch: Partial<AlertRule>) => {
    onChange(alerts.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  };

  const removeAlert = (index: number) => {
    onChange(alerts.filter((_, i) => i !== index));
  };

  return (
    <div className="alert-config">
      <div className="section-head">
        <div className="section-title-wrap">
          <svg className="section-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <h3>Alert Triggers</h3>
          <span className="count-badge">{alerts.length}</span>
        </div>
        <button type="button" className="btn btn-sm btn-primary" onClick={addAlert}>
          <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
            <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
          </svg>
          Add Rule
        </button>
      </div>
      <p className="hint">Flag clients automatically when current measures breach thresholds.</p>
      {alerts.length === 0 && <div className="empty-state">No active alert thresholds configured.</div>}
      <div className="alert-cards-list">
        {alerts.map((alert, i) => (
          <div key={i} className="alert-card-row">
            <div className="alert-row-top">
              <select
                className="select-measure"
                aria-label={`Alert rule ${i + 1} measure`}
                value={alert.measure}
                onChange={(e) => updateAlert(i, { measure: e.target.value })}
              >
                {availableMeasures.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn-icon-remove"
                title={`Remove alert rule ${i + 1}`}
                aria-label={`Remove alert rule ${i + 1} for ${alert.measure}`}
                onClick={() => removeAlert(i)}
              >
                <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 000 1.5h.58l.8 7.99A2.25 2.25 0 006.37 15.5h3.26a2.25 2.25 0 002.24-2.01l.8-7.99h.58a.75.75 0 000-1.5H11V3.25A1.25 1.25 0 009.75 2h-3.5A1.25 1.25 0 005 3.25zm1.5 0h3v.75h-3v-.75zm4.24 3l-.75 7.45a.75.75 0 01-.74.65H6.75a.75.75 0 01-.74-.65L5.26 6.25h5.48z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="alert-row-bottom">
              <select
                className={`select-direction dir-${alert.direction}`}
                aria-label={`Alert rule ${i + 1} trigger condition`}
                value={alert.direction}
                onChange={(e) => updateAlert(i, { direction: e.target.value as 'above' | 'below' })}
              >
                <option value="below">is below &lt;</option>
                <option value="above">is above &gt;</option>
              </select>
              <div className="input-threshold-wrap">
                <input
                  type="number"
                  className="input-threshold"
                  aria-label={`Alert rule ${i + 1} threshold numeric level`}
                  value={alert.level}
                  onChange={(e) => updateAlert(i, { level: parseFloat(e.target.value) || 0 })}
                  step="any"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

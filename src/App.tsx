import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import { AlertConfig } from './components/AlertConfig';
import { BatchView } from './components/BatchView';
import { ClientReportCard } from './components/ClientReportCard';
import { PrintReport } from './components/PrintReport';
import { useEditedSummaries } from './hooks/useEditedSummaries';
import { generateDataset } from './lib/dataGenerator';
import { buildAllReports, fixtureCaseToDataset } from './lib/reportEngine';
import type { AlertRule, Dataset, FixtureFile } from './types';

type Tab = 'client' | 'batch';
type DataSource = 'generated' | 'fixture';

function App() {
  const [dataset, setDataset] = useState<Dataset>(() => generateDataset(8));
  const [alerts, setAlerts] = useState<AlertRule[]>(dataset.alerts);
  const [tab, setTab] = useState<Tab>('batch');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('generated');
  const [fixtureCases, setFixtureCases] = useState<FixtureFile['cases']>([]);
  const [selectedCase, setSelectedCase] = useState(0);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(true);
  const [fixtureError, setFixtureError] = useState<string | null>(null);
  const [showVsAverage, setShowVsAverage] = useState(false);
  const [printClientId, setPrintClientId] = useState<string | null>(null);
  const [fixtureReloadKey, setFixtureReloadKey] = useState(0);

  const datasetKey = dataSource === 'fixture'
    ? (fixtureCases[selectedCase]?.case_id ?? `fixture-${selectedCase}`)
    : 'generated';
  const { getSummary, setSummary, resetSummary, hasEdit } = useEditedSummaries(datasetKey);

  const retryFetchFixtures = useCallback(() => {
    setIsLoadingFixtures(true);
    setFixtureError(null);
    setFixtureReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let ignore = false;

    fetch('/fixtures.json')
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}: Failed to load fixtures`);
        }
        return r.json();
      })
      .then((data: FixtureFile) => {
        if (!ignore) {
          setFixtureCases(data.cases);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setFixtureError(err instanceof Error ? err.message : 'Failed to load official fixture data');
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingFixtures(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [fixtureReloadKey]);

  const availableMeasures = useMemo(() => {
    const set = new Set<string>();
    dataset.clients.forEach((c) => c.measures.forEach((m) => set.add(m.measure)));
    return [...set].sort();
  }, [dataset]);

  const reports = useMemo(
    () => buildAllReports(dataset, alerts, showVsAverage),
    [dataset, alerts, showVsAverage],
  );

  const selectedReport = reports.find((r) => r.client.id === selectedClientId) ?? reports[0];

  const loadGenerated = useCallback(() => {
    const next = generateDataset(8);
    setDataset(next);
    setAlerts(next.alerts);
    setDataSource('generated');
    setSelectedClientId(null);
  }, []);

  const loadFixtureCase = useCallback(
    (index: number) => {
      const fixture = fixtureCases[index];
      if (!fixture) return;
      const next = fixtureCaseToDataset(fixture);
      setDataset(next);
      setAlerts(next.alerts);
      setDataSource('fixture');
      setSelectedCase(index);
      setSelectedClientId(null);
    },
    [fixtureCases],
  );

  const handlePrint = (clientId: string) => {
    setPrintClientId(clientId);
    setTimeout(() => {
      window.print();
      setPrintClientId(null);
    }, 100);
  };

  const printReport = printClientId
    ? reports.find((r) => r.client.id === printClientId)
    : null;

  return (
    <div className="app">
      {printReport && (
        <div className="print-only">
          <PrintReport
            report={printReport}
            currentMonth={dataset.currentMonth}
            previousMonth={dataset.previousMonth}
            summary={getSummary(printReport.client.id, printReport.summary)}
          />
        </div>
      )}

      <header className="app-header">
        <div className="app-brand">
          <div className="brand-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="brand-title-row">
              <h1>Client Reporting Digest</h1>
              <span className="live-badge">
                <span className="live-dot" /> LIVE DIGEST
              </span>
            </div>
            <p className="subtitle">
              Automated multi-client performance summaries &middot; <strong>{dataset.currentMonth}</strong> vs <strong>{dataset.previousMonth}</strong> ({dataset.clients.length} accounts)
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="btn btn-regenerate" onClick={loadGenerated} title="Generate new random data">
            <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
              <path fillRule="evenodd" d="M8 2.5a5.487 5.487 0 00-4.131 1.869l1.204 1.204A.25.25 0 014.896 6H1.25A.25.25 0 011 5.75V2.104a.25.25 0 01.427-.177l1.38 1.38A7 7 0 111 8a.75.75 0 011.5 0 5.5 5.5 0 105.5-5.5z" clipRule="evenodd" />
            </svg>
            Regenerate Sample
          </button>

          {isLoadingFixtures && (
            <span className="fixtures-status-pill">Loading fixtures…</span>
          )}

          {fixtureCases.length > 0 && (
            <div className="fixture-select-wrap">
              <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" className="select-icon">
                <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm0 5a1 1 0 011-1h10a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V8zm1 4a1 1 0 00-1 1v2a1 1 0 001 1h10a1 1 0 001-1v-2a1 1 0 00-1-1H3z" />
              </svg>
              <select
                className="fixture-select"
                aria-label="Select test fixture case or mock data"
                value={dataSource === 'fixture' ? selectedCase : ''}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '') loadGenerated();
                  else loadFixtureCase(parseInt(v, 10));
                }}
              >
                <option value="">Generated Mock (8 accounts)</option>
                {fixtureCases.map((c, i) => (
                  <option key={c.case_id} value={i}>
                    Official Test Case {c.case_id} ({c.clients.length} accounts)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {fixtureError && (
        <div className="fixture-error-banner" role="alert">
          <span>⚠️ {fixtureError}</span>
          <button type="button" className="btn btn-sm btn-retry" onClick={retryFetchFixtures}>
            Retry Load
          </button>
        </div>
      )}

      <nav className="tabs">
        <div className="tabs-nav-group">
          <button
            type="button"
            className={`tab-btn ${tab === 'batch' ? 'active' : ''}`}
            onClick={() => setTab('batch')}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M1 2.75A.75.75 0 011.75 2h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5A.75.75 0 011 7.25v-4.5zm0 6.5A.75.75 0 011.75 8.5h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5A.75.75 0 011 13.75v-4.5zm8-6.5a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5A.75.75 0 019 7.25v-4.5zm0 6.5a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5z" />
            </svg>
            Batch View
            <span className="tab-pill">{reports.length}</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${tab === 'client' ? 'active' : ''}`}
            onClick={() => setTab('client')}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm2-3a2 2 0 11-4 0 2 2 0 014 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
            </svg>
            Client Report
            {selectedReport && (
              <span className="tab-pill active-client-pill">{selectedReport.client.name}</span>
            )}
          </button>
        </div>
      </nav>

      <aside className="sidebar">
        <AlertConfig alerts={alerts} availableMeasures={availableMeasures} onChange={setAlerts} />

        <div className="sidebar-divider" />

        <div className="sidebar-bonus-card">
          <div className="bonus-card-head">
            <span className="bonus-label">Benchmark Feature</span>
          </div>
          <label className="toggle-switch-wrap">
            <div className="toggle-switch">
              <input
                type="checkbox"
                aria-label="Compare versus client average benchmark"
                checked={showVsAverage}
                onChange={(e) => setShowVsAverage(e.target.checked)}
              />
              <span className="switch-slider" />
            </div>
            <div className="toggle-info">
              <span className="toggle-title">Compare vs Client Average</span>
              <span className="toggle-desc">Evaluates each measure against the dataset-wide mean</span>
            </div>
          </label>
        </div>

        {tab === 'client' && (
          <div className="client-picker">
            <div className="section-head">
              <div className="section-title-wrap">
                <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 015 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 005 9c-4 0-5 3-5 4s1 1 1 1h4.216z" />
                  <path d="M4.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                </svg>
                <h3>Switch Client</h3>
              </div>
              <span className="count-badge">{reports.length}</span>
            </div>

            <div className="client-buttons-list">
              {reports.map((r) => {
                const isSelected = selectedReport?.client.id === r.client.id;
                const hasAlert = r.triggeredAlerts.length > 0;
                return (
                  <button
                    key={r.client.id}
                    type="button"
                    className={`client-select-card ${isSelected ? 'active' : ''} ${hasAlert ? 'has-alert' : ''}`}
                    onClick={() => setSelectedClientId(r.client.id)}
                  >
                    <div className="card-client-left">
                      <span className="client-avatar-tiny">{r.client.id}</span>
                      <span className="client-card-name">{r.client.name}</span>
                    </div>
                    {hasAlert ? (
                      <span className="alert-count-pill" title={`${r.triggeredAlerts.length} alert(s) triggered`}>
                        {r.triggeredAlerts.length}
                      </span>
                    ) : (
                      <span className="ok-dot" title="All metrics clear" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      <main className="main">
        {tab === 'batch' ? (
          <BatchView
            reports={reports}
            currentMonth={dataset.currentMonth}
            previousMonth={dataset.previousMonth}
            getSummary={getSummary}
            onSelectClient={(id) => {
              setSelectedClientId(id);
              setTab('client');
            }}
          />
        ) : selectedReport ? (
          <ClientReportCard
            report={selectedReport}
            currentMonth={dataset.currentMonth}
            previousMonth={dataset.previousMonth}
            summary={getSummary(selectedReport.client.id, selectedReport.summary)}
            onSummaryChange={(text) => setSummary(selectedReport.client.id, text)}
            onSummaryReset={() => resetSummary(selectedReport.client.id)}
            isEdited={hasEdit(selectedReport.client.id)}
            showVsAverage={showVsAverage}
            onPrint={() => handlePrint(selectedReport.client.id)}
          />
        ) : (
          <div className="empty-state-main">
            <h3>No client selected</h3>
            <p>Select a client from the sidebar to view their individual monthly performance digest.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

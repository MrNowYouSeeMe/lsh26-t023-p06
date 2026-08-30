import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcChange,
  parseNum,
  getTopMovers,
  checkAlerts,
  computeAverages,
  generateSummary,
  fixtureCaseToDataset,
} from './reportEngine.ts';
import type { AlertRule, Client, MeasureChange } from '../types.ts';

describe('Report Engine Calculation Edge Cases', () => {
  describe('parseNum', () => {
    it('parses numeric values correctly', () => {
      assert.equal(parseNum(42), 42);
      assert.equal(parseNum('123.45'), 123.45);
      assert.equal(parseNum('-10.5'), -10.5);
    });
  });

  describe('calcChange Edge Cases', () => {
    it('handles zero baseline (last = 0) without division by zero', () => {
      const change = calcChange(0, 50);
      assert.equal(change.delta, 50);
      assert.equal(change.direction, 'up');
      assert.equal(change.pct, null, 'percentage must be null for zero baseline');
      assert.equal(change.magnitude, 50, 'magnitude must use absolute delta');
    });

    it('handles small starting numbers (< 1) using absolute change for magnitude', () => {
      // Starting base is 0.4 (< 1.0)
      const change = calcChange(0.4, 0.9);
      assert.equal(change.delta, 0.5);
      assert.equal(change.direction, 'up');
      assert.ok(change.pct !== null);
      assert.equal(change.pct, 125);
      // Magnitude should be absolute delta (0.5), not percentage (125) to avoid skewing movers
      assert.equal(change.magnitude, 0.5);
    });

    it('handles normal numbers (>= 1) using percentage change for magnitude', () => {
      const change = calcChange(100, 150);
      assert.equal(change.delta, 50);
      assert.equal(change.pct, 50);
      assert.equal(change.direction, 'up');
      assert.equal(change.magnitude, 50);
    });

    it('handles negative change (decrease) correctly', () => {
      const change = calcChange(200, 150);
      assert.equal(change.delta, -50);
      assert.equal(change.pct, -25);
      assert.equal(change.direction, 'down');
      assert.equal(change.magnitude, 25);
    });

    it('handles flat / unchanged metrics', () => {
      const change = calcChange(75, 75);
      assert.equal(change.delta, 0);
      assert.equal(change.pct, 0);
      assert.equal(change.direction, 'flat');
      assert.equal(change.magnitude, 0);
    });
  });

  describe('getTopMovers', () => {
    it('ranks and returns top 2 biggest movers by magnitude', () => {
      const changes: MeasureChange[] = [
        { measure: 'Clicks', last: 100, current: 105, delta: 5, pct: 5, direction: 'up', magnitude: 5 },
        { measure: 'Conversions', last: 10, current: 20, delta: 10, pct: 100, direction: 'up', magnitude: 100 },
        { measure: 'Bounce Rate', last: 50, current: 25, delta: -25, pct: -50, direction: 'down', magnitude: 50 },
        { measure: 'Impressions', last: 1000, current: 1010, delta: 10, pct: 1, direction: 'up', magnitude: 1 },
      ];

      const top2 = getTopMovers(changes, 2);
      assert.equal(top2.length, 2);
      assert.equal(top2[0].measure, 'Conversions');
      assert.equal(top2[1].measure, 'Bounce Rate');
    });
  });

  describe('checkAlerts', () => {
    const changes: MeasureChange[] = [
      { measure: 'Cost Per Click', last: 1.5, current: 3.2, delta: 1.7, pct: 113.3, direction: 'up', magnitude: 113.3 },
      { measure: 'Sales', last: 500, current: 400, delta: -100, pct: -20, direction: 'down', magnitude: 20 },
      { measure: 'Traffic', last: 1000, current: 1200, delta: 200, pct: 20, direction: 'up', magnitude: 20 },
    ];

    it('detects alerts when condition is breached (above and below)', () => {
      const alerts: AlertRule[] = [
        { measure: 'Cost Per Click', direction: 'above', level: 2.0 }, // 3.2 > 2.0 -> triggered
        { measure: 'Sales', direction: 'below', level: 450 },          // 400 < 450 -> triggered
        { measure: 'Traffic', direction: 'below', level: 800 },        // 1200 not < 800 -> clear
      ];

      const triggered = checkAlerts(changes, alerts);
      assert.equal(triggered.length, 2);
      assert.equal(triggered[0].measure, 'Cost Per Click');
      assert.equal(triggered[1].measure, 'Sales');
    });
  });

  describe('computeAverages', () => {
    it('computes dataset-wide mean for each measure', () => {
      const clients: Client[] = [
        {
          id: 'C01',
          name: 'Alpha',
          measures: [
            { measure: 'Sales', last: 100, current: 200 },
            { measure: 'Spend', last: 50, current: 100 },
          ],
        },
        {
          id: 'C02',
          name: 'Beta',
          measures: [
            { measure: 'Sales', last: 100, current: 400 },
            { measure: 'Spend', last: 50, current: 200 },
          ],
        },
      ];

      const averages = computeAverages(clients);
      assert.equal(averages['Sales'], 300);
      assert.equal(averages['Spend'], 150);
    });
  });

  describe('generateSummary', () => {
    it('generates informative narrative summary naming top movers', () => {
      const client: Client = {
        id: 'C01',
        name: 'Acme Corp',
        measures: [
          { measure: 'Sales', last: 100, current: 150 },
          { measure: 'ROI', last: 2, current: 4 },
        ],
      };
      const changes: MeasureChange[] = [
        { measure: 'Sales', last: 100, current: 150, delta: 50, pct: 50, direction: 'up', magnitude: 50 },
        { measure: 'ROI', last: 2, current: 4, delta: 2, pct: 100, direction: 'up', magnitude: 100 },
      ];
      const topMovers = getTopMovers(changes, 2);

      const summary = generateSummary(client, changes, topMovers, 'August 2026', 'July 2026');
      assert.ok(summary.includes("Acme Corp's August 2026 report (vs July 2026)"));
      assert.ok(summary.includes('ROI'));
      assert.ok(summary.includes('Sales'));
      assert.ok(summary.includes('improved'));
    });
  });

  describe('fixtureCaseToDataset', () => {
    it('converts official fixture case structure to typed Dataset', () => {
      const fixtureCase = {
        previous_month: '2026-06',
        current_month: '2026-07',
        clients: [
          {
            id: 'PUB-C01',
            name: 'Client One',
            measures: [
              { measure: 'CTR', last: '2.5', current: '3.1' },
            ],
          },
        ],
        alerts: [
          { measure: 'CTR', direction: 'below' as const, level: '2.0' },
        ],
      };

      const dataset = fixtureCaseToDataset(fixtureCase);
      assert.equal(dataset.previousMonth, '2026-06');
      assert.equal(dataset.currentMonth, '2026-07');
      assert.equal(dataset.clients.length, 1);
      assert.equal(dataset.clients[0].measures[0].last, 2.5);
      assert.equal(dataset.clients[0].measures[0].current, 3.1);
      assert.equal(dataset.alerts[0].level, 2.0);
    });
  });
});

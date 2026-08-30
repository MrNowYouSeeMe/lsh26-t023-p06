import type { Client, Dataset } from '../types';

const MEASURES = [
  'Impressions',
  'Clicks',
  'Sessions',
  'Sales',
  'Conversion Rate',
  'Spend',
  'CTR',
  'Leads',
  'Followers Gained',
];

const CLIENT_NAMES = [
  'Khulna Motors',
  'Padma Foods',
  'Dhaka Dental Care',
  'Sundarban Tours',
  'Chittagong Tech',
  'Rajshahi Textiles',
  'Sylhet Tea Co',
  'Barishal Fisheries',
  'Rangpur Agro',
  'Comilla Crafts',
  'Mymensingh Media',
  'Jessore Jewellers',
];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function round(n: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function generateMeasureValue(measure: string): { last: number; current: number } {
  switch (measure) {
    case 'Conversion Rate':
    case 'CTR':
      return { last: round(rand(1, 12)), current: round(rand(1, 12)) };
    case 'Spend':
      return { last: round(rand(500, 50000)), current: round(rand(500, 50000)) };
    case 'Followers Gained':
      return { last: round(rand(0, 5000)), current: round(rand(0, 5000)) };
    case 'Leads':
      return { last: round(rand(10, 2000)), current: round(rand(10, 2000)) };
    default:
      return { last: round(rand(0, 5000)), current: round(rand(0, 5000)) };
  }
}

export function generateDataset(clientCount = 8): Dataset {
  const clients: Client[] = CLIENT_NAMES.slice(0, clientCount).map((name, i) => {
    const measureCount = 5 + Math.floor(Math.random() * 3);
    const selected = [...MEASURES].sort(() => Math.random() - 0.5).slice(0, measureCount);
    return {
      id: `C${String(i + 1).padStart(2, '0')}`,
      name,
      measures: selected.map((measure) => ({
        measure,
        ...generateMeasureValue(measure),
      })),
    };
  });

  return {
    previousMonth: '2026-07',
    currentMonth: '2026-08',
    clients,
    alerts: [
      { measure: 'Sales', direction: 'below', level: 300 },
      { measure: 'Conversion Rate', direction: 'above', level: 10 },
    ],
  };
}

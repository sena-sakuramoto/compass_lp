/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const appSource = readFileSync(
  fileURLToPath(new URL('../App.tsx', import.meta.url)),
  'utf8',
);
const htmlSource = readFileSync(
  fileURLToPath(new URL('../../index.html', import.meta.url)),
  'utf8',
);

describe('public marketing claims', () => {
  it.each([
    '工数削減',
    '情報共有の改善',
    '週あたりの会議削減',
    '継続利用率',
    '60代の職人さんも初日から活用',
    'スマホで3タップ、進捗報告完了',
    '学習コストゼロ',
    'マニュアルも研修も不要',
    '翌日から自発的に入力してくれる',
  ])('removes unsupported claim: %s', (claim) => {
    expect(appSource).not.toContain(claim);
  });

  it('removes unsupported offer and rating structured data', () => {
    expect(htmlSource).not.toContain('"price": "1000"');
    expect(htmlSource).not.toContain('AggregateRating');
    expect(htmlSource).not.toContain('ratingValue');
    expect(htmlSource).not.toContain('ratingCount');
  });

  it('keeps non-JavaScript demo, pricing, trial, and inquiry routes', () => {
    expect(htmlSource).toContain('<noscript>');
    expect(htmlSource).toContain('https://compass-demo.web.app/');
    expect(htmlSource).toContain('subject=COMPASS%2014%E6%97%A5%E9%96%93%E7%84%A1%E6%96%99%E3%83%88%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%AB');
    expect(htmlSource).toContain('subject=COMPASS%20%E6%96%99%E9%87%91%E7%A2%BA%E8%AA%8D');
    expect(htmlSource).toContain('compass@archi-prisma.co.jp');
  });
});

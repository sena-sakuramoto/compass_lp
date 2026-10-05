/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FOREIGN_COUNTRY_NOTICES, LP_ANALYTICS, PRIVACY_PROCESSORS } from './privacyProcessors';

const privacySource = readFileSync(
  fileURLToPath(new URL('../pages/PrivacyPage.tsx', import.meta.url)),
  'utf8',
);
const htmlSource = readFileSync(
  fileURLToPath(new URL('../../index.html', import.meta.url)),
  'utf8',
);

describe('privacy policy processors', () => {
  it('lists every external service the Compass code calls (2026-10-04 audit)', () => {
    const services = PRIVACY_PROCESSORS.map((processor) => processor.service).join('\n');
    for (const name of [
      'Google Cloud',
      'Firebase',
      'Stripe',
      'Gmail API',
      'Gemini',
      'OpenAI',
      'Soniox',
      'Cloudflare',
      'Google Maps',
      'モジオコ',
    ]) {
      expect(services).toContain(name);
    }
  });

  it('states purpose, data and region for every processor', () => {
    for (const processor of PRIVACY_PROCESSORS) {
      expect(processor.company.trim()).not.toBe('');
      expect(processor.purpose.trim()).not.toBe('');
      expect(processor.data.trim()).not.toBe('');
      expect(processor.region.trim()).not.toBe('');
    }
  });

  it('keeps Google Cloud data in Tokyo and MOJIOKO in asia-east1', () => {
    const gcp = PRIVACY_PROCESSORS.find((processor) => processor.service.startsWith('Google Cloud'));
    expect(gcp?.region).toContain('東京');
    const mojioko = PRIVACY_PROCESSORS.find((processor) => processor.service.startsWith('モジオコ'));
    expect(mojioko?.region).toContain('asia-east1');
  });

  it('explains the system of every foreign country a processor or store is in (APPI art. 28)', () => {
    const countries = FOREIGN_COUNTRY_NOTICES.map((notice) => notice.country);
    expect(countries).toEqual(expect.arrayContaining(['米国', '台湾']));
    expect(privacySource).toContain('第28条');
    expect(privacySource).toContain('外国における個人情報の保護に関する制度等の調査');
  });

  it('does not list Google Analytics as a Compass app processor, and mentions it only for the LP that loads gtag', () => {
    expect(PRIVACY_PROCESSORS.some((processor) => /Analytics/i.test(processor.service))).toBe(false);
    expect(htmlSource).toContain('googletagmanager.com/gtag/js');
    expect(LP_ANALYTICS.service).toBe('Google Analytics');
    expect(privacySource).toContain('分析Cookieを使用していません');
  });
});

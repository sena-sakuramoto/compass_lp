import { describe, expect, it } from 'vitest';
import {
  AI_CONSULT_CANONICAL_URL,
  AI_CONSULT_TOPICS,
  AI_PROVIDERS,
  buildAiConsultAnalyticsEvent,
  buildAiConsultTarget,
  buildCompassConsultPrompt,
  normalizeCompassPublicUrl,
  providerIconSvg,
  resolveAiConsultTopic,
} from './ai-consult';

describe('COMPASS AI consultation contract', () => {
  it('offers five broad topics and four providers', () => {
    expect(AI_CONSULT_TOPICS.map((topic) => topic.id)).toEqual([
      'general', 'fit', 'excel', 'pricing', 'onboarding',
    ]);
    expect(AI_PROVIDERS.map((provider) => provider.id)).toEqual([
      'chatgpt', 'gemini', 'claude', 'perplexity',
    ]);
  });

  it('falls back to general for an unknown topic', () => {
    expect(resolveAiConsultTopic('company=secret')).toBe('general');
  });

  it('fails closed to the approved canonical URL', () => {
    expect(normalizeCompassPublicUrl(
      'https://compass.archi-prisma.co.jp/?email=secret@example.com#project-a',
    )).toBe(AI_CONSULT_CANONICAL_URL);
    expect(normalizeCompassPublicUrl('https://evil.example/compass')).toBe(
      AI_CONSULT_CANONICAL_URL,
    );
  });

  it.each([
    'http://compass.archi-prisma.co.jp/',
    'https://user:pass@compass.archi-prisma.co.jp/',
    'https://compass.archi-prisma.co.jp:8443/',
    'javascript:alert(1)',
    'not a url',
  ])('fails closed for unsafe URL input: %s', (rawUrl) => {
    const prompt = buildCompassConsultPrompt('general', rawUrl);
    expect(prompt).toContain(AI_CONSULT_CANONICAL_URL);
    expect(prompt).not.toContain(rawUrl);
  });

  it('builds a prompt without prices or sensitive URL data', () => {
    const prompt = buildCompassConsultPrompt(
      'excel',
      'https://compass.archi-prisma.co.jp/?email=secret@example.com#project-a',
    );
    expect(prompt).toContain('Excel工程表からの移行');
    expect(prompt).toContain(AI_CONSULT_CANONICAL_URL);
    expect(prompt).toContain('事実、推測、提案を分け');
    expect(prompt).not.toContain('secret@example.com');
    expect(prompt).not.toMatch(/¥|5,000|15,000|35,000/);
  });

  it.each(['chatgpt', 'claude', 'perplexity'] as const)(
    'prefills %s and always returns the complete prompt',
    (providerId) => {
      const target = buildAiConsultTarget(providerId, 'fit');
      expect(new URL(target.href).searchParams.get('q')).toBe(target.prompt);
    },
  );

  it('uses clipboard fallback semantics for Gemini', () => {
    const target = buildAiConsultTarget('gemini', 'general');
    expect(target.href).toBe('https://gemini.google.com/app');
    expect(target.prompt).toContain('COMPASS');
  });

  it('renders one current local icon for every provider', () => {
    for (const provider of AI_PROVIDERS) {
      expect(providerIconSvg(provider.id)).toContain(
        `data-ai-provider-icon="${provider.id}"`,
      );
    }
  });

  it('keeps analytics categorical', () => {
    expect(buildAiConsultAnalyticsEvent('ai_consult_open')).toEqual({
      name: 'ai_consult_open',
      params: { context: 'compass_lp' },
    });
    expect(buildAiConsultAnalyticsEvent(
      'ai_consult_provider_click',
      'claude',
    )).toEqual({
      name: 'ai_consult_provider_click',
      params: { context: 'compass_lp', provider: 'claude' },
    });
  });
});

import { describe, expect, it } from 'vitest';
import { buildCompassFaqStructuredData, COMPASS_FAQ } from './faq';

describe('COMPASS FAQ structured data', () => {
  it('uses the visible FAQ as the JSON-LD source', () => {
    const structured = buildCompassFaqStructuredData();
    expect(structured['@type']).toBe('FAQPage');
    expect(structured.mainEntity).toHaveLength(COMPASS_FAQ.length);
    expect(structured.mainEntity.map((item) => item.name)).toEqual(
      COMPASS_FAQ.map((item) => item.question),
    );
    expect(structured.mainEntity.map((item) => item.acceptedAnswer.text)).toEqual(
      COMPASS_FAQ.map((item) => item.answer),
    );
  });

  it('does not contain the unsupported one-day adoption claim', () => {
    expect(JSON.stringify(COMPASS_FAQ)).not.toContain('多くのお客様は1日');
    expect(JSON.stringify(COMPASS_FAQ)).not.toContain('問題なくお使い');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AiConsultSection } from './AiConsultSection';

describe('AiConsultSection', () => {
  it('renders one broad consultation section with five topics', () => {
    const html = renderToStaticMarkup(<AiConsultSection />);
    expect(html.match(/data-ai-consult-section/g)).toHaveLength(1);
    expect(html.match(/data-ai-consult-topic=/g)).toHaveLength(5);
    expect(html).toContain('COMPASSについてAIに聞く');
    expect(html).toContain('機能や制約について自由に質問したい');
    expect(html).toContain('aria-pressed="true"');
    expect(html.match(/data-ai-consult-selected-indicator/g)).toHaveLength(1);
  });

  it('renders four safe external provider links', () => {
    const html = renderToStaticMarkup(<AiConsultSection />);
    expect(html.match(/data-ai-provider=/g)).toHaveLength(4);
    expect(html.match(/target="_blank"/g)).toHaveLength(4);
    expect(html.match(/rel="noopener noreferrer"/g)).toHaveLength(4);
    expect(html.match(/data-ai-provider-icon=/g)).toHaveLength(4);
    expect(html.match(/data-ai-provider-external-icon/g)).toHaveLength(4);
  });

  it('states the external handoff and confidentiality boundary', () => {
    const html = renderToStaticMarkup(<AiConsultSection />);
    expect(html).toContain('相談文と公開URLが外部AIへ渡ります');
    expect(html).toContain('案件名・顧客名・個人名・非公開工程を入力しないでください');
    expect(html).toContain('LP側は、外部AIで続けた会話を受け取りません。');
    expect(html).toContain('aria-live="polite"');
  });
});

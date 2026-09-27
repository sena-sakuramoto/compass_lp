import { useRef, useState } from 'react';
import {
  AI_CONSULT_TOPICS,
  AI_PROVIDERS,
  buildAiConsultAnalyticsEvent,
  buildAiConsultTarget,
  providerIconSvg,
  type AiConsultAnalyticsEvent,
  type AiConsultTopicId,
  type AiProviderId,
} from '../lib/ai-consult';

type GtagWindow = Window & {
  gtag?: (command: 'event', name: string, params: Record<string, string>) => void;
};

function sendAiConsultAnalytics(event: AiConsultAnalyticsEvent) {
  (window as GtagWindow).gtag?.('event', event.name, event.params);
}

async function copyConsultPrompt(prompt: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(prompt);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = prompt;
    textarea.readOnly = true;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    try {
      textarea.select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }
}

export function AiConsultSection() {
  const [topicId, setTopicId] = useState<AiConsultTopicId>('general');
  const [status, setStatus] = useState('');
  const openedRef = useRef(false);

  function markConsultOpen() {
    if (openedRef.current) return;
    openedRef.current = true;
    sendAiConsultAnalytics(buildAiConsultAnalyticsEvent('ai_consult_open'));
  }

  function handleTopicClick(nextTopicId: AiConsultTopicId) {
    markConsultOpen();
    setTopicId(nextTopicId);
  }

  async function handleProviderClick(providerId: AiProviderId, prompt: string) {
    markConsultOpen();
    sendAiConsultAnalytics(buildAiConsultAnalyticsEvent(
      'ai_consult_provider_click',
      providerId,
    ));
    const copied = await copyConsultPrompt(prompt);
    setStatus(copied
      ? '相談文をコピーしました。必要なら開いたAIへ貼り付けてください。'
      : '相談文をコピーできませんでした。開いたAIで質問を入力してください。');
  }

  return (
    <section
      data-ai-consult-section
      aria-labelledby="ai-consult-heading"
      className="bg-white py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-[var(--lp-ink)] pt-5 sm:pt-6">
          <p className="f-mono text-xs tracking-[0.2em] text-[var(--lp-sub)]">公開情報でAIに相談</p>
          <h2
            id="ai-consult-heading"
            className="f-display mt-3 text-[28px] font-black tracking-tight text-[var(--lp-ink)] sm:text-4xl"
          >
            COMPASSについてAIに聞く
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            気になるテーマを選び、普段使っているAIで相談文を開けます。トライアルやデモの代わりではなく、比較・検討の補助としてご利用ください。
          </p>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#1e3a5f]">相談したいことを選ぶ</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {AI_CONSULT_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  data-ai-consult-topic={topic.id}
                  aria-pressed={topic.id === topicId}
                  onClick={() => handleTopicClick(topic.id)}
                  className={`min-h-11 rounded-[4px] border px-4 py-2 text-left text-sm font-medium transition-colors motion-reduce:transition-none motion-reduce:duration-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4d8] focus-visible:ring-offset-2 ${topic.id === topicId
                    ? 'border-[var(--lp-accent)] bg-white text-[var(--lp-ink)]'
                    : 'border-[var(--lp-rule)] bg-white text-[var(--lp-sub)] hover:border-[var(--lp-ink)]'
                  }`}
                >
                  <span>{topic.label}</span>
                  {topic.id === topicId && (
                    <span
                      data-ai-consult-selected-indicator
                      aria-hidden="true"
                      className="ml-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] bg-[var(--lp-accent)] text-xs text-white"
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-[#1e3a5f]">相談文を開くAIを選ぶ</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {AI_PROVIDERS.map((provider) => {
                const target = buildAiConsultTarget(provider.id, topicId);

                return (
                  <a
                    key={provider.id}
                    data-ai-provider={provider.id}
                    href={target.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleProviderClick(provider.id, target.prompt)}
                    className="min-h-11 flex items-center justify-center gap-2 rounded-[4px] border border-[var(--lp-rule)] bg-white px-3 py-2 text-sm font-semibold text-[var(--lp-ink)] transition-colors motion-reduce:transition-none hover:border-[var(--lp-ink)] hover:bg-[var(--lp-paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4d8] focus-visible:ring-offset-2"
                  >
                    <span
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0"
                      dangerouslySetInnerHTML={{ __html: providerIconSvg(provider.id) }}
                    />
                    <span>{provider.name}</span>
                    <span data-ai-provider-external-icon aria-hidden="true" className="text-base leading-none">↗</span>
                    <span className="sr-only">を新しいタブで開く</span>
                  </a>
                );
              })}
            </div>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-slate-600">
            相談文と公開URLが外部AIへ渡ります。案件名・顧客名・個人名・非公開工程を入力しないでください。
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            LP側は、外部AIで続けた会話を受け取りません。
          </p>
          <p data-ai-consult-status aria-live="polite" className="mt-2 min-h-5 text-sm text-[#1e3a5f]">
            {status}
          </p>
        </div>
      </div>
    </section>
  );
}

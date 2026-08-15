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
      className="border-y border-slate-200 bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-[#1e3a5f]">公開情報でAIに相談</p>
          <h2
            id="ai-consult-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-[#1e3a5f] sm:text-3xl"
          >
            COMPASSについて、まずは公開情報をもとに整理する
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
                  className={`min-h-11 rounded-xl border px-4 py-2 text-left text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4d8] focus-visible:ring-offset-2 ${topic.id === topicId
                    ? 'border-[#00b4d8] bg-white text-[#1e3a5f] shadow-sm'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {topic.label}
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
                    className="min-h-11 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#1e3a5f] transition-colors motion-reduce:transition-none hover:border-[#00b4d8] hover:bg-[#00b4d8]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4d8] focus-visible:ring-offset-2"
                  >
                    <span
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0"
                      dangerouslySetInnerHTML={{ __html: providerIconSvg(provider.id) }}
                    />
                    <span>{provider.name}</span>
                    <span className="sr-only">を新しいタブで開く</span>
                  </a>
                );
              })}
            </div>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-slate-600">
            相談文と公開URLが外部AIへ渡ります。案件名・顧客名・個人名・非公開工程を入力しないでください。
          </p>
          <p data-ai-consult-status aria-live="polite" className="mt-2 min-h-5 text-sm text-[#1e3a5f]">
            {status}
          </p>
        </div>
      </div>
    </section>
  );
}

# COMPASS LP AI Consultation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** COMPASS LPへ幅広い外部AI相談を一箇所だけ追加し、購入導線を維持したまま、根拠不明な効果表現と構造化データを是正する。

**Architecture:** 相談項目、AI提供者、相談文、外部URL、計測イベントを純粋なTypeScriptモジュールへ集約する。
Reactコンポーネントは選択UI、コピー通知、外部リンクだけを担当し、既存の画面紹介と料金の間へ一度だけ配置する。
FAQは一つのデータ定義から画面とJSON-LDを生成し、表示と構造化データのずれを防ぐ。

**Tech Stack:** React 19、TypeScript 5.9、Vite 7、Tailwind CSS 4、Vitest、Playwright

**Spec:** `docs/superpowers/specs/2026-08-15-compass-lp-ai-consult-design.md`

## Global Constraints

- 実行開始時に`superpowers:using-git-worktrees`を使い、現在の未コミット変更から隔離した作業ツリーを作る。
- ベースは設計コミット`471e5a2`を含む現在の`main`とし、実装ブランチ名は`codex/compass-lp-ai-consult`とする。
- 既存の`public/archiprisma_dev logo.png`、`src/index.css`、`src/pages/LegalPage.tsx`の未コミット変更を取り込まない。
- AI相談は画面紹介の後、料金の前に一度だけ表示する。
- フローティングAI相談、ヒーロー内AI相談、料金カード内AI相談は追加しない。
- 無料トライアルを主CTA、デモを第2CTA、AI相談を判断支援として扱う。
- LP上に会社名、案件名、メールアドレス、工程データの入力欄を追加しない。
- 外部AIへ渡すURLは`https://compass.archi-prisma.co.jp/`へ固定し、クエリ文字列とハッシュを含めない。
- 計測へ相談文、本文、URL、個人情報を送らない。
- 根拠を確認できない効果数値、利用者像、評価を別の断定表現へ置き換えない。
- `D:\senaa_dev\archi-prisma-site`は変更せず、既存の診断条件付きCOMPASS推薦を維持する。
- 公開デプロイはこの計画に含めない。

## File Structure

- Create: `src/lib/ai-consult.ts`
  - 相談項目、提供者、相談文、正規URL、外部URL、計測イベントを定義する。
- Create: `src/lib/ai-consult.test.ts`
  - 許可リスト、URL正規化、相談文、提供者URL、計測ペイロードを検証する。
- Create: `src/components/AiConsultSection.tsx`
  - インラインUI、相談項目選択、コピー通知、外部AIリンクを描画する。
- Create: `src/components/AiConsultSection.test.tsx`
  - サーバーレンダリングで構造、初期選択、四提供者、外部リンク属性を検証する。
- Create: `src/content/faq.ts`
  - 表示FAQとFAQPage JSON-LDの単一データ源を提供する。
- Create: `src/content/faq.test.ts`
  - 表示用データとJSON-LDの一致を検証する。
- Create: `src/lib/marketing-claims.test.ts`
  - 根拠不明な効果数値、定着表現、評価、旧価格が残らないことを検証する。
- Create: `playwright.config.ts`
  - ローカルLPを起動し、Chromiumでデスクトップとモバイルを検証する。
- Create: `tests/ai-consult.e2e.ts`
  - 配置、レスポンシブ、コピー、外部タブ、計測、CTA非干渉を検証する。
- Modify: `src/App.tsx`
  - AI相談セクションを配置し、FAQを単一データ源へ移し、根拠不明な表現を是正する。
- Modify: `index.html`
  - 不一致のOffer、AggregateRating、重複FAQPageを削除する。
- Modify: `package.json`
  - VitestとPlaywrightの検証コマンドを追加する。
- Modify: `package-lock.json`
  - 新しい開発依存を固定する。

---

### Task 1: AI相談の純粋な引き渡し契約

**Files:**
- Create: `src/lib/ai-consult.ts`
- Create: `src/lib/ai-consult.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `AiConsultTopicId`、`AiProviderId`、`AI_CONSULT_TOPICS`、`AI_PROVIDERS`
- Produces: `AiConsultEventName`、`AiConsultAnalyticsEvent`
- Produces: `resolveAiConsultTopic(value: unknown): AiConsultTopicId`
- Produces: `normalizeCompassPublicUrl(rawUrl?: string): string`
- Produces: `buildCompassConsultPrompt(topicId: unknown, rawUrl?: string): string`
- Produces: `buildAiConsultTarget(providerId: AiProviderId, topicId: unknown, rawUrl?: string): AiConsultTarget`
- Produces: `buildAiConsultAnalyticsEvent(name: AiConsultEventName, providerId?: AiProviderId): AiConsultAnalyticsEvent`
- Produces: `providerIconSvg(providerId: AiProviderId): string`

- [ ] **Step 1: 隔離作業ツリーを作る**

`superpowers:using-git-worktrees`を呼び出し、`codex/compass-lp-ai-consult`を新しい作業ツリーへ作る。

作成後に次を実行する。

```powershell
git status --short --branch
git log -2 --oneline
```

Expected: 作業ツリーがクリーンで、履歴に`471e5a2 docs: design COMPASS LP AI consultation flow`がある。

- [ ] **Step 2: テスト依存とコマンドを追加する**

Run:

```powershell
npm install --save-dev vitest @playwright/test
npx playwright install chromium
```

`package.json`の`scripts`へ次を追加する。

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

- [ ] **Step 3: 失敗する契約テストを書く**

`src/lib/ai-consult.test.ts`を次の構造で作る。

```ts
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
```

- [ ] **Step 4: テストが対象モジュール未実装で失敗することを確認する**

Run:

```powershell
npm test -- src/lib/ai-consult.test.ts
```

Expected: FAIL with `Cannot find module './ai-consult'`。

- [ ] **Step 5: 最小の引き渡しモジュールを実装する**

`src/lib/ai-consult.ts`へ次の型と定義を作る。

```ts
export const AI_CONSULT_CANONICAL_URL = 'https://compass.archi-prisma.co.jp/';

export type AiConsultTopicId =
  | 'general'
  | 'fit'
  | 'excel'
  | 'pricing'
  | 'onboarding';

export type AiProviderId = 'chatgpt' | 'gemini' | 'claude' | 'perplexity';

export type AiConsultTarget = {
  id: AiProviderId;
  name: string;
  href: string;
  prompt: string;
};

export const AI_CONSULT_TOPICS = [
  { id: 'general', label: '機能や制約について自由に質問したい', request: '最初に、COMPASSについて知りたいことを私に尋ねてください。' },
  { id: 'fit', label: '自社の工程管理に合うか', request: '会社や案件を特定しない範囲で、現在の工程管理方法、利用人数、困りごとを質問し、合う点と合わない可能性を整理してください。' },
  { id: 'excel', label: 'Excel工程表から移行できるか', request: 'Excel工程表からの移行について、準備する項目、移行手順、確認点、戻せる範囲を整理してください。' },
  { id: 'pricing', label: '料金とプランを比較したい', request: '公開ページの最新料金を確認し、利用人数ごとの選択肢と契約前に確認すべき条件を整理してください。金額はページに明記されたものだけを使ってください。' },
  { id: 'onboarding', label: '導入手順を整理したい', request: '機密情報を使わず、デモ、トライアル、最初の案件登録、チーム共有までの小さな導入手順を整理してください。' },
] as const satisfies ReadonlyArray<{
  id: AiConsultTopicId;
  label: string;
  request: string;
}>;

export const AI_PROVIDERS = [
  { id: 'chatgpt', name: 'ChatGPT', baseUrl: 'https://chatgpt.com/', promptParam: 'q' },
  { id: 'gemini', name: 'Gemini', baseUrl: 'https://gemini.google.com/app', promptParam: null },
  { id: 'claude', name: 'Claude', baseUrl: 'https://claude.ai/new', promptParam: 'q' },
  { id: 'perplexity', name: 'Perplexity', baseUrl: 'https://www.perplexity.ai/search', promptParam: 'q' },
] as const;
```

`resolveAiConsultTopic`は、`AI_CONSULT_TOPICS`に存在しない値を`general`へ戻す。

`normalizeCompassPublicUrl`は入力を`URL`として解析し、HTTPS、ホスト、資格情報、ポートを確認する。
許可条件を満たしてもクエリ文字列とハッシュを削除し、常に`AI_CONSULT_CANONICAL_URL`を返す。

```ts
export function resolveAiConsultTopic(value: unknown): AiConsultTopicId {
  return AI_CONSULT_TOPICS.some((topic) => topic.id === value)
    ? value as AiConsultTopicId
    : 'general';
}

export function normalizeCompassPublicUrl(rawUrl = AI_CONSULT_CANONICAL_URL): string {
  try {
    const url = new URL(rawUrl);
    const allowed = url.protocol === 'https:'
      && url.hostname === 'compass.archi-prisma.co.jp'
      && !url.username
      && !url.password
      && !url.port;
    if (!allowed) return AI_CONSULT_CANONICAL_URL;
  } catch {
    return AI_CONSULT_CANONICAL_URL;
  }
  return AI_CONSULT_CANONICAL_URL;
}
```

`buildCompassConsultPrompt`は次の共通本文と、選択した`request`を結合する。

```text
建築・施工の工程管理ツール「COMPASS」について相談します。

公開ページ: https://compass.archi-prisma.co.jp/
相談テーマ: {topic.label}

{topic.request}

公開ページを確認し、ページに書かれている事実、そこからの推測、提案を分けて日本語で回答してください。
ページにない効果、数値、導入実績、契約条件は断定しないでください。
回答に必要なら、最初に確認質問を最大3つだけしてください。
案件名、顧客名、個人名、非公開の工程は尋ねず、入力しないよう案内してください。
```

```ts
export function buildCompassConsultPrompt(
  topicId: unknown,
  rawUrl = AI_CONSULT_CANONICAL_URL,
): string {
  const topic = AI_CONSULT_TOPICS.find(
    (item) => item.id === resolveAiConsultTopic(topicId),
  ) ?? AI_CONSULT_TOPICS[0];
  const pageUrl = normalizeCompassPublicUrl(rawUrl);

  return `建築・施工の工程管理ツール「COMPASS」について相談します。

公開ページ: ${pageUrl}
相談テーマ: ${topic.label}

${topic.request}

公開ページを確認し、ページに書かれている事実、そこからの推測、提案を分けて日本語で回答してください。
ページにない効果、数値、導入実績、契約条件は断定しないでください。
回答に必要なら、最初に確認質問を最大3つだけしてください。
案件名、顧客名、個人名、非公開の工程は尋ねず、入力しないよう案内してください。`;
}
```

`buildAiConsultTarget`は提供者を一つ選び、`promptParam`がある提供者だけ`q`へ完全な相談文を設定する。
未知の提供者IDは型で受け付けない。

```ts
export function buildAiConsultTarget(
  providerId: AiProviderId,
  topicId: unknown,
  rawUrl = AI_CONSULT_CANONICAL_URL,
): AiConsultTarget {
  const provider = AI_PROVIDERS.find((item) => item.id === providerId);
  if (!provider) throw new Error(`Unsupported AI provider: ${providerId}`);

  const prompt = buildCompassConsultPrompt(topicId, rawUrl);
  const targetUrl = new URL(provider.baseUrl);
  if (provider.promptParam) targetUrl.searchParams.set(provider.promptParam, prompt);

  return { id: provider.id, name: provider.name, href: targetUrl.toString(), prompt };
}
```

`buildAiConsultAnalyticsEvent`は次の判別共用体だけを返す。

```ts
export type AiConsultAnalyticsEvent =
  | { name: 'ai_consult_open'; params: { context: 'compass_lp' } }
  | {
      name: 'ai_consult_provider_click';
      params: { context: 'compass_lp'; provider: AiProviderId };
    };

export type AiConsultEventName = AiConsultAnalyticsEvent['name'];
```

```ts
export function buildAiConsultAnalyticsEvent(
  name: AiConsultEventName,
  providerId?: AiProviderId,
): AiConsultAnalyticsEvent {
  if (name === 'ai_consult_provider_click') {
    if (!providerId) throw new Error('providerId is required');
    return {
      name,
      params: { context: 'compass_lp', provider: providerId },
    };
  }
  return { name, params: { context: 'compass_lp' } };
}
```

`providerIconSvg`の四つのSVGパスとブランド色は、現在のローカル実装`D:\senaa_dev\archi-prisma-site\src\lib\ai-consult.ts`にある`AI_PROVIDER_ICON_PATHS`と`providerIconSvg`をそのまま移植する。
外部画像URLへ置き換えない。

- [ ] **Step 6: 契約テストを通す**

Run:

```powershell
npm test -- src/lib/ai-consult.test.ts
```

Expected: 10 tests PASS。

- [ ] **Step 7: 型検査とLintを通す**

Run:

```powershell
npm run build
npm run lint
```

Expected: both exit 0。

- [ ] **Step 8: Task 1をコミットする**

```powershell
git add package.json package-lock.json src/lib/ai-consult.ts src/lib/ai-consult.test.ts
git commit -m "feat: add COMPASS AI consultation contract"
```

---

### Task 2: インラインAI相談セクション

**Files:**
- Create: `src/components/AiConsultSection.tsx`
- Create: `src/components/AiConsultSection.test.tsx`
- Create: `playwright.config.ts`
- Create: `tests/ai-consult.e2e.ts`
- Modify: `src/App.tsx:1-20`
- Modify: `src/App.tsx:1317-1322`

**Interfaces:**
- Consumes: `AI_CONSULT_TOPICS`、`AI_PROVIDERS`、`buildAiConsultTarget`、`buildAiConsultAnalyticsEvent`、`providerIconSvg`
- Produces: `AiConsultSection(): JSX.Element`
- Produces DOM: `[data-ai-consult-section]`、`[data-ai-consult-topic]`、`[data-ai-provider]`、`[data-ai-consult-status]`

- [ ] **Step 1: 失敗するコンポーネントテストを書く**

`src/components/AiConsultSection.test.tsx`を作る。

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AiConsultSection } from './AiConsultSection';

describe('AiConsultSection', () => {
  it('renders one broad consultation section with five topics', () => {
    const html = renderToStaticMarkup(<AiConsultSection />);
    expect(html.match(/data-ai-consult-section/g)).toHaveLength(1);
    expect(html.match(/data-ai-consult-topic=/g)).toHaveLength(5);
    expect(html).toContain('機能や制約について自由に質問したい');
    expect(html).toContain('aria-pressed="true"');
  });

  it('renders four safe external provider links', () => {
    const html = renderToStaticMarkup(<AiConsultSection />);
    expect(html.match(/data-ai-provider=/g)).toHaveLength(4);
    expect(html.match(/target="_blank"/g)).toHaveLength(4);
    expect(html.match(/rel="noopener noreferrer"/g)).toHaveLength(4);
    expect(html.match(/data-ai-provider-icon=/g)).toHaveLength(4);
  });

  it('states the external handoff and confidentiality boundary', () => {
    const html = renderToStaticMarkup(<AiConsultSection />);
    expect(html).toContain('相談文と公開URLが外部AIへ渡ります');
    expect(html).toContain('案件名・顧客名・個人名・非公開工程を入力しないでください');
    expect(html).toContain('aria-live="polite"');
  });
});
```

- [ ] **Step 2: コンポーネント未実装で失敗することを確認する**

Run:

```powershell
npm test -- src/components/AiConsultSection.test.tsx
```

Expected: FAIL with `Cannot find module './AiConsultSection'`。

- [ ] **Step 3: コンポーネントを最小実装する**

`src/components/AiConsultSection.tsx`は、`general`を初期値にする`useState<AiConsultTopicId>`と、一ページ表示につき一度だけopenイベントを送る`useRef(false)`を持つ。

コンポーネント内の計測関数は次の形にする。

```ts
type GtagWindow = Window & {
  gtag?: (command: 'event', name: string, params: Record<string, string>) => void;
};

function sendAiConsultAnalytics(event: AiConsultAnalyticsEvent) {
  (window as GtagWindow).gtag?.('event', event.name, event.params);
}
```

最初の相談項目操作または提供者操作でだけ`ai_consult_open`を送る。
セクションが画面内へ入っただけでは送らない。

```ts
function markConsultOpen() {
  if (openedRef.current) return;
  openedRef.current = true;
  sendAiConsultAnalytics(buildAiConsultAnalyticsEvent('ai_consult_open'));
}
```

コピー関数はClipboard APIを先に使い、失敗時は一時的な`textarea`と`document.execCommand('copy')`を使う。
一時要素は`finally`で必ず削除する。

```ts
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
```

提供者は`<a>`として描画し、`href`、`target="_blank"`、`rel="noopener noreferrer"`を最初から持たせる。
クリックでは`preventDefault`を呼ばず、コピー失敗時も外部タブを開く。

```ts
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
```

```tsx
<a
  data-ai-provider={provider.id}
  href={target.href}
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => handleProviderClick(provider.id, target.prompt)}
>
  <span
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: providerIconSvg(provider.id) }}
  />
  <span>{provider.name}</span>
  <span className="sr-only">を新しいタブで開く</span>
</a>
```

状態通知は次の二種類に限定する。

- 成功：`相談文をコピーしました。必要なら開いたAIへ貼り付けてください。`
- 失敗：`相談文をコピーできませんでした。開いたAIで質問を入力してください。`

スタイルはTailwindクラスだけで完結させ、既存差分がある`src/index.css`を変更しない。
相談項目と提供者リンクは`min-h-11`を使い、44ピクセル以上を確保する。
`transition-all`は使わず、`transition-colors`または`transition-transform`へ限定する。
相談項目と提供者リンクへ`focus-visible:ring-2`と`focus-visible:ring-offset-2`を付ける。
AI相談セクションには連続アニメーションを追加せず、状態変化のクラスへ`motion-reduce:transition-none`を付ける。

- [ ] **Step 4: コンポーネントテストを通す**

Run:

```powershell
npm test -- src/components/AiConsultSection.test.tsx src/lib/ai-consult.test.ts
```

Expected: 13 tests PASS。

- [ ] **Step 5: Playwright設定と失敗する配置テストを書く**

`playwright.config.ts`を次の設定で作る。

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4174',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
  },
});
```

`tests/ai-consult.e2e.ts`へ、320、390、768、1440ピクセルの四つを`test.describe`で定義する。
各幅で次を検証する。

```ts
import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1440, height: 1000 },
] as const;

for (const viewport of VIEWPORTS) {
  test(`AI consultation layout at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('[data-ai-consult-section]')).toHaveCount(1);
    await expect(page.locator('[data-ai-consult-topic]')).toHaveCount(5);
    await expect(page.locator('[data-ai-provider]')).toHaveCount(4);
    await expect(page.locator('[data-ai-provider-icon]')).toHaveCount(4);
    await expect(page.getByRole('button', { name: '14日間無料で試す' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'デモを試す' }).first()).toBeVisible();
    expect(await page.evaluate(() => (
      document.documentElement.scrollWidth <= window.innerWidth
    ))).toBe(true);
  });
}
```

配置順は次で検証する。

```ts
const order = await page.evaluate(() => {
  const screenHeading = Array.from(document.querySelectorAll('h2')).find(
    (heading) => heading.textContent?.includes('実際の画面'),
  );
  const screenSection = screenHeading?.closest('section');
  const consult = document.querySelector('[data-ai-consult-section]');
  const pricing = document.querySelector('#pricing');
  return Boolean(
    screenSection
    && consult
    && pricing
    && (screenSection.compareDocumentPosition(consult) & Node.DOCUMENT_POSITION_FOLLOWING)
    && (consult.compareDocumentPosition(pricing) & Node.DOCUMENT_POSITION_FOLLOWING),
  );
});
expect(order).toBe(true);
```

ヘッダー、ヒーロー、料金、最終CTAの既存文言を検証し、AI相談がそれらへ複製されていないことを確認する。

- [ ] **Step 6: 配置前のE2Eテストが失敗することを確認する**

Run:

```powershell
npm run test:e2e -- tests/ai-consult.e2e.ts
```

Expected: FAIL because `[data-ai-consult-section]` count is 0。

- [ ] **Step 7: Appへ一度だけ配置する**

`src/App.tsx`へ次を追加する。

```tsx
import { AiConsultSection } from './components/AiConsultSection';
```

画面紹介セクションの閉じタグ直後、`PRICING SECTION`コメントの直前へ次を置く。

```tsx
<AiConsultSection />
```

ヒーロー、料金カード、最終CTAは変更しない。

- [ ] **Step 8: E2Eテストを通す**

Run:

```powershell
npm run test:e2e -- tests/ai-consult.e2e.ts
```

Expected: four viewport cases PASS。

- [ ] **Step 9: Task 2をコミットする**

```powershell
git add playwright.config.ts tests/ai-consult.e2e.ts src/App.tsx src/components/AiConsultSection.tsx src/components/AiConsultSection.test.tsx
git commit -m "feat: add inline COMPASS AI consultation"
```

---

### Task 3: LPの事実性と構造化データ

**Files:**
- Create: `src/content/faq.ts`
- Create: `src/content/faq.test.ts`
- Create: `src/lib/marketing-claims.test.ts`
- Modify: `src/App.tsx:963-1115`
- Modify: `src/App.tsx:1657-1717`
- Modify: `index.html:38-108`

**Interfaces:**
- Produces: `COMPASS_FAQ: readonly CompassFaqItem[]`
- Produces: `buildCompassFaqStructuredData(): FaqStructuredData`
- Consumes: `COMPASS_FAQ` in the visible FAQ renderer

- [ ] **Step 1: 根拠不明表現を検出する失敗テストを書く**

`src/lib/marketing-claims.test.ts`を作る。

```ts
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
```

- [ ] **Step 2: FAQの単一データ源を要求する失敗テストを書く**

`src/content/faq.test.ts`を作る。

```ts
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
```

- [ ] **Step 3: テストが既存表現とFAQ未実装で失敗することを確認する**

Run:

```powershell
npm test -- src/lib/marketing-claims.test.ts src/content/faq.test.ts
```

Expected: FAIL for the prohibited claims and missing `./faq`。

- [ ] **Step 4: FAQの単一データ源を実装する**

`src/content/faq.ts`へ`COMPASS_FAQ`を作る。
質問は現在の六問を維持し、次の回答へそろえる。

```ts
export const COMPASS_FAQ = [
  {
    question: '導入にどれくらい時間がかかりますか？',
    answer: 'アカウント作成後から利用できます。既存のExcel工程表を移行する場合は、項目と担当者名を整理してからインポートしてください。実際の運用開始時期は、案件数と社内の確認手順によって変わります。',
  },
  {
    question: 'ITに詳しくないスタッフでも使えますか？',
    answer: '主要な操作を絞った画面構成です。導入前にデモで、工程の確認、タスク更新、メンバー共有が現場の運用に合うか確認してください。',
  },
  {
    question: 'スマートフォンからも使えますか？',
    answer: 'iOSとAndroidのブラウザから利用できます。対応する操作は、導入前にデモとヘルプで確認してください。',
  },
  {
    question: '途中でプランを変更できますか？',
    answer: 'Small、Standard、Businessの変更条件は、利用人数と契約状態によって異なります。変更前に最新の料金表示と契約画面を確認してください。',
  },
  {
    question: 'データのセキュリティは大丈夫ですか？',
    answer: '公開ページとアプリへの通信にはHTTPSを使用しています。データの保存地域、バックアップ、権限設定の詳細は、導入前にcompass@archi-prisma.co.jpへ確認してください。',
  },
  {
    question: '無料トライアル後、自動で課金されますか？',
    answer: 'トライアル開始時に表示される契約条件と支払画面を確認してください。継続しない場合の手続きと期限は、申込前に確認できます。',
  },
] as const;
```

`buildCompassFaqStructuredData`は、`COMPASS_FAQ`を`Question`と`Answer`へ写像する。

```ts
export function buildCompassFaqStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: COMPASS_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } as const;
}
```

- [ ] **Step 5: AppのFAQを単一データ源へ切り替える**

`src/App.tsx`へ次を追加する。

```ts
import { buildCompassFaqStructuredData, COMPASS_FAQ } from './content/faq';
```

ルート断片の先頭で次を描画する。

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(buildCompassFaqStructuredData()),
  }}
/>
```

FAQセクションのインライン配列を削除し、`COMPASS_FAQ.map((faq, i) => ...)`へ変更する。
表示側では`faq.question`と`faq.answer`を使う。

- [ ] **Step 6: 効果数値と定着表現を是正する**

`src/App.tsx:963-1008`の`STATS - RESULTS`セクションを削除する。

比較リストと説明カードは、次の確認可能な表現へ置き換える。

```ts
[
  '必要な操作を画面内で確認できる',
  '工程、担当、締切を同じ場所で扱える',
  'デモで主要操作を登録前に確認できる',
  'スマートフォンのブラウザから工程を確認できる',
  '進捗更新をタスク単位で記録できる',
]
```

三つの説明カードは次へ変更する。

```ts
[
  {
    title: '迷いにくい画面設計',
    description: '工程、担当、締切、進捗を同じ画面で確認できるよう、主要操作をまとめています。',
  },
  {
    title: '導入前にデモで確認',
    description: '登録前にサンプルデータで操作し、現場の手順に合うか確認できます。',
  },
  {
    title: '現場と設計室で共有',
    description: 'ブラウザから同じ工程とタスクを確認し、更新内容を共有できます。',
  },
]
```

見出し「数字で見るCompass」はセクションとともに削除する。

- [ ] **Step 7: index.htmlの構造化データを是正する**

`SoftwareApplication`から`offers`と`aggregateRating`を削除する。

静的な`FAQPage`ブロック全体を削除する。
FAQPageは`COMPASS_FAQ`からReactが一度だけ描画する。

`SoftwareApplication`の名称、説明、URL、カテゴリ、対応OS、publisherは残す。
`Organization`ブロックも残す。

`#root`の直後へ次の`noscript`フォールバックを追加する。

```html
<noscript>
  <main style="max-width:720px;margin:64px auto;padding:24px;font-family:sans-serif;color:#1e3a5f">
    <h1>COMPASS</h1>
    <p>COMPASSは建築と施工の工程管理ツールです。このページの詳細表示と申込にはJavaScriptが必要です。</p>
    <p><a href="https://compass-demo.web.app/">デモを試す</a></p>
    <p><a href="mailto:compass@archi-prisma.co.jp?subject=COMPASS%2014%E6%97%A5%E9%96%93%E7%84%A1%E6%96%99%E3%83%88%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%AB">14日間無料トライアルについて問い合わせる</a></p>
    <p><a href="mailto:compass@archi-prisma.co.jp?subject=COMPASS%20%E6%96%99%E9%87%91%E7%A2%BA%E8%AA%8D">最新料金を確認する</a></p>
    <p><a href="mailto:compass@archi-prisma.co.jp">その他の問い合わせ</a></p>
  </main>
</noscript>
```

価格を静的に複製しない。
JavaScript無効時の料金確認はメール導線へ限定し、古い金額を表示しない。

- [ ] **Step 8: 事実性テストと全ユニットテストを通す**

Run:

```powershell
npm test
```

Expected: all test files PASS。

- [ ] **Step 9: ビルド成果物を確認する**

Run:

```powershell
npm run build
$forbiddenMatches = rg -n '工数削減|情報共有の改善|週あたりの会議削減|継続利用率|AggregateRating|ratingValue|ratingCount|"price":"1000"' dist
if ($LASTEXITCODE -eq 0) { $forbiddenMatches; throw 'Forbidden public claims remain in dist' }
if ($LASTEXITCODE -ne 1) { throw 'rg failed while checking dist' }
```

Expected: build exit 0 and `rg` returns no matches。

- [ ] **Step 10: Task 3をコミットする**

```powershell
git add src/App.tsx src/content/faq.ts src/content/faq.test.ts src/lib/marketing-claims.test.ts index.html
git commit -m "fix: align COMPASS LP claims with verified facts"
```

---

### Task 4: 敵対的ブラウザ検証と最終回帰

**Files:**
- Modify only if a verification failure requires a scoped fix.
- Evidence: keep screenshots and traces under Playwright's ignored output directory; do not commit them.

**Interfaces:**
- Consumes: completed LP, AI consultation contract, FAQ data, existing signup and Enterprise modals
- Produces: verified local implementation ready for a separate publication decision

- [ ] **Step 1: 外部URLと機密クエリの敵対的ユニットケースを追加する**

`src/lib/ai-consult.test.ts`へ次を追加する。

```ts
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
```

- [ ] **Step 2: 計測とコピーをE2Eで検証する**

`tests/ai-consult.e2e.ts`へ一つのデスクトップケースを追加する。

テスト開始前にGoogle Tag Managerへの通信を遮断し、Clipboard権限を付与する。

```ts
await context.grantPermissions(['clipboard-read', 'clipboard-write']);
await page.route('https://www.googletagmanager.com/**', (route) => route.abort());
await page.goto('/');
```

「Excel工程表から移行できるか」を選び、ChatGPTリンクをクリックする。
ポップアップURLのホストが`chatgpt.com`であること、元のページがCOMPASS LPに残ること、クリップボードに相談テーマと正規URLがあることを確認する。

`window.dataLayer`から`ai_consult_open`が一度、`ai_consult_provider_click`が一度だけ送られたことを確認する。
イベント引数をJSON化し、メール、相談文、公開URLが含まれないことを確認する。

- [ ] **Step 3: クリップボード拒否でも外部タブが開くことを確認する**

Clipboard権限を付与しない新しいBrowserContextでLPを開く。
Perplexityリンクをクリックし、ポップアップが作成されることを確認する。

元のLPで次のどちらかの通知が表示されることを確認する。

- `相談文をコピーしました。必要なら開いたAIへ貼り付けてください。`
- `相談文をコピーできませんでした。開いたAIで質問を入力してください。`

コピー成否にかかわらず外部タブが開くことが合格条件である。

- [ ] **Step 4: signupとEnterpriseモーダルの非干渉を確認する**

料金セクションでSmallの「14日間無料で始める」を押す。
signupモーダルがAI相談セクションより前面に表示され、AI相談が固定表示されていないことを確認する。

モーダルを閉じ、Enterprise相談フォームでも同じことを確認する。

- [ ] **Step 5: キーボード、軽減モーション、JavaScript無効時を確認する**

`tests/ai-consult.e2e.ts`へ次の三ケースを追加する。

キーボードでは、最初の相談項目へフォーカスしてEnterを押し、`aria-pressed="true"`へ変わることを確認する。
Tabで四つの提供者リンクへ順に到達できることも確認する。

```ts
await page.locator('[data-ai-consult-topic="fit"]').focus();
await page.keyboard.press('Enter');
await expect(page.locator('[data-ai-consult-topic="fit"]')).toHaveAttribute('aria-pressed', 'true');
```

軽減モーションでは、相談項目の状態変化にトランジションが残らないことを確認する。

```ts
await page.emulateMedia({ reducedMotion: 'reduce' });
const duration = await page.locator('[data-ai-consult-topic]').first().evaluate(
  (element) => getComputedStyle(element).transitionDuration,
);
expect(duration).toBe('0s');
```

JavaScript無効時は新しいBrowserContextを作り、四つの静的導線を確認する。

```ts
const noJsContext = await browser.newContext({ javaScriptEnabled: false });
const noJsPage = await noJsContext.newPage();
await noJsPage.goto('/');
await expect(noJsPage.getByRole('link', { name: 'デモを試す' })).toBeVisible();
await expect(noJsPage.getByRole('link', { name: '14日間無料トライアルについて問い合わせる' })).toBeVisible();
await expect(noJsPage.getByRole('link', { name: '最新料金を確認する' })).toBeVisible();
await expect(noJsPage.getByRole('link', { name: 'その他の問い合わせ' })).toBeVisible();
await noJsContext.close();
```

通常表示では、`FAQPage`を含む`script[type="application/ld+json"]`が一つだけ存在することを確認する。

- [ ] **Step 6: 全検証を新しく実行する**

Run:

```powershell
npm test
npm run lint
npm run build
npm run test:e2e
```

Expected: all commands exit 0 with no skipped project checks。

- [ ] **Step 7: 変更範囲と禁止事項を確認する**

Run:

```powershell
git diff --check
git status --short
git diff --stat main...HEAD
git diff --name-only main...HEAD
```

Expected files are limited to:

```text
index.html
package.json
package-lock.json
playwright.config.ts
src/App.tsx
src/components/AiConsultSection.tsx
src/components/AiConsultSection.test.tsx
src/content/faq.ts
src/content/faq.test.ts
src/lib/ai-consult.ts
src/lib/ai-consult.test.ts
src/lib/marketing-claims.test.ts
tests/ai-consult.e2e.ts
```

既存の`src/index.css`、`src/pages/LegalPage.tsx`、ロゴ画像が含まれていた場合は停止し、取り込んだ経路を調べる。

- [ ] **Step 8: 敵対的レビュー修正だけをコミットする**

Step 1からStep 4で修正が発生した場合だけ、対象ファイルを個別に追加する。

```powershell
git add index.html src/App.tsx src/content/faq.ts src/content/faq.test.ts src/lib/marketing-claims.test.ts src/lib/ai-consult.ts src/lib/ai-consult.test.ts src/components/AiConsultSection.tsx src/components/AiConsultSection.test.tsx tests/ai-consult.e2e.ts
git commit -m "test: harden COMPASS AI consultation handoff"
```

修正がなければ空コミットを作らない。

- [ ] **Step 9: 公開境界を報告する**

ローカル実装、テスト数、ビルド、四つの表示幅、外部AIリンク、コピー拒否、CTA非干渉の結果を報告する。

公開デプロイ、外部AIの本番事前入力、本番トラフィックへの影響は未実施として明記する。
ユーザーが明示的に公開を承認するまで`npm run deploy`を実行しない。

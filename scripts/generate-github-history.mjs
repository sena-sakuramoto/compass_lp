import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const REPO_WEB_URL = process.env.COMPASS_UPDATES_REPO_WEB_URL || 'https://github.com/sena-sakuramoto/compass';
const REPO_GIT_URL = process.env.COMPASS_UPDATES_REPO_GIT_URL || 'https://github.com/sena-sakuramoto/compass.git';
const LOCAL_REPO_CANDIDATES = [
  process.env.COMPASS_UPDATES_REPO_PATH,
  'D:\\senaa_dev\\compass',
  resolve(process.cwd(), '..', 'compass'),
].filter(Boolean);
const SOURCE_REF = process.env.COMPASS_UPDATES_REF || 'origin/main';
const OUTPUT_PATH = resolve(process.cwd(), 'src/generated/githubHistory.ts');
const HISTORY_LIMIT = 120;
const OUTPUT_LIMIT = 14;
const FIELD_SEPARATOR = '\u001f';
const RECORD_SEPARATOR = '\u001e';

function run(command, cwd) {
  return execSync(command, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function resolveSourceRepo() {
  for (const candidate of LOCAL_REPO_CANDIDATES) {
    if (candidate && existsSync(join(candidate, '.git'))) {
      return { cwd: candidate, cleanup: null };
    }
  }

  const tempDir = mkdtempSync(join(tmpdir(), 'compass-updates-'));
  run(`git clone --depth ${HISTORY_LIMIT} --branch main ${REPO_GIT_URL} "${tempDir}"`, process.cwd());
  return { cwd: tempDir, cleanup: null };
}

function runGitLog(repoCwd) {
  const format = ['%H', '%cI', '%s', '%b'].join(FIELD_SEPARATOR) + RECORD_SEPARATOR;
  return run(`git log ${SOURCE_REF} -n ${HISTORY_LIMIT} --date=iso-strict --pretty=format:"${format}"`, repoCwd);
}

function inferCategory(subject) {
  const normalized = subject.toLowerCase();

  if (normalized.startsWith('feat')) return '新機能';
  if (normalized.startsWith('fix')) return '改善';
  if (normalized.startsWith('style')) return '改善';
  if (normalized.startsWith('layout')) return '改善';
  if (normalized.startsWith('responsive')) return '改善';
  if (normalized.startsWith('enhance')) return '改善';
  if (normalized.startsWith('update')) return 'お知らせ';
  if (normalized.startsWith('revert')) return 'お知らせ';
  if (normalized.includes('seo')) return '改善';

  return 'お知らせ';
}

function isImportantCommit(subject) {
  const normalized = subject.toLowerCase();

  const alwaysInclude = [
    /feat: update routes and layout for new mobile navigation/,
    /feat: add work hours setting for timeline/,
    /feat: simplify task edit modal on mobile with 3-section layout/,
    /feat\(today\): integrate todayview into app\.tsx, remove old mobile rendering/,
    /feat\(today\): auto-scroll to now line, empty tray state, overdue styling/,
    /feat: feedback firestore user lookup, admin task edit bypass, remove legacy gcal/,
    /feat: replace file picker with auto screenshot capture in feedback/,
    /feat: calendar selector, google access for all, feedback sidebar with screenshot, error prompt/,
    /feat: ball management, ai stage generation, ai billing limits, calendar sync/,
    /feat: mcp\/gpt server-side validation, bulk import pj creation, oauth improvements/,
    /feat: add claude sonnet support to bulk import/,
    /feat\(web\): add local llm support via webgpu \+ transformers\.js/,
    /feat: google drive\/chat連携機能を追加/,
    /feat: 打合せ機能追加/,
    /feat: 請求・メンバー管理機能強化/,
    /feat: compass単独サブスク用checkout api追加/,
    /feat: add cross-org access and admin impersonation/,
    /feat: complete type-based stage\/task architecture/,
    /feat: implement stage-based gantt chart with progress charge visualization/,
    /feat: ガントチャート機能改善/,
    /feat: ガントチャートのスクロール同期修正と機能追加/,
    /feat: 認証・課金管理・メンバー管理機能の追加/,
    /feat: add project invitation notifications and various improvements/,
    /feat: add task type migration api and improve gantt chart/,
    /feat: implement stage toggle and fix gantt chart alignment/,
    /feat: add project member management and invitation system/,
    /feat: redesign task period input ui with visual timeline/,
    /feat: align gantt chart with japanese construction industry standards/,
  ];

  const exclude = [
    /^docs:/i,
    /^wip:/i,
    /^chore:/i,
    /^debug:/i,
    /^refactor:/i,
    /未使用/,
    /下揃え/,
    /レイアウト崩れ/,
    /ヘッダーを小さく調整/,
    /add BottomSheet/i,
    /add DateHeader/i,
    /add BottomNavBar/i,
    /add SettingsMenuPage/i,
    /add TimelineCard/i,
    /add QuickAddSheet/i,
    /add FeedbackBar/i,
    /pure timeline placement/i,
  ];

  if (exclude.some((pattern) => pattern.test(subject))) {
    return false;
  }

  return alwaysInclude.some((pattern) => pattern.test(normalized) || pattern.test(subject));
}

function cleanText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function stripCommitPrefix(subject) {
  return subject.replace(/^[a-z-]+\s*:\s*/i, '').trim();
}

const phraseReplacements = [
  [/Enterprise modal/gi, 'Enterprise モーダル'],
  [/footer app login link/gi, 'フッターのアプリログインリンク'],
  [/business plan/gi, 'Business プラン'],
  [/mobile video playback/gi, 'モバイル動画再生'],
  [/autoplay fallback/gi, '自動再生フォールバック'],
  [/mobile crash path/gi, 'モバイルのクラッシュ経路'],
  [/App runtime guards/gi, 'App の実行時ガード'],
  [/OG image for social sharing/gi, 'SNS 共有用 OG 画像'],
  [/SEO with structured data and meta tags/gi, '構造化データとメタタグによる SEO'],
  [/sitemap\.xml and robots\.txt for SEO/gi, 'SEO 用の sitemap.xml と robots.txt'],
  [/Google Analytics \(GA4\) tracking/gi, 'Google Analytics (GA4) 計測'],
  [/Google Search Console verification file/gi, 'Google Search Console 確認ファイル'],
  [/video playback/gi, '動画再生'],
  [/structured data/gi, '構造化データ'],
  [/meta tags/gi, 'メタタグ'],
  [/canonical URL/gi, 'canonical URL'],
  [/Twitter Card meta tags/gi, 'Twitter Card メタタグ'],
  [/JSON-LD/gi, 'JSON-LD'],
  [/app login/gi, 'アプリログイン'],
  [/success screen/gi, '完了画面'],
  [/email note/gi, 'メール注記'],
  [/correct/gi, '修正'],
  [/threshold/gi, 'しきい値'],
  [/fix/gi, '修正'],
  [/replace/gi, '置き換え'],
  [/add/gi, '追加'],
  [/enable/gi, '有効化'],
  [/enhance/gi, '強化'],
  [/update/gi, '更新'],
  [/responsive support/gi, 'レスポンシブ対応'],
  [/scroll animations?/gi, 'スクロールアニメーション'],
  [/mobile menu/gi, 'モバイルメニュー'],
  [/header/gi, 'ヘッダー'],
  [/layout/gi, 'レイアウト'],
  [/unused/gi, '未使用の'],
  [/import/gi, 'インポート'],
  [/video/gi, '動画'],
  [/balance adjustment/gi, 'バランス調整'],
];

const knownJapaneseTitles = new Map([
  ['feat: update routes and layout for new mobile navigation', '機能追加: モバイル用の新しいナビゲーションを導入'],
  ['feat: add work hours setting for timeline', '機能追加: タイムラインの勤務時間設定を追加'],
  ['feat: simplify task edit modal on mobile with 3-section layout', '改善: モバイルのタスク編集モーダルを3セクション構成に整理'],
  ['feat(today): integrate todayview into app.tsx, remove old mobile rendering', '機能追加: Today 画面を本体に統合してモバイル表示を刷新'],
  ['feat(today): auto-scroll to now line, empty tray state, overdue styling', '改善: Today 画面で現在時刻への自動スクロールと期限超過表示を追加'],
  ['feat: feedback firestore user lookup, admin task edit bypass, remove legacy gcal', '改善: フィードバック基盤と管理者編集まわりを改善'],
  ['feat: replace file picker with auto screenshot capture in feedback', '機能追加: フィードバック送信で自動スクリーンショット取得に対応'],
  ['feat: calendar selector, google access for all, feedback sidebar with screenshot, error prompt', '機能追加: カレンダー選択、Google アクセス改善、画像付きフィードバック導線を追加'],
  ['feat: ball management, ai stage generation, ai billing limits, calendar sync', '機能追加: ボール管理、AI工程生成、AI利用制限、カレンダー同期を追加'],
  ['feat: mcp/gpt server-side validation, bulk import pj creation, oauth improvements', '機能追加: MCP/GPT 操作の検証強化と一括取込・OAuth を改善'],
  ['feat: add claude sonnet support to bulk import', '機能追加: 一括取込で Claude Sonnet を利用可能に'],
  ['feat(web): add local llm support via webgpu + transformers.js', '機能追加: WebGPU ベースのローカル LLM 対応を追加'],
  ['feat: google drive/chat連携機能を追加', '機能追加: Google Drive / Chat 連携を追加'],
  ['feat: 打合せ機能追加 & 工程の即時反映改善', '機能追加: 打合せ機能を追加し、工程反映を改善'],
  ['feat: 請求・メンバー管理機能強化 & ui改善', '改善: 請求・メンバー管理機能を強化'],
  ['feat: compass単独サブスク用checkout api追加 & ドキュメント同期', '機能追加: Compass 単独サブスク向け Checkout API を追加'],
  ['feat: add cross-org access and admin impersonation   - クロスオーガナイゼーション対応：他組織のプロジェクトでもロールに応じて作業可能に   - super_admin用の組織なりすまし機能を追加   - 自組織のsuper_adminをプロジェクトメンバー候補に表示', '機能追加: クロスオーガナイゼーション対応となりすまし管理を追加'],
  ['feat: complete type-based stage/task architecture', '機能追加: 工程とタスクの型ベース設計を導入'],
  ['feat: implement stage-based gantt chart with progress charge visualization', '機能追加: 工程ベースのガント表示と進捗可視化を追加'],
  ['feat: align gantt chart with japanese construction industry standards', '改善: ガントチャートを建築業向けの表示に最適化'],
  ['feat: redesign task period input ui with visual timeline', '改善: タスク期間入力 UI を視覚的タイムラインに刷新'],
  ['feat: add project member management and invitation system', '機能追加: プロジェクトメンバー管理と招待機能を追加'],
  ['feat: add project invitation notifications and various improvements', '機能追加: プロジェクト招待通知を追加'],
  ['feat: add task type migration api and improve gantt chart', '改善: タスク種別移行 API とガント改善を追加'],
  ['feat: implement stage toggle and fix gantt chart alignment', '改善: 工程トグルとガント整列を改善'],
  ['feat: ガントチャートのスクロール同期修正と機能追加', '改善: ガントチャートのスクロール同期と機能追加'],
  ['feat: ガントチャート機能改善', '改善: ガントチャート機能を改善'],
  ['feat: 認証・課金管理・メンバー管理機能の追加', '機能追加: 認証・課金・メンバー管理機能を追加'],
]);

function translatePhrase(value) {
  let translated = value;
  for (const [pattern, replacement] of phraseReplacements) {
    translated = translated.replace(pattern, replacement);
  }

  return translated
    .replace(/\s*-\s*/g, '、')
    .replace(/\s+/g, ' ')
    .trim();
}

function getJapanesePrefix(subject) {
  const normalized = subject.toLowerCase();

  if (normalized.startsWith('feat')) return '機能追加';
  if (normalized.startsWith('fix')) return '修正';
  if (normalized.startsWith('style')) return '表示改善';
  if (normalized.startsWith('layout')) return 'レイアウト改善';
  if (normalized.startsWith('responsive')) return 'レスポンシブ改善';
  if (normalized.startsWith('enhance')) return '改善';
  if (normalized.startsWith('update')) return '更新';
  if (normalized.startsWith('revert')) return '差し戻し';

  return '更新';
}

function shouldUseGenericJapaneseSummary(value) {
  const latinCount = (value.match(/[A-Za-z]/g) ?? []).length;
  const japaneseCount = (value.match(/[ぁ-んァ-ン一-龠]/g) ?? []).length;
  return latinCount > japaneseCount;
}

function createGenericJapaneseSummary(subject) {
  const prefix = getJapanesePrefix(subject);
  if (prefix === '機能追加') return 'GitHub の commit 履歴から自動で取り込んだ機能追加です。';
  if (prefix === '修正') return 'GitHub の commit 履歴から自動で取り込んだ修正です。';
  return `GitHub の commit 履歴から自動で取り込んだ${prefix}です。`;
}

function formatPublishedAt(iso) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso));
}

function deriveSummary(subject, body) {
  const cleanedBody = cleanText(
    body
      .split('\n')
      .filter((line) => !/^co-authored-by:/i.test(line.trim()))
      .map((line) => line.replace(/^\s*-\s*/, ''))
      .join(' ')
  );
  if (cleanedBody) {
    if (shouldUseGenericJapaneseSummary(cleanedBody)) {
      return createGenericJapaneseSummary(subject);
    }
    const translatedBody = translatePhrase(cleanedBody);
    return translatedBody.length > 120 ? `${translatedBody.slice(0, 117)}...` : translatedBody;
  }

  return createGenericJapaneseSummary(subject);
}

function deriveJapaneseTitle(subject) {
  const known = knownJapaneseTitles.get(subject.toLowerCase());
  if (known) {
    return known;
  }

  const prefix = getJapanesePrefix(subject);
  const base = translatePhrase(stripCommitPrefix(subject));
  return `${prefix}: ${base}`;
}

function parseHistory(logOutput) {
  return logOutput
    .split(RECORD_SEPARATOR)
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [sha, committedAtIso, subject, body = ''] = record.split(FIELD_SEPARATOR);
      return { sha, committedAtIso, subject: cleanText(subject), body };
    })
    .filter(({ subject }) => isImportantCommit(subject))
    .map((record) => {
      const { sha, committedAtIso, subject: cleanSubject, body } = record;

      return {
        sha,
        shortSha: sha.slice(0, 7),
        committedAtIso,
        committedAt: formatPublishedAt(committedAtIso),
        title: deriveJapaneseTitle(cleanSubject),
        summary: deriveSummary(cleanSubject, body),
        category: inferCategory(cleanSubject),
        url: `${REPO_WEB_URL}/commit/${sha}`,
      };
    })
    .slice(0, OUTPUT_LIMIT);
}

function writeModule(entries) {
  const fileContents = `export type GitHubHistoryCategory = 'お知らせ' | '改善' | '新機能';\n\nexport type GitHubHistoryEntry = {\n  sha: string;\n  shortSha: string;\n  committedAt: string;\n  committedAtIso: string;\n  title: string;\n  summary: string;\n  category: GitHubHistoryCategory;\n  url: string;\n};\n\nexport const githubHistory: GitHubHistoryEntry[] = ${JSON.stringify(entries, null, 2)} as GitHubHistoryEntry[];\n\nexport const githubRepositoryUrl = '${REPO_WEB_URL}';\n`;

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, fileContents, 'utf8');
}

const sourceRepo = resolveSourceRepo();
const logOutput = runGitLog(sourceRepo.cwd);
const entries = parseHistory(logOutput);
writeModule(entries);
console.log(`Generated ${entries.length} GitHub history entries at ${OUTPUT_PATH}`);

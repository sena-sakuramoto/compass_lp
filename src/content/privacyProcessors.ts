// プライバシーポリシーに載せる委託先の一覧。
// Compass のコードが実際に呼んでいる外部サービスだけを載せる（2026-10-04 の監査結果に合わせた）。
// 委託先を増やす・やめるときは、この一覧を先に直す。

export interface PrivacyProcessor {
  /** サービス名 */
  service: string;
  /** 事業者名 */
  company: string;
  /** 何に使うか */
  purpose: string;
  /** 渡るデータ */
  data: string;
  /** データを扱う地域 */
  region: string;
  /** 外国にある事業者か（個人情報保護法28条の情報提供の対象） */
  foreign: boolean;
}

export const PRIVACY_PROCESSORS: readonly PrivacyProcessor[] = [
  {
    service: 'Google Cloud / Firebase',
    company: 'Google LLC',
    purpose: 'サーバー、データベース、ファイルの保存、ログイン（認証）',
    data: 'アカウント情報（氏名・メールアドレス）、案件・タスク・工程などお客様が入力したデータ、利用ログ',
    region: 'データの保存は日本（東京リージョン）。ログイン（認証）は Google の世界規模の基盤で処理されます',
    foreign: true,
  },
  {
    service: 'Stripe',
    company: 'Stripe, Inc.',
    purpose: '有料プランの決済、請求',
    data: '請求先の会社名・氏名・メールアドレス、契約プラン。カード番号は Stripe が直接受け取り、当社は保持しません',
    region: '米国ほか',
    foreign: true,
  },
  {
    service: 'Google Workspace（Gmail API）',
    company: 'Google LLC',
    purpose: '招待・通知・お知らせのメール送信',
    data: '宛先の氏名・メールアドレス、メールの本文（案件名・タスク名を含む場合があります）',
    region: '米国ほか',
    foreign: true,
  },
  {
    service: 'Google Gemini API',
    company: 'Google LLC',
    purpose: 'AI 機能（工程の下書き、取り込みの整理、タスクの詳細の提案など）',
    data: 'AI 機能を使ったときの案件・タスクの文面',
    region: '米国ほか',
    foreign: true,
  },
  {
    service: 'OpenAI API',
    company: 'OpenAI, L.L.C.',
    purpose: '音声の文字起こし、音声での操作',
    data: '音声機能を使ったときの音声と、その文字起こし',
    region: '米国',
    foreign: true,
  },
  {
    service: 'Soniox',
    company: 'Soniox, Inc.',
    purpose: 'リアルタイムの音声入力',
    data: '音声入力を使ったときの音声と、その文字起こし',
    region: '米国',
    foreign: true,
  },
  {
    service: 'Cloudflare（Workers AI）',
    company: 'Cloudflare, Inc.',
    purpose: '判定用の AI（入力内容の分類・チェック）',
    data: '判定にかける案件・タスク・会議の文面',
    region: '米国ほか（世界各地のデータセンター）',
    foreign: true,
  },
  {
    service: 'Google Maps Platform',
    company: 'Google LLC',
    purpose: '住所入力の補完',
    data: '住所欄に入力した文字',
    region: '米国ほか',
    foreign: true,
  },
  {
    service: 'モジオコ（当社の議事録サービス）',
    company: 'Archi-Prisma Design works株式会社（当社）',
    purpose: '会議の記録からタスクを作る機能',
    data: '会議の文字起こし・議事録、連携する案件・タスクの情報',
    region: '台湾（Google Cloud の asia-east1 リージョン）',
    foreign: false,
  },
];

export interface ForeignCountryNotice {
  country: string;
  /** その国の個人情報の保護に関する制度 */
  system: string;
}

/** 外国にある第三者・外国でのデータ保存について、国ごとの制度の説明 */
export const FOREIGN_COUNTRY_NOTICES: readonly ForeignCountryNotice[] = [
  {
    country: '米国',
    system:
      '連邦レベルで個人情報の保護を包括的に定める法律はなく、分野ごとの連邦法と州法（カリフォルニア州消費者プライバシー法など）で保護されています。',
  },
  {
    country: '台湾',
    system: '個人情報の保護を包括的に定める法律として、個人資料保護法があります。',
  },
];

/** 本サービス（アプリ）ではなく、紹介サイトだけで使っている分析ツール */
export const LP_ANALYTICS = {
  service: 'Google Analytics',
  company: 'Google LLC',
  region: '米国ほか',
  optOutUrl: 'https://tools.google.com/dlpage/gaoptout?hl=ja',
} as const;

export type CompassFaqItem = {
  readonly question: string;
  readonly answer: string;
};

export const COMPASS_FAQ: readonly CompassFaqItem[] = [
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

export type UpdateCategory = 'お知らせ' | '改善' | '新機能' | 'メンテナンス';

export type ProductUpdateImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type ProductUpdateSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  image?: ProductUpdateImage;
};

export type ProductUpdate = {
  slug: string;
  version: string;
  publishedAt: string;
  publishedAtIso: string;
  category: UpdateCategory;
  title: string;
  summary: string;
  readTime: string;
  detailIntro: string;
  coverImage: ProductUpdateImage;
  highlights: string[];
  sections: ProductUpdateSection[];
};

export const productUpdates: ProductUpdate[] = [
  {
    slug: 'share-link-release',
    version: '2026.04',
    publishedAt: '2026年4月2日',
    publishedAtIso: '2026-04-02',
    category: '新機能',
    title: '共有リンク発行機能を追加しました',
    summary:
      'プロジェクトごとに共有リンクを発行し、ログインなしで読み取り専用の進行状況を確認できるようになりました。',
    readTime: '約2分',
    detailIntro:
      'Compass からプロジェクト単位の共有リンクを発行できるようになりました。社内メンバー以外にも、進行状況を読み取り専用で見せたい場面で使えます。',
    coverImage: {
      src: '/gantt.png',
      alt: 'Compass の工程表画面',
      caption: '共有先でも、工程とタスクの流れを読み取り専用で確認できます。',
    },
    highlights: [
      'プロジェクト単位で共有リンクを発行できます。',
      '共有先はログイン不要で、読み取り専用の公開ページを開けます。',
      '共有停止時はリンクを無効化でき、公開をいつでも止められます。',
    ],
    sections: [
      {
        title: 'できるようになったこと',
        paragraphs: [
          'プロジェクトごとに専用の共有リンクを発行し、リンクを知っている相手に工程やタスクの進行状況を見せられるようになりました。',
          '顧客、協力会社、社外メンバーなど、Compass のアカウントを持たない相手にも状況共有しやすくなります。',
        ],
        bullets: [
          '共有リンクの発行',
          '共有リンクの無効化',
          '読み取り専用の公開ページ表示',
        ],
      },
      {
        title: '共有先で見られる内容',
        paragraphs: [
          '共有先では、プロジェクト情報とタスク一覧をもとにした読み取り専用のガント表示を確認できます。',
          '編集操作や保存はできず、公開範囲も共有用に絞られた情報だけを返す設計です。',
        ],
        bullets: [
          'プロジェクト名や主要な進行情報',
          '工程表上のタスク配置',
          '担当や期限などの基本情報',
        ],
      },
      {
        title: '使いどころ',
        paragraphs: [
          '定例の進捗共有、顧客への現状報告、協力会社との認識合わせなど、閲覧だけで十分な場面で特に有効です。',
          '毎回スクリーンショットを撮って送る代わりに、最新状態をそのまま見てもらえるので、共有コストを下げられます。',
        ],
        bullets: [
          '顧客への進捗共有',
          '協力会社との状況共有',
          '社内外メンバーへの簡易な閲覧導線',
        ],
      },
    ],
  },
  {
    slug: 'updates-page-launch',
    version: '2026.04',
    publishedAt: '2026年4月2日',
    publishedAtIso: '2026-04-02',
    category: 'お知らせ',
    title: 'アップデート情報ページを公開しました',
    summary:
      'Compassの機能改善、お知らせ、メンテナンス予定をまとめて確認できる更新ページを追加しました。',
    readTime: '約2分',
    detailIntro:
      '今回の公開で、Compassに関する変更点を一覧だけでなく詳細ページでも確認できるようになりました。今後は画面付きで変更意図や使いどころを説明していけます。',
    coverImage: {
      src: '/og-image.png',
      alt: 'Compass のプロダクトイメージ',
      caption: '今後の更新情報は、このページから時系列で確認できます。',
    },
    highlights: [
      '今後の機能追加や改善内容を、このページに時系列で掲載します。',
      '料金や運用に関するお知らせも同じ場所から確認できます。',
      'LPのヘッダーとフッターからいつでも更新情報へ移動できます。',
    ],
    sections: [
      {
        title: '何が変わったか',
        paragraphs: [
          '更新情報の一覧ページを新設し、最新のお知らせをまとめて確認できるようにしました。',
          '一覧から詳細ページへ移動できる構成にしたことで、短い要約だけでなく背景や使い方まで丁寧に伝えられます。',
        ],
        bullets: [
          'アップデートを時系列で一覧表示',
          '各アップデートに専用の詳細ページを用意',
          'LPの導線から1クリックで到達可能',
        ],
        image: {
          src: '/dashboard.png',
          alt: 'Compass ダッシュボード画面',
          caption: 'ダッシュボードのような主要画面の変更も、今後は画像付きで説明できます。',
        },
      },
      {
        title: '画像付きで説明する理由',
        paragraphs: [
          '工程表や案件一覧の改善は、文章だけだと伝わりにくいことがあります。',
          'スクリーンショットを添えることで、どこが変わったのか、どの業務に効くのかをひと目で把握しやすくなります。',
        ],
        bullets: [
          'UI変更の理解が早い',
          '現場メンバーへの共有に使いやすい',
          '変更前後の差分を見せやすい',
        ],
        image: {
          src: '/project-list.png',
          alt: 'Compass の案件一覧画面',
          caption: '案件一覧や各種ビューの改善内容も、実画面ベースで案内できます。',
        },
      },
      {
        title: '今後ここで案内する内容',
        paragraphs: [
          '新機能、操作改善、不具合修正、重要なお知らせ、メンテナンス予定をこの更新情報に集約していきます。',
          '特に操作が変わるアップデートは、工程表などの画面イメージとあわせて掲載する想定です。',
        ],
        bullets: [
          '新機能の追加',
          '操作性の改善',
          '不具合修正と影響範囲',
          'メンテナンス予定や重要告知',
        ],
        image: {
          src: '/gantt.png',
          alt: 'Compass の工程表画面',
          caption: '工程表まわりのアップデートも、実際のUIと一緒に説明していきます。',
        },
      },
    ],
  },
];

export const latestProductUpdate = productUpdates[0];

export function getProductUpdateBySlug(slug: string) {
  return productUpdates.find((update) => update.slug === slug);
}

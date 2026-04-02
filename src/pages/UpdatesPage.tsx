import { ArrowRight, ArrowUpRight, Bell, CalendarDays, CheckCircle2, Clock3, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productUpdates } from '../content/updates';
import { githubHistory, githubRepositoryUrl } from '../generated/githubHistory';

const categoryStyles = {
  お知らせ: 'bg-sky-100 text-sky-700 border-sky-200',
  改善: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  新機能: 'bg-violet-100 text-violet-700 border-violet-200',
  メンテナンス: 'bg-amber-100 text-amber-700 border-amber-200',
} as const;

export function UpdatesPage() {
  const latestUpdate = productUpdates[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-cyan-100">
            <Bell className="h-4 w-4" />
            Compass Updates
          </div>
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">更新情報</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 md:text-base">
                Compassの機能改善、お知らせ、メンテナンス予定をまとめています。
                最新の変更点はこのページから時系列で確認できます。
              </p>
            </div>
            {latestUpdate && (
              <div className="rounded-2xl border border-white/10 bg-white/8 px-5 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Latest</p>
                <p className="mt-2 text-lg font-semibold">{latestUpdate.title}</p>
                <p className="mt-1 text-sm text-slate-300">{latestUpdate.publishedAt}</p>
              </div>
            )}
          </div>
        </div>

        <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Clock3 className="h-4 w-4 text-cyan-600" />
              掲載内容
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              機能追加、改善、不具合対応、メンテナンス予定、運用上のお知らせを掲載します。
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CalendarDays className="h-4 w-4 text-cyan-600" />
              更新タイミング
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              変更内容が公開できる状態になったタイミングで順次反映します。
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckCircle2 className="h-4 w-4 text-cyan-600" />
              確認しやすさ
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              LPの導線から1クリックでアクセスでき、最新情報がすぐ見つかります。
            </p>
          </div>
        </section>

        <section className="space-y-4">
          {productUpdates.map((update) => (
            <article
              key={update.slug}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid gap-0 lg:grid-cols-[0.62fr_0.38fr]">
                <div className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${categoryStyles[update.category]}`}
                        >
                          {update.category}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                          {update.version}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {update.readTime}
                        </span>
                      </div>
                      <h2 className="mt-3 text-2xl font-bold text-slate-900">{update.title}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                        {update.summary}
                      </p>
                    </div>
                    <time
                      dateTime={update.publishedAtIso}
                      className="inline-flex shrink-0 self-start items-center gap-2 whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600"
                    >
                      <CalendarDays className="h-4 w-4" />
                      {update.publishedAt}
                    </time>
                  </div>

                  <ul className="mt-5 space-y-3">
                    {update.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Link
                      to={`/updates/${update.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      詳しく見る
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-slate-100 lg:border-l lg:border-t-0">
                  <img
                    src={update.coverImage.src}
                    alt={update.coverImage.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                <Github className="h-4 w-4" />
                GitHub History
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">主要な更新は GitHub 履歴から追えます</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
                過去の改善や追加機能のうち、影響の大きいものだけを Compass 本体リポジトリの commit 履歴から自動で反映しています。
                細かな修正は GitHub 側に残しつつ、このページでは主要な変化だけを見やすく出します。
              </p>
            </div>
            <a
              href={`${githubRepositoryUrl}/commits/main`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              GitHubで全履歴を見る
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-6 grid gap-4">
            {githubHistory.map((entry) => (
              <article
                key={entry.sha}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${categoryStyles[entry.category]}`}
                      >
                        {entry.category}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                        <Github className="h-3.5 w-3.5" />
                        {entry.shortSha}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-900 md:text-xl">{entry.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{entry.summary}</p>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <time
                      dateTime={entry.committedAtIso}
                      className="inline-flex shrink-0 self-start items-center gap-2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600"
                    >
                      <CalendarDays className="h-4 w-4" />
                      {entry.committedAt}
                    </time>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-800"
                    >
                      commitを見る
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-900">主要な更新はこのページで確認できます。</p>
          <p className="mt-2 text-sm text-slate-600">
            重要な新機能や改善は、画像つきの記事と GitHub 履歴の両方から追えるようにしています。
          </p>
        </section>

        <div className="pb-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 font-medium text-cyan-700 transition hover:text-cyan-800"
          >
            トップページに戻る
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

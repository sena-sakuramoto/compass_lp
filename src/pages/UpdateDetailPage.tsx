import { ArrowLeft, CalendarDays, CheckCircle2, Clock3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getProductUpdateBySlug } from '../content/updates';
import { githubRepositoryUrl } from '../generated/githubHistory';

export function UpdateDetailPage() {
  const { slug = '' } = useParams();
  const update = getProductUpdateBySlug(slug);

  if (!update) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl p-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Update Not Found</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">指定された更新情報は見つかりませんでした</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              URLが古いか、まだ公開されていない可能性があります。更新一覧からご確認ください。
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                to="/updates"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                更新一覧へ戻る
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                トップへ戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <article className="mx-auto max-w-6xl p-6">
        <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-[0_32px_80px_rgba(15,23,42,0.22)] sm:p-8">
          <Link
            to="/updates"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            更新一覧へ戻る
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  {update.category}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {update.version}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {update.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
                {update.detailIntro}
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                  <CalendarDays className="h-4 w-4 text-cyan-200" />
                  <time dateTime={update.publishedAtIso}>{update.publishedAt}</time>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                  <Clock3 className="h-4 w-4 text-cyan-200" />
                  {update.readTime}
                </span>
              </div>
            </div>

            <figure className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
              <img
                src={update.coverImage.src}
                alt={update.coverImage.alt}
                className="h-full w-full object-cover"
              />
              {update.coverImage.caption && (
                <figcaption className="border-t border-white/10 px-4 py-3 text-sm text-slate-300">
                  {update.coverImage.caption}
                </figcaption>
              )}
            </figure>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {update.highlights.map((highlight) => (
            <div key={highlight} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-600" />
                <p className="text-sm leading-relaxed text-slate-700">{highlight}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 space-y-6">
          {update.sections.map((section, index) => (
            <div
              key={section.title}
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
            >
              <div className={section.image ? 'grid gap-0 lg:grid-cols-[0.95fr_1.05fr]' : ''}>
                <div
                  className={`p-6 sm:p-8 ${
                    section.image
                      ? (index % 2 === 0 ? 'lg:order-1' : 'lg:order-2')
                      : ''
                  }`}
                >
                  <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Section {index + 1}
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-slate-900">{section.title}</h2>
                  <div className="mt-4 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-relaxed text-slate-700 sm:text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-5 space-y-3">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3 text-sm text-slate-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {section.image && (
                  <div
                    className={`border-t border-slate-200 bg-slate-100 lg:border-t-0 ${
                      index % 2 === 0 ? 'lg:order-2 lg:border-l' : 'lg:order-1 lg:border-r'
                    }`}
                  >
                    <figure className="h-full">
                      <img
                        src={section.image.src}
                        alt={section.image.alt}
                        className="h-full w-full object-cover"
                      />
                      {section.image.caption && (
                        <figcaption className="border-t border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
                          {section.image.caption}
                        </figcaption>
                      )}
                    </figure>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">他の更新も確認できます</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            新機能や改善内容は、更新一覧からまとめて確認できます。
            継続的な改善履歴を見たい場合は、Compass 本体の GitHub 履歴も参照できます。
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/updates"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              更新一覧を見る
            </Link>
            <a
              href={`${githubRepositoryUrl}/commits/main`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              GitHub 履歴を見る
            </a>
          </div>
        </section>
      </article>
    </div>
  );
}

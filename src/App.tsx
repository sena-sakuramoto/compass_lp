import { Component, type ErrorInfo, type ReactNode, useState, useEffect, createElement } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ArrowRight,
  Clock,
  Menu,
  X,
} from 'lucide-react';
import './index.css';
import { productUpdates } from './content/updates';
import { buildCompassFaqStructuredData, COMPASS_FAQ } from './content/faq';
import { AiConsultSection } from './components/AiConsultSection';
import { HeroVideo } from './components/HeroVideo';
import { ConceptVideo, FeatureClip, Phrase, SectionHead, SectionLabel } from './components/LpParts';

const MOBILE_MOTION_PROPS = [
  'initial',
  'animate',
  'whileInView',
  'whileHover',
  'whileTap',
  'transition',
  'viewport',
  'exit',
] as const;

function stripMotionProps(props: Record<string, unknown>) {
  const safeProps: Record<string, unknown> = { ...props };
  for (const key of MOBILE_MOTION_PROPS) {
    delete safeProps[key];
  }
  return safeProps;
}

function createMobileMotionElement(tag: string) {
  return ({ children, ...props }: Record<string, unknown>) => {
    return createElement(tag, stripMotionProps(props), children as ReactNode);
  };
}

const mobileMotion = {
  div: createMobileMotionElement('div'),
  header: createMobileMotionElement('header'),
  button: createMobileMotionElement('button'),
  a: createMobileMotionElement('a'),
  h1: createMobileMotionElement('h1'),
  h2: createMobileMotionElement('h2'),
  p: createMobileMotionElement('p'),
  span: createMobileMotionElement('span'),
  li: createMobileMotionElement('li'),
  details: createMobileMotionElement('details'),
};

type Plan = {
  name: string;
  price: number;
  maxMembers: number;
  currency?: string;
  interval?: string;
  trialDays?: number;
  features: string[];
  eligibleDomains?: string[];
};

type CheckoutPlans = {
  small: Plan;
  standard: Plan;
  business: Plan;
  student: Plan;
};

const DEFAULT_PLANS: CheckoutPlans = {
  small: {
    name: 'Compass Small',
    price: 5000,
    maxMembers: 5,
    currency: 'JPY',
    interval: 'month',
    trialDays: 14,
    features: [
      '全機能が使える',
      '最大5名まで',
      '14日間の無料トライアル',
    ],
  },
  standard: {
    name: 'Compass Standard',
    price: 15000,
    maxMembers: 15,
    currency: 'JPY',
    interval: 'month',
    trialDays: 14,
    features: [
      '全機能が使える',
      '最大15名まで',
      '14日間の無料トライアル',
    ],
  },
  business: {
    name: 'Compass Business',
    price: 35000,
    maxMembers: 40,
    currency: 'JPY',
    interval: 'month',
    trialDays: 14,
    features: [
      '全機能が使える',
      '最大40名まで',
      '14日間の無料トライアル',
    ],
  },
  student: {
    name: 'Compass 学生プラン',
    price: 0,
    maxMembers: 5,
    currency: 'JPY',
    interval: 'month',
    trialDays: 0,
    features: [
      '全機能が使える',
      '学生は永久無料',
      '.ac.jp / .edu / .ed.jp ドメインが対象',
    ],
    eligibleDomains: ['.ac.jp', '.edu', '.ed.jp'],
  },
};

const toFiniteNumber = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const toStringArray = (value: unknown, fallback: string[]) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : fallback;

const normalizePlan = (value: unknown, fallback: Plan): Plan => {
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const candidate = value as Record<string, unknown>;
  const features = toStringArray(candidate.features, fallback.features);
  const eligibleDomains = toStringArray(
    candidate.eligibleDomains,
    fallback.eligibleDomains ?? []
  );

  return {
    name: typeof candidate.name === 'string' ? candidate.name : fallback.name,
    price: toFiniteNumber(candidate.price, fallback.price),
    maxMembers: toFiniteNumber(candidate.maxMembers, fallback.maxMembers),
    currency: typeof candidate.currency === 'string' ? candidate.currency : fallback.currency,
    interval: typeof candidate.interval === 'string' ? candidate.interval : fallback.interval,
    trialDays: toFiniteNumber(candidate.trialDays, fallback.trialDays ?? 0),
    features: features.length > 0 ? features : fallback.features,
    eligibleDomains: eligibleDomains.length > 0
      ? eligibleDomains
      : (fallback.eligibleDomains ?? []),
  };
};

const normalizePlans = (value: unknown): CheckoutPlans => {
  const candidate = value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};

  return {
    small: normalizePlan(candidate.small, DEFAULT_PLANS.small),
    standard: normalizePlan(candidate.standard, DEFAULT_PLANS.standard),
    business: normalizePlan(candidate.business, DEFAULT_PLANS.business),
    student: normalizePlan(candidate.student, DEFAULT_PLANS.student),
  };
};

const formatPrice = (price: number, currency = 'JPY') => {
  const safePrice = Number.isFinite(price) ? price : 0;
  if (safePrice === 0) return '無料';
  if (currency === 'JPY') return `¥${safePrice.toLocaleString()}`;
  return `${safePrice.toLocaleString()} ${currency}`;
};


type EnterpriseInquiryForm = {
  companyName: string;
  contactName: string;
  email: string;
  teamSize: string;
  phone: string;
  message: string;
};

// ============================================
// MOBILE DETECTION HOOK
// ============================================
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }

    if (typeof mql.addListener === 'function') {
      mql.addListener(update);
      return () => mql.removeListener(update);
    }

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakpoint]);
  return isMobile;
}

// ============================================
// LP の中身（主張は検証済みの内容だけにする：src/lib/marketing-claims.test.ts）
// ============================================
const NAV_ITEMS = [
  { label: '機能', href: '#features' },
  { label: 'これから', href: '#vision' },
  { label: '料金', href: '#pricing' },
  { label: '導入', href: '#flow' },
  { label: 'サークル', href: '#circle' },
  { label: '更新情報', href: '/updates' },
];

const PAIN_ROWS = [
  { title: '情報がバラバラ', problem: 'Excel、ホワイトボード、LINE…複数ツールに分散し、最新情報がどれか分からない。', answer: '工程、担当、締切、進捗を同じ画面で確認できる。' },
  { title: '進捗が見えない', problem: '誰が何をやっているか把握できない。確認のための会議や電話が増える一方。', answer: '進捗更新をタスク単位で記録でき、同じ工程をブラウザから共有できる。' },
  { title: '遅延に気づけない', problem: '締切が迫っても気づかず後手に。問題が大きくなってから発覚する。', answer: '締切前や進捗変更時に通知が届く。' },
  { title: '使いこなせるか不安', problem: '設定項目が多くて挫折し、結局Excelに戻ってしまう。', answer: '登録前にデモで主要操作を確認でき、既存のExcelデータも取り込める。' },
  { title: '現場で見られない', problem: '事務所に戻らないと、最新の工程が分からない。', answer: 'スマートフォンのブラウザから工程を確認できる。' },
];

const FEATURE_CLIPS = [
  { no: '02.1', name: 'ガントチャート', title: 'ドラッグで、工程が組める。', text: '工程のバーをつかんで動かすだけで、日程を組み替えられます。担当と進捗も同じ表で見えます。', src: '/screens/gantt.mp4', poster: '/screens/gantt.jpg' },
  { no: '02.2', name: '依存関係', title: '順番を、線でつなぐ。', text: '前後の工程を線で結び、作業の順番を表の上で確かめられます。', src: '/screens/deps.mp4', poster: '/screens/deps.jpg' },
  { no: '02.3', name: 'リソース分析', title: '遅れと負荷を、先に見る。', text: 'メンバーごとの稼働と負荷をグラフで確認でき、偏りに早く気づけます。', src: '/screens/workload.mp4', poster: '/screens/workload.jpg' },
  { no: '02.4', name: 'AI取り込み', title: '貼るだけで、工程はAIが。', text: '工程のメモやExcel・PDFを貼ると、AIが工程とタスクに分けて取り込みます。', src: '/screens/ai-import.mp4', poster: '/screens/ai-import.jpg' },
  { no: '02.5', name: 'プロジェクト一覧', title: '全案件を、ひと目で。', text: '進行中の案件の進捗率・期限・予算を、カードで並べて見られます。', src: '/screens/projects.mp4', poster: '/screens/projects.jpg' },
];

const MORE_FEATURES = [
  { title: 'チーム招待', text: '現場も設計も、必要なメンバーを招待。プロジェクトごとの権限管理も。' },
  { title: 'カレンダー連携', text: 'Googleカレンダーと同期し、予定を見える化。' },
  { title: '通知・リマインド', text: '締切前や進捗変更時に通知。重要な変更を見逃さない。' },
  { title: 'Excel連携', text: '既存のExcelデータをインポートし、従来の工程表から移行。' },
];

const PLAN_COLUMNS = [
  { tier: 'small', label: 'Small' },
  { tier: 'standard', label: 'Standard' },
  { tier: 'business', label: 'Business' },
] as const;

const VISION_POINTS = [
  '一言で、関係する仕事が同時に動く',
  '返事待ちを、忘れずに追いかける',
  '判断と証拠が、会社の知識になる',
];

// ============================================
// MAIN APP COMPONENT
// ============================================
// API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://api-g3xwwspyla-an.a.run.app';

type AppErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Unknown runtime error',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[lp] Runtime crash in App', error, errorInfo);
    try {
      localStorage.setItem('compass_lp_last_error', JSON.stringify({
        message: error?.message || 'Unknown runtime error',
        stack: error?.stack || '',
        componentStack: errorInfo?.componentStack || '',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }));
    } catch {
      // no-op: storage can be blocked in private mode
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-[#1e293b] flex items-center justify-center px-6">
          <div className="max-w-md w-full rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-700 mb-2">表示エラーが発生しました</p>
            <p className="text-xs text-red-700/90 break-all">{this.state.message}</p>
            <button
              type="button"
              className="mt-4 w-full rounded-xl bg-white border border-red-200 px-4 py-2 text-sm font-medium text-red-700"
              onClick={() => window.location.reload()}
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const isMobile = useIsMobile();
  const motion = isMobile ? mobileMotion : framerMotion;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 申し込みモーダル用state
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState<'small' | 'standard' | 'business'>('small');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isStudentEmail, setIsStudentEmail] = useState(false);
  const [plans, setPlans] = useState<CheckoutPlans>(DEFAULT_PLANS);
  const [planError, setPlanError] = useState<string | null>(null);
  const [enterpriseForm, setEnterpriseForm] = useState<EnterpriseInquiryForm>({
    companyName: '',
    contactName: '',
    email: '',
    teamSize: '',
    phone: '',
    message: '',
  });
  const [enterpriseSubmitted, setEnterpriseSubmitted] = useState(false);
  const [enterpriseLoading, setEnterpriseLoading] = useState(false);
  const [enterpriseError, setEnterpriseError] = useState<string | null>(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const smallPlan = plans.small ?? DEFAULT_PLANS.small;
  const standardPlan = plans.standard ?? DEFAULT_PLANS.standard;
  const businessPlan = plans.business ?? DEFAULT_PLANS.business;
  const studentPlan = plans.student ?? DEFAULT_PLANS.student;
  const selectedPlan = selectedTier === 'business' ? businessPlan : selectedTier === 'standard' ? standardPlan : smallPlan;
  const studentPrice = formatPrice(studentPlan.price, studentPlan.currency);
  const studentDomainsLabel = (studentPlan.eligibleDomains ?? DEFAULT_PLANS.student.eligibleDomains ?? []).join(' / ');
  const featuredUpdates = productUpdates.slice(0, 3);
  const plansByTier = { small: smallPlan, standard: standardPlan, business: businessPlan } as const;


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    try {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } catch {
      window.addEventListener('scroll', handleScroll);
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/api/public/checkout/plans`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('プラン取得に失敗しました');
        }
        return res.json() as Promise<unknown>;
      })
      .then((data) => {
        if (active) {
          setPlans(normalizePlans(data));
        }
      })
      .catch((err) => {
        console.warn('[lp] Failed to load plans:', err);
        if (active) {
          setPlanError('プラン情報の取得に失敗しました（表示は参考値です）');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // メールアドレスの学生判定
  useEffect(() => {
    const domains = toStringArray(
      studentPlan.eligibleDomains,
      DEFAULT_PLANS.student.eligibleDomains ?? ['.ac.jp', '.edu', '.ed.jp']
    );
    const lower = signupEmail.toLowerCase();
    setIsStudentEmail(domains.some(d => lower.endsWith(d)));
  }, [signupEmail, studentPlan.eligibleDomains]);

  const handleDemoClick = () => {
    window.location.href = 'https://compass-demo.web.app/';
  };

  const openSignupWithTier = (tier: 'small' | 'standard' | 'business') => {
    setShowSignupModal(true);
    setSignupEmail('');
    setSignupError(null);
    setSelectedTier(tier);
  };
  const handleTrialClick = () => {
    openSignupWithTier('small');
  };

  const handleEnterpriseInquiryClick = (closeSignupModal = false) => {
    if (closeSignupModal) {
      setShowSignupModal(false);
    }
    setShowEnterpriseModal(true);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail) return;

    setSignupLoading(true);
    setSignupError(null);

    try {
      const response = await fetch(`${API_URL}/api/public/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, tier: selectedTier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '申し込み処理に失敗しました');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('決済ページのURLを取得できませんでした');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '申し込み処理に失敗しました';
      setSignupError(message);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleEnterpriseFieldChange = (field: keyof EnterpriseInquiryForm, value: string) => {
    setEnterpriseForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEnterpriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnterpriseLoading(true);
    setEnterpriseError(null);

    try {
      const response = await fetch(`${API_URL}/api/public/enterprise-inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enterpriseForm),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || '送信に失敗しました');
      }

      setEnterpriseSubmitted(true);
    } catch (err) {
      setEnterpriseError(err instanceof Error
        ? err.message
        : '送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setEnterpriseLoading(false);
    }
  };

  return (
    <div className="lp min-h-screen bg-white text-[var(--lp-ink)] overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildCompassFaqStructuredData()),
        }}
      />
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-[border-color] duration-300 border-b ${
          scrolled ? 'border-[var(--lp-rule)]' : 'border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <a href="/" className="flex items-center" aria-label="Compass トップ">
              <img src="/compass-logo.png" alt="Compass" className="h-6 sm:h-7 w-auto" draggable="false" onContextMenu={(e) => e.preventDefault()} />
            </a>

            <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--lp-sub)]">
              {NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href} className="hover:text-[var(--lp-ink)] transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={handleDemoClick} className="text-sm text-[var(--lp-ink)] hover:text-[var(--lp-accent-ink)] transition-colors">
                デモを試す
              </button>
              <button
                onClick={handleTrialClick}
                className="rounded-[4px] bg-[var(--lp-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--lp-accent-ink)] transition-colors"
              >
                無料で始める
              </button>
            </div>

            <button
              className="md:hidden p-2 -mr-2 text-[var(--lp-ink)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--lp-rule)] bg-white">
            <div className="px-4 py-4">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block border-b border-[var(--lp-rule)] py-3 text-[var(--lp-ink)]"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 grid grid-cols-2 gap-3">
                <button onClick={() => { handleDemoClick(); setMobileMenuOpen(false); }} className="rounded-[4px] border border-[var(--lp-ink)] py-3 text-sm font-bold text-[var(--lp-ink)]">
                  デモを試す
                </button>
                <button onClick={() => { handleTrialClick(); setMobileMenuOpen(false); }} className="rounded-[4px] bg-[var(--lp-accent)] py-3 text-sm font-bold text-white">
                  無料で始める
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="pt-20 sm:pt-24 pb-14 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <HeroVideo isMobile={isMobile} src="/compass-intro-v12.mp4" poster="/compass-intro-v12-poster.jpg" />
          {/* 表題欄 */}
          <dl className="grid grid-cols-2 lg:grid-cols-4 border-l border-[var(--lp-ink)]">
            {[
              { k: '対象', v: '建築・施工のチーム' },
              { k: '使う場所', v: 'パソコンとスマホのブラウザ' },
              { k: '料金', v: `月${formatPrice(smallPlan.price, smallPlan.currency)}から（〜${smallPlan.maxMembers}名）` },
              { k: '試用', v: smallPlan.trialDays ? `${smallPlan.trialDays}日間無料` : 'デモで操作を確認' },
            ].map((row) => (
              <div key={row.k} className="border-r border-b border-[var(--lp-ink)] px-3 py-3 sm:px-4 sm:py-4">
                <dt className="f-mono text-[11px] tracking-[0.15em] text-[var(--lp-sub)]">{row.k}</dt>
                <dd className="mt-1 text-sm sm:text-base font-bold text-[var(--lp-ink)]"><Phrase text={row.v} /></dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 sm:mt-12 grid gap-6 lg:grid-cols-12 lg:gap-8">
            <h1 className="f-display lg:col-span-7 text-[34px] leading-[1.18] sm:text-5xl lg:text-[64px] font-black tracking-tight text-[var(--lp-ink)]">
              すべての現場に、
              <br />
              <span className="text-[var(--lp-accent)]">Compass</span>を。
            </h1>
            <div className="lg:col-span-5 lg:pt-3">
              <p className="text-base sm:text-lg leading-relaxed text-[var(--lp-sub)]">
                今どこにいて、次に何をすべきかが一目でわかる。
                <br className="hidden sm:block" />
                だから現場が迷わず、プロジェクトが前に進む。
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={handleTrialClick}
                  className="rounded-[4px] bg-[var(--lp-accent)] px-5 py-3.5 text-base font-bold text-white hover:bg-[var(--lp-accent-ink)] transition-colors"
                >
                  14日間無料で試す →
                </button>
                <button
                  onClick={handleDemoClick}
                  className="rounded-[4px] border border-[var(--lp-ink)] px-5 py-3.5 text-base font-bold text-[var(--lp-ink)] hover:bg-[var(--lp-paper)] transition-colors"
                >
                  デモを試す
                </button>
              </div>
              <p className="mt-3 text-xs text-[var(--lp-sub)]">
                申込前に契約条件を確認 ／ 手続き・期限を申込前に確認
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================ */}
      {/* 01 課題と答え */}
      {/* ============================================ */}
      <section id="why" className="bg-[var(--lp-paper)] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead
            no="01 — 課題"
            title={<>散らばる工程を、<br />一本の表に。</>}
            lead="Excel、ホワイトボード、LINE。工程の情報が散らばるほど、確認の電話と会議が増えていきます。"
          />

          <div className="mt-8 sm:mt-10 border-t-2 border-[var(--lp-ink)]">
            <div className="hidden md:grid grid-cols-12 gap-6 border-b border-[var(--lp-ink)] py-3 text-sm font-bold">
              <p className="col-span-5 text-[var(--lp-sub)]">よくある状態</p>
              <p className="col-span-1" />
              <p className="col-span-6 text-[var(--lp-accent-ink)]">Compass では</p>
            </div>
            {PAIN_ROWS.map((row) => (
              <div key={row.title} className="grid grid-cols-1 gap-3 border-b border-[var(--lp-rule)] py-5 sm:py-6 md:grid-cols-12 md:gap-6 md:items-center">
                <div className="md:col-span-5">
                  <p className="text-lg sm:text-xl font-bold text-[var(--lp-ink)]">{row.title}</p>
                  <p className="mt-1 text-sm sm:text-[15px] leading-relaxed text-[#3f4a57]">{row.problem}</p>
                </div>
                <p aria-hidden className="hidden md:block md:col-span-1 text-center f-mono text-2xl text-[var(--lp-accent)]">→</p>
                <div className="md:col-span-6 border-l-4 border-[var(--lp-accent)] bg-white px-4 py-3 sm:px-5 sm:py-4">
                  <p className="md:hidden text-xs font-bold text-[var(--lp-accent-ink)]">Compass では</p>
                  <p className="text-base sm:text-lg font-bold leading-relaxed text-[var(--lp-ink)]">{row.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 02 機能 */}
      {/* ============================================ */}
      <section id="features" className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead
            no="02 — 機能"
            title={<>画面は、<br />見ればわかる。</>}
            lead="ここに映っているのは、Compass の実際の画面の録画です（データはデモ用のものです）。"
          />

          {/* 主役：ガントチャート */}
          <div className="mt-8 sm:mt-10 grid gap-5 lg:grid-cols-12 lg:gap-8 items-start">
            <div className="lg:col-span-4">
              <SectionLabel no={`${FEATURE_CLIPS[0].no} — ${FEATURE_CLIPS[0].name}`} />
              <h3 className="f-display mt-2 text-2xl sm:text-3xl font-black leading-snug text-[var(--lp-ink)]"><Phrase text={FEATURE_CLIPS[0].title} /></h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--lp-sub)]">{FEATURE_CLIPS[0].text}</p>
            </div>
            <div className="lg:col-span-8">
              <FeatureClip src={FEATURE_CLIPS[0].src} poster={FEATURE_CLIPS[0].poster} label={FEATURE_CLIPS[0].name} />
            </div>
          </div>

          {/* 残り4つ */}
          <div className="mt-10 sm:mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {FEATURE_CLIPS.slice(1).map((f) => (
              <div key={f.no}>
                <FeatureClip src={f.src} poster={f.poster} label={f.name} />
                <div className="mt-4"><SectionLabel no={`${f.no} — ${f.name}`} /></div>
                <h3 className="f-display mt-1 text-xl sm:text-2xl font-black text-[var(--lp-ink)]"><Phrase text={f.title} /></h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--lp-sub)]">{f.text}</p>
              </div>
            ))}
          </div>

          {/* ほかにも */}
          <div className="mt-12 sm:mt-16 border-t border-[var(--lp-ink)]">
            <p className="py-2 f-mono text-[11px] tracking-[0.15em] text-[var(--lp-sub)]">ほかにも</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-l border-[var(--lp-rule)]">
              {MORE_FEATURES.map((f) => (
                <div key={f.title} className="border-r border-b border-t border-[var(--lp-rule)] p-4 -mt-px">
                  <p className="font-bold text-[var(--lp-ink)]">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--lp-sub)]">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AiConsultSection />

      {/* ============================================ */}
      {/* 03 これからの Compass（構想・開発中） */}
      {/* ============================================ */}
      <section id="vision" className="bg-[var(--lp-ink)] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead
            dark
            no="03 — これからの Compass（構想・開発中）"
            title={<>話せば、<br />仕事が始まる。</>}
            lead="図面を1か所変えたら、関係する仕事を一言で動かす。返事待ちは忘れずに追いかけ、終わった仕事は証拠と一緒に会社の知識になる。いま開発を進めている Compass の姿です。"
          />
          <div className="mt-8 sm:mt-10 grid gap-6 lg:grid-cols-12 lg:gap-8 items-start">
            <ol className="lg:col-span-4 border-t border-white/25">
              {VISION_POINTS.map((p, i) => (
                <li key={p} className="flex gap-4 border-b border-white/25 py-4">
                  <span className="f-mono text-xs text-white/50 pt-1">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-base sm:text-lg font-bold text-white leading-snug">{p}</span>
                </li>
              ))}
            </ol>
            <div className="lg:col-span-8">
              <ConceptVideo src="/compass-os-concept.mp4" poster="/compass-os-concept-poster.jpg" />
              <p className="mt-3 text-xs text-white/60">※開発中の機能を含むイメージです。実際の提供内容・時期は変わる場合があります。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 04 料金 */}
      {/* ============================================ */}
      <section id="pricing" className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead
            no="04 — 料金"
            title={<>人数で決まる、<br />定額制。</>}
            lead="Small（〜5名）・Standard（〜15名）・Business（〜40名）の定額制。40名を超える場合はEnterpriseをご案内します。"
          />

          {planError ? (
            <p className="mt-6 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-800">{planError}</p>
          ) : null}

          <div className="mt-8 sm:mt-10 hidden md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-y border-[var(--lp-ink)]">
                  <th className="w-[22%] py-3 pr-4 f-mono text-[11px] font-medium tracking-[0.15em] text-[var(--lp-sub)]">プラン</th>
                  {PLAN_COLUMNS.map((c) => (
                    <th key={c.tier} className="border-l border-[var(--lp-rule)] px-5 py-3">
                      <span className="f-mono text-xs tracking-[0.15em] text-[var(--lp-sub)]">{c.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[var(--lp-ink)]">
                <tr className="border-b border-[var(--lp-rule)]">
                  <th className="py-4 pr-4 text-sm font-bold">人数</th>
                  {PLAN_COLUMNS.map((c) => (
                    <td key={c.tier} className="border-l border-[var(--lp-rule)] px-5 py-4 font-bold">〜{plansByTier[c.tier].maxMembers}名</td>
                  ))}
                </tr>
                <tr className="border-b border-[var(--lp-rule)]">
                  <th className="py-4 pr-4 text-sm font-bold">月額</th>
                  {PLAN_COLUMNS.map((c) => (
                    <td key={c.tier} className="border-l border-[var(--lp-rule)] px-5 py-4">
                      <span className="f-mono text-[34px] font-semibold tracking-tight">{formatPrice(plansByTier[c.tier].price, plansByTier[c.tier].currency)}</span>
                      <span className="ml-1 text-sm text-[var(--lp-sub)]">/月</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[var(--lp-rule)]">
                  <th className="py-4 pr-4 text-sm font-bold">無料トライアル</th>
                  {PLAN_COLUMNS.map((c) => (
                    <td key={c.tier} className="border-l border-[var(--lp-rule)] px-5 py-4 text-sm">
                      {plansByTier[c.tier].trialDays ? `${plansByTier[c.tier].trialDays}日間` : 'すぐに利用開始'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[var(--lp-rule)] align-top">
                  <th className="py-4 pr-4 text-sm font-bold">含まれるもの</th>
                  {PLAN_COLUMNS.map((c) => (
                    <td key={c.tier} className="border-l border-[var(--lp-rule)] px-5 py-4">
                      <ul className="space-y-1.5 text-sm">
                        {plansByTier[c.tier].features.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span aria-hidden className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-[var(--lp-accent)]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[var(--lp-ink)]">
                  <th className="py-4 pr-4" />
                  {PLAN_COLUMNS.map((c) => (
                    <td key={c.tier} className="border-l border-[var(--lp-rule)] px-5 py-4">
                      <button
                        onClick={() => openSignupWithTier(c.tier)}
                        className={`w-full whitespace-nowrap rounded-[4px] px-4 py-3 text-sm font-bold transition-colors ${
                          c.tier === 'small'
                            ? 'bg-[var(--lp-accent)] text-white hover:bg-[var(--lp-accent-ink)]'
                            : 'border border-[var(--lp-ink)] text-[var(--lp-ink)] hover:bg-[var(--lp-paper)]'
                        }`}
                      >
                        {plansByTier[c.tier].trialDays ? `${plansByTier[c.tier].trialDays}日間無料で始める` : '今すぐ始める'}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 sm:mt-10 grid gap-0 md:hidden border-t border-l border-[var(--lp-ink)]">
            {([
              { tier: 'small', label: 'Small', plan: smallPlan },
              { tier: 'standard', label: 'Standard', plan: standardPlan },
              { tier: 'business', label: 'Business', plan: businessPlan },
            ] as const).map(({ tier, label, plan }) => (
              <div key={tier} className="flex flex-col border-r border-b border-[var(--lp-ink)] p-5 sm:p-6">
                <p className="f-mono text-xs tracking-[0.15em] text-[var(--lp-sub)]">{label}</p>
                <p className="mt-1 font-bold text-[var(--lp-ink)]">〜{plan.maxMembers}名</p>
                <p className="mt-5 flex items-baseline gap-1 text-[var(--lp-ink)]">
                  <span className="f-mono text-4xl sm:text-[42px] font-semibold tracking-tight">{formatPrice(plan.price, plan.currency)}</span>
                  <span className="text-sm text-[var(--lp-sub)]">/月</span>
                </p>
                <p className="mt-1 text-xs text-[var(--lp-sub)]">
                  {plan.trialDays ? `${plan.trialDays}日間無料トライアル` : 'すぐに利用開始'}
                </p>
                <ul className="mt-5 space-y-2 border-t border-[var(--lp-rule)] pt-4 text-sm text-[var(--lp-ink)] flex-grow">
                  {plan.features.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 bg-[var(--lp-accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openSignupWithTier(tier)}
                  className={`mt-6 rounded-[4px] px-4 py-3 text-sm font-bold transition-colors ${
                    tier === 'small'
                      ? 'bg-[var(--lp-accent)] text-white hover:bg-[var(--lp-accent-ink)]'
                      : 'border border-[var(--lp-ink)] text-[var(--lp-ink)] hover:bg-[var(--lp-paper)]'
                  }`}
                >
                  {plan.trialDays ? `${plan.trialDays}日間無料で始める` : '今すぐ始める'}
                </button>
              </div>
            ))}
          </div>

          <div className="grid border-l border-[var(--lp-ink)] md:border-l-0 md:grid-cols-3">
            <div className="md:col-span-2 border-r border-b border-[var(--lp-ink)] p-5 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm sm:text-base text-[var(--lp-ink)]">
                40名を超えるチームは <strong>Enterprise（個別見積）</strong> のご案内になります。
              </p>
              <button
                type="button"
                onClick={() => handleEnterpriseInquiryClick(false)}
                className="shrink-0 text-sm font-bold text-[var(--lp-accent-ink)] hover:underline"
              >
                Enterpriseの詳細・相談フォームへ →
              </button>
            </div>
            <div className="border-r border-b border-[var(--lp-ink)] p-5 sm:p-6">
              <p className="text-sm text-[var(--lp-ink)]">
                学生プラン（{studentPrice}/月）は対象ドメイン: {studentDomainsLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* ENTERPRISE MODAL */}
      {/* ============================================ */}
      {/* Enterprise Modal */}
      <AnimatePresence>
        {showEnterpriseModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowEnterpriseModal(false)} />
            <motion.div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <button
                type="button"
                onClick={() => setShowEnterpriseModal(false)}
                className="absolute right-4 top-4 z-10 rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
              <div className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-[#1e3a5f] bg-[#1e3a5f]/10 px-3 py-1.5 rounded-full border border-[#1e3a5f]/20 mb-3">
                    Enterprise
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-2">41名以上のチーム向け</h2>
                  <p className="text-sm text-[#64748b]">利用人数・運用体制に合わせて、導入設計とお見積りをご提案します。</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 mb-6">
                  <h3 className="text-sm font-bold text-[#1e3a5f] mb-3">Enterpriseでできること</h3>
                  <ul className="space-y-2 text-sm text-[#334155]">
                    {['41名以上の組織に合わせた運用設計', '導入オンボーディング・定着支援', '請求書払いなどの法人契約オプション', '料金は利用規模に応じた個別見積'].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#00b4d8] flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {enterpriseSubmitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1e3a5f]">送信完了しました</h3>
                    <p className="text-sm text-[#64748b]">担当者より折り返しご連絡いたします。</p>
                    <p className="text-xs text-[#94a3b8]">メールが届かない場合はアドレスの入力間違いの可能性があります。<br />お手数ですが再度お問い合わせください。</p>
                    <button
                      type="button"
                      onClick={() => { setShowEnterpriseModal(false); setEnterpriseSubmitted(false); setEnterpriseForm({ companyName: '', contactName: '', email: '', teamSize: '', phone: '', message: '' }); }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
                    >
                      閉じる
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEnterpriseSubmit} className="space-y-4">
                    <h3 className="text-sm font-bold text-[#1e3a5f]">相談フォーム</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input type="text" required placeholder="会社名" value={enterpriseForm.companyName} onChange={(e) => handleEnterpriseFieldChange('companyName', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm" />
                      <input type="text" required placeholder="担当者名" value={enterpriseForm.contactName} onChange={(e) => handleEnterpriseFieldChange('contactName', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input type="email" required placeholder="メールアドレス" value={enterpriseForm.email} onChange={(e) => handleEnterpriseFieldChange('email', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm" />
                      <input type="tel" placeholder="電話番号（任意）" value={enterpriseForm.phone} onChange={(e) => handleEnterpriseFieldChange('phone', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm" />
                    </div>
                    <input type="number" min={41} required placeholder="想定利用人数（41以上）" value={enterpriseForm.teamSize} onChange={(e) => handleEnterpriseFieldChange('teamSize', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm" />
                    <textarea rows={3} required placeholder="相談内容（導入時期、運用課題など）" value={enterpriseForm.message} onChange={(e) => handleEnterpriseFieldChange('message', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm resize-y" />
                    <button type="submit" disabled={enterpriseLoading} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2a4a73] px-4 py-3 text-sm font-semibold text-white hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed">
                      {enterpriseLoading ? '送信中...' : '相談内容を送信する'}
                      {!enterpriseLoading && <ArrowRight size={14} />}
                    </button>
                    {enterpriseError && <p className="text-xs text-red-600">{enterpriseError}</p>}
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* 05 導入の流れ */}
      {/* ============================================ */}
      <section id="flow" className="bg-[var(--lp-paper)] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead no="05 — 導入" title={<>2ステップで、<br />始められる。</>} />
          <div className="mt-8 sm:mt-10 grid md:grid-cols-2 border-t border-l border-[var(--lp-ink)]">
            <div className="border-r border-b border-[var(--lp-ink)] p-5 sm:p-7 bg-white">
              <SectionLabel no="STEP 01" />
              <h3 className="f-display mt-2 text-2xl font-black text-[var(--lp-ink)]">デモで操作確認</h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--lp-sub)]">
                アカウント登録なしで、すぐに触れます。データは保存されないので、安心して試せます。
              </p>
              <button onClick={handleDemoClick} className="mt-5 rounded-[4px] border border-[var(--lp-ink)] px-5 py-3 text-sm font-bold text-[var(--lp-ink)] hover:bg-[var(--lp-paper)] transition-colors">
                デモを試す →
              </button>
            </div>
            <div className="border-r border-b border-[var(--lp-ink)] p-5 sm:p-7 bg-white">
              <SectionLabel no="STEP 02" />
              <h3 className="f-display mt-2 text-2xl font-black text-[var(--lp-ink)]">14日トライアル</h3>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--lp-sub)]">
                自分の組織・現場で実データを使って運用。申込前に契約条件と支払画面、継続しない場合の手続き・期限を確認してください。
              </p>
              <button onClick={handleTrialClick} className="mt-5 rounded-[4px] bg-[var(--lp-accent)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--lp-accent-ink)] transition-colors">
                トライアルを開始 →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 06 FAQ */}
      {/* ============================================ */}
      <section id="faq" className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 border-t border-[var(--lp-ink)] pt-5">
              <SectionLabel no="06 — 質問" />
              <h2 className="f-display mt-3 text-[28px] sm:text-4xl font-black text-[var(--lp-ink)]">よくある質問</h2>
            </div>
          </div>
          <div className="lg:col-span-8 border-t border-[var(--lp-ink)]">
            {COMPASS_FAQ.map((faq) => (
              <details key={faq.question} className="group border-b border-[var(--lp-rule)]">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 sm:py-5">
                  <span className="font-bold text-[var(--lp-ink)]">{faq.question}</span>
                  <span aria-hidden className="f-mono text-lg leading-none text-[var(--lp-sub)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-5 text-sm sm:text-base leading-relaxed text-[var(--lp-sub)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 07 サークル */}
      {/* ============================================ */}
      <section id="circle" className="bg-[var(--lp-paper)] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead
            no="07 — もっと学びたい方へ"
            title="AI×建築サークル"
            lead="建築業界に特化したAI活用を学ぶ会員制コミュニティ。ChatGPT・画像生成AI・業務自動化など、実践的な勉強会やセミナーを毎月開催。メンバー同士の情報交換や、最新AI事例の共有も活発です。"
          />
          <div className="mt-8 grid border-t border-l border-[var(--lp-ink)] md:grid-cols-4">
            {[
              { k: '会員特典', v: 'Compass 3名分が無料で付属' },
              { k: '機能', v: 'Smallプラン相当の機能を無料で利用可能' },
              { k: '学び', v: 'AI学習コンテンツ・勉強会すべて利用可' },
              { k: '月額料金', v: '¥5,000/月' },
            ].map((row) => (
              <div key={row.k} className="border-r border-b border-[var(--lp-ink)] bg-white p-4 sm:p-5">
                <p className="f-mono text-[11px] tracking-[0.15em] text-[var(--lp-sub)]">{row.k}</p>
                <p className="mt-1 font-bold text-[var(--lp-ink)]">{row.v}</p>
              </div>
            ))}
          </div>
          <a
            href="https://ai-archi-circle.archi-prisma.co.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block text-sm sm:text-base font-bold text-[var(--lp-accent-ink)] hover:underline"
          >
            サークルについて詳しく →
          </a>
        </div>
      </section>

      {/* ============================================ */}
      {/* 08 更新情報 */}
      {/* ============================================ */}
      <section id="updates" className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHead
            no="08 — 更新情報"
            title="Compassのアップデート情報"
            lead="機能追加、改善、不具合対応、メンテナンス予定をまとめて確認できます。最新の変更点は専用ページに時系列で掲載します。"
          />
          <ul className="mt-8 border-t border-[var(--lp-ink)]">
            {featuredUpdates.map((u) => (
              <li key={u.slug} className="border-b border-[var(--lp-rule)]">
                <a href={`/updates/${u.slug}`} className="grid gap-1 py-4 sm:grid-cols-12 sm:gap-4 hover:bg-[var(--lp-paper)] transition-colors">
                  <time dateTime={u.publishedAtIso} className="sm:col-span-2 f-mono text-sm text-[var(--lp-sub)]">{u.publishedAt}</time>
                  <span className="sm:col-span-2 text-sm text-[var(--lp-sub)]">{u.category}</span>
                  <span className="sm:col-span-8 font-bold text-[var(--lp-ink)]">{u.title}</span>
                </a>
              </li>
            ))}
          </ul>
          <a href="/updates" className="mt-5 inline-block text-sm sm:text-base font-bold text-[var(--lp-accent-ink)] hover:underline">
            すべての更新を見る →
          </a>
        </div>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA */}
      {/* ============================================ */}
      <section className="border-t border-[var(--lp-ink)] py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-8 lg:grid-cols-12 items-end">
          <h2 className="f-display lg:col-span-7 text-[34px] leading-[1.2] sm:text-5xl lg:text-6xl font-black text-[var(--lp-ink)]">
            迷わない現場へ。
            <br />
            <span className="text-[var(--lp-accent)]">Compassを始めよう</span>
          </h2>
          <div className="lg:col-span-5">
            <p className="text-sm sm:text-base leading-relaxed text-[var(--lp-sub)]">
              14日間の無料トライアルについて、申込前に契約条件と支払画面を確認してください。
              継続しない場合の手続きと期限も申込前に確認できます。
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button onClick={handleTrialClick} className="whitespace-nowrap rounded-[4px] bg-[var(--lp-accent)] px-5 py-3.5 text-base font-bold text-white hover:bg-[var(--lp-accent-ink)] transition-colors">
                無料トライアルを開始 →
              </button>
              <button onClick={handleDemoClick} className="whitespace-nowrap rounded-[4px] border border-[var(--lp-ink)] px-5 py-3.5 text-base font-bold text-[var(--lp-ink)] hover:bg-[var(--lp-paper)] transition-colors">
                まずはデモを試す
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="border-t border-[var(--lp-rule)] bg-[var(--lp-paper)] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <img src="/compass-logo.png" alt="Compass" className="h-6 w-auto self-start" draggable="false" onContextMenu={(e) => e.preventDefault()} />
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--lp-sub)]">
              {[
                { label: '利用規約', href: '/terms' },
                { label: 'プライバシーポリシー', href: '/privacy' },
                { label: '特定商取引法', href: '/legal' },
                { label: 'ヘルプ', href: '/help' },
                { label: '更新情報', href: '/updates' },
                { label: 'アプリへログイン', href: 'https://app.compass.archi-prisma.co.jp/' },
              ].map((item) => (
                <a key={item.label} href={item.href} className="hover:text-[var(--lp-ink)] transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-[var(--lp-rule)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-xs text-[var(--lp-sub)]">
              <span>Developed by</span>
              <img src="/archiprisma_dev logo.png" alt="ARCHI-PRISMA" className="h-8 w-auto" draggable="false" onContextMenu={(e) => e.preventDefault()} />
            </div>
            <p className="text-xs text-[var(--lp-sub)]">© {new Date().getFullYear()} APDW Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ============================================ */}
      {/* SIGNUP MODAL */}
      {/* ============================================ */}
      <AnimatePresence>
        {showSignupModal && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignupModal(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowSignupModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full hover:bg-slate-100 transition"
              >
                <X size={18} className="text-slate-400 sm:w-5 sm:h-5" />
              </button>

              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-1 sm:mb-2">
                  Compassを始める
                </h3>
                <p className="text-[#64748b] text-xs sm:text-sm">
                  メールアドレスを入力してください
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="signup-email" className="block text-xs sm:text-sm font-medium text-[#1e3a5f] mb-1.5 sm:mb-2">
                    メールアドレス
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#1e3a5f] mb-1.5 sm:mb-2">
                    プランを選択
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTier('small')}
                      className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition ${
                        selectedTier === 'small'
                          ? 'border-[#00b4d8] bg-[#00b4d8]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-xs sm:text-sm text-[#1e3a5f]">Small</p>
                      <p className="text-[10px] sm:text-xs text-[#64748b]">〜{smallPlan.maxMembers}名</p>
                      <p className="text-xs sm:text-sm font-bold text-[#1e3a5f] mt-1">{formatPrice(smallPlan.price, smallPlan.currency)}/月</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTier('standard')}
                      className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition ${
                        selectedTier === 'standard'
                          ? 'border-[#00b4d8] bg-[#00b4d8]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-xs sm:text-sm text-[#1e3a5f]">Standard</p>
                      <p className="text-[10px] sm:text-xs text-[#64748b]">〜{standardPlan.maxMembers}名</p>
                      <p className="text-xs sm:text-sm font-bold text-[#1e3a5f] mt-1">{formatPrice(standardPlan.price, standardPlan.currency)}/月</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTier('business')}
                      className={`p-2.5 sm:p-3 rounded-xl border-2 text-left transition ${
                        selectedTier === 'business'
                          ? 'border-[#00b4d8] bg-[#00b4d8]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-xs sm:text-sm text-[#1e3a5f]">Business</p>
                      <p className="text-[10px] sm:text-xs text-[#64748b]">〜{businessPlan.maxMembers}名</p>
                      <p className="text-xs sm:text-sm font-bold text-[#1e3a5f] mt-1">{formatPrice(businessPlan.price, businessPlan.currency)}/月</p>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-[#64748b]">
                    40名を超える場合は
                    {' '}
                    <button
                      type="button"
                      onClick={() => handleEnterpriseInquiryClick(true)}
                      className="font-semibold text-[#0077b6] underline hover:text-[#005f8f]"
                    >
                      Enterpriseへお問い合わせ
                    </button>
                  </p>
                </div>

                {/* 学生判定表示 */}
                {signupEmail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm ${
                      isStudentEmail
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {isStudentEmail ? (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
                        <span><strong>学生プラン適用</strong> - 永久無料でご利用いただけます</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Clock size={14} className="sm:w-4 sm:h-4" />
                        <span><strong>{selectedPlan.trialDays ?? 0}日間無料トライアル</strong> - 申込前に契約条件と支払画面を確認してください。</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {signupError && (
                  <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm border border-red-200">
                    {signupError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={signupLoading || !signupEmail}
                  className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg bg-gradient-to-r from-[#00b4d8] to-[#0096b8] text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signupLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      処理中...
                    </span>
                  ) : isStudentEmail ? (
                    '無料で始める'
                  ) : (
                    `${selectedPlan.trialDays ?? 0}日間無料で始める`
                  )}
                </button>

                <p className="text-[10px] sm:text-xs text-center text-[#94a3b8]">
                  続行することで、<a href="/terms" className="underline hover:text-[#00b4d8]">利用規約</a>と
                  <a href="/privacy" className="underline hover:text-[#00b4d8]">プライバシーポリシー</a>に同意したものとみなされます。
                </p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppWithBoundary() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}

export default AppWithBoundary;

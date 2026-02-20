import { Component, type ErrorInfo, type ReactNode, useState, useEffect, useRef, createElement } from 'react';
import { motion as framerMotion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Users,
  Calendar,
  BarChart3,
  ArrowRight,
  Play,
  Clock,
  Bell,
  FileSpreadsheet,
  Menu,
  X,
  ChevronDown,
  Volume2,
  VolumeX,
} from 'lucide-react';
import './index.css';

const motion = framerMotion;
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
    return createElement(tag, stripMotionProps(props), children as any);
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
// ANIMATED TEXT REVEAL
// ============================================
function DesktopTextReveal({
  children,
  className = '',
  delay = 0
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const words = children.split(' ');

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{
              duration: 0.5,
              delay: delay + i * 0.05,
              ease: [0.33, 1, 0.68, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
}

function TextReveal({
  children,
  className = '',
  delay = 0
}: {
  children: string;
  className?: string;
  delay?: number;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <span className={className}>{children}</span>;
  }

  return (
    <DesktopTextReveal
      children={children}
      className={className}
      delay={delay}
    />
  );
}

// ============================================
// ANIMATED COUNTER
// ============================================
function AnimatedCounter({
  value,
  duration = 2
}: {
  value: number;
  duration?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  return <span ref={ref}>{displayValue}</span>;
}

// ============================================
// SCROLL PROGRESS SECTION
// ============================================
function DesktopStickySection({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, -60]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StickySection({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <DesktopStickySection className={className}>
      {children}
    </DesktopStickySection>
  );
}

function DesktopProgressBar() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00b4d8] to-[#0077b6] origin-left z-[100]"
      style={{ scaleX: smoothProgress }}
    />
  );
}

function DesktopHeroBlobs() {
  const { scrollYProgress } = useScroll();
  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <>
      <motion.div
        className="absolute top-20 left-0 w-[600px] h-[600px] bg-[#00b4d8]/5 rounded-full blur-[100px]"
        style={{ y: blobY1 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1e3a5f]/5 rounded-full blur-[100px]"
        style={{ y: blobY2 }}
      />
    </>
  );
}

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
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 申し込みモーダル用state
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState<'small' | 'standard'>('small');
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
  const smallPlan = plans.small ?? DEFAULT_PLANS.small;
  const standardPlan = plans.standard ?? DEFAULT_PLANS.standard;
  const studentPlan = plans.student ?? DEFAULT_PLANS.student;
  const selectedPlan = selectedTier === 'standard' ? standardPlan : smallPlan;
  const selectedPrice = formatPrice(selectedPlan.price, selectedPlan.currency);
  const studentPrice = formatPrice(studentPlan.price, studentPlan.currency);
  const studentDomainsLabel = (studentPlan.eligibleDomains ?? DEFAULT_PLANS.student.eligibleDomains ?? []).join(' / ');

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isMobile) return;

    video.muted = true;
    setIsMuted(true);

    const tryAutoplay = async () => {
      try {
        await video.play();
        setIsVideoPlaying(true);
      } catch {
        setIsVideoPlaying(false);
      }
    };

    void tryAutoplay();
  }, [isMobile]);

  const handleDemoClick = () => {
    window.location.href = 'https://compass-demo.web.app/';
  };

  const openSignupWithTier = (tier: 'small' | 'standard') => {
    setShowSignupModal(true);
    setSignupEmail('');
    setSignupError(null);
    setSelectedTier(tier);
  };
  const handleTrialClick = () => {
    openSignupWithTier('small');
  };

  const scrollToEnterpriseForm = () => {
    document.getElementById('enterprise-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnterpriseInquiryClick = (closeSignupModal = false) => {
    if (closeSignupModal) {
      setShowSignupModal(false);
      window.setTimeout(scrollToEnterpriseForm, 150);
      return;
    }
    scrollToEnterpriseForm();
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
    } catch (err: any) {
      setEnterpriseError(err.message || '送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setEnterpriseLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1e293b] overflow-x-hidden">
      {/* Progress bar */}
      {!isMobile && <DesktopProgressBar />}

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,border-color] duration-500 ${
          scrolled
            ? `${isMobile ? 'bg-white' : 'bg-white/90 backdrop-blur-xl'} shadow-sm border-b border-slate-100`
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img src="/compass-logo.png" alt="Compass" className="h-6 sm:h-7 md:h-8 w-auto" draggable="false" onContextMenu={(e) => e.preventDefault()} />
            </motion.div>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: '機能', href: '#features' },
                { label: '料金', href: '#pricing' },
                { label: '導入', href: '#flow' },
                { label: 'サークル', href: '#circle' },
              ].map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#1e3a5f] transition-colors rounded-lg hover:bg-slate-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            <motion.div
              className="hidden md:flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                onClick={handleDemoClick}
                className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#1e3a5f] transition-colors"
              >
                デモを試す
              </button>
              <motion.button
                onClick={handleTrialClick}
                className="px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-[#00b4d8] to-[#0096b8] text-white shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-2">
                  無料で始める
                  <ArrowRight size={16} />
                </span>
              </motion.button>
            </motion.div>

            <button
              className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} className="text-[#1e3a5f] sm:w-6 sm:h-6" /> : <Menu size={20} className="text-[#1e3a5f] sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden bg-white border-t border-slate-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-6 py-6 space-y-4">
                {[
                  { label: '機能', href: '#features' },
                  { label: '料金', href: '#pricing' },
                  { label: '導入', href: '#flow' },
                  { label: 'サークル', href: '#circle' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-[#1e293b] font-medium"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-4 space-y-3">
                  <button onClick={() => { handleDemoClick(); setMobileMenuOpen(false); }} className="w-full py-3 text-[#1e3a5f] font-medium border border-slate-200 rounded-xl">
                    デモを試す
                  </button>
                  <button onClick={() => { handleTrialClick(); setMobileMenuOpen(false); }} className="w-full py-3 bg-gradient-to-r from-[#00b4d8] to-[#0096b8] text-white font-semibold rounded-xl">
                    無料で始める
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden bg-gradient-to-b from-white via-[#f8fafc] to-white">
        {/* Background decorations with parallax */}
        <div className="absolute inset-0 overflow-hidden">
          {isMobile ? (
            <>
              <div className="absolute top-20 left-0 w-[300px] h-[300px] bg-[#00b4d8]/3 rounded-full" />
              <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-[#1e3a5f]/3 rounded-full" />
            </>
          ) : (
            <DesktopHeroBlobs />
          )}
        </div>

        {/* Grid pattern */}
        {!isMobile && <div className="absolute inset-0 bg-[linear-gradient(rgba(30,58,95,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,95,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 lg:pt-32 pb-8">
          {/* Hero Visual - Video (Top) */}
          <motion.div
            className="relative max-w-5xl mx-auto mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Glow effect behind (desktop only — blur is GPU-heavy on mobile) */}
            {!isMobile && <div className="absolute -inset-4 bg-gradient-to-r from-[#00b4d8]/20 via-[#0077b6]/20 to-[#1e3a5f]/20 rounded-3xl blur-2xl" />}

            {/* Video */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 bg-white">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload={isMobile ? 'metadata' : 'auto'}
                poster={isMobile ? '/dashboard.png' : undefined}
                className="w-full h-auto"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              >
                <source src="/compass-intro.mp4" type="video/mp4" />
              </video>

              {/* Mobile play fallback when autoplay is blocked */}
              {isMobile && !isVideoPlaying && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!videoRef.current) return;
                    try {
                      await videoRef.current.play();
                      setIsVideoPlaying(true);
                    } catch {
                      setIsVideoPlaying(false);
                    }
                  }}
                  className="absolute inset-0 m-auto h-12 w-28 rounded-full bg-[#1e3a5f]/80 text-white text-sm font-semibold backdrop-blur-sm hover:bg-[#1e3a5f] transition-colors"
                >
                  再生
                </button>
              )}

              {/* Mute toggle button */}
              <motion.button
                onClick={toggleMute}
                className={`absolute bottom-4 right-4 p-3 rounded-full bg-[#1e3a5f]/80 text-white hover:bg-[#1e3a5f] transition-colors ${isMobile ? '' : 'backdrop-blur-sm'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </motion.button>
            </div>
          </motion.div>

          {/* Text Content - Centered */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Main copy */}
            <motion.h1
              className="text-2xl sm:text-4xl lg:text-6xl font-extrabold leading-[1.2] sm:leading-[1.1] mb-4 sm:mb-6 tracking-tight text-[#1e3a5f]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="block sm:inline">すべての現場に、</span>
              <span className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">Compass</span>を。
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg lg:text-xl text-[#64748b] mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto px-2 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              今どこにいて、次に何をすべきかが一目でわかる。
              <br className="hidden sm:block" />
              だから現場が迷わず、プロジェクトが前に進む。
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <motion.button
                onClick={handleTrialClick}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg bg-gradient-to-r from-[#00b4d8] to-[#0096b8] text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  14日間無料で試す
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </span>
              </motion.button>

              <motion.button
                onClick={handleDemoClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg bg-white text-[#1e3a5f] border border-slate-200 hover:border-[#00b4d8]/50 hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={18} className="text-[#00b4d8] sm:w-5 sm:h-5" />
                デモを試す
              </motion.button>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm text-[#64748b]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#00b4d8] sm:w-4 sm:h-4" />
                クレジットカード不要
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#00b4d8] sm:w-4 sm:h-4" />
                いつでもキャンセル可
              </span>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-[#1e3a5f]/20 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-[#1e3a5f]/40 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>


      {/* ============================================ */}
      {/* STATS - RESULTS */}
      {/* ============================================ */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StickySection className="text-center mb-8 sm:mb-12 lg:mb-16">
            <motion.span
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#00b4d8]/20 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              導入効果
            </motion.span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1e3a5f]">
              数字で見る<span className="text-[#00b4d8]">Compass</span>
            </h2>
          </StickySection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { value: 30, unit: '%', label: '工数削減', sub: '平均' },
              { value: 85, unit: '%', label: '情報共有の改善', sub: '利用者調査' },
              { value: 2, unit: '時間', label: '週あたりの会議削減', sub: '平均' },
              { value: 98, unit: '%', label: '継続利用率', sub: 'トライアル後' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-[#f8fafc] border border-slate-100"
                initial={isMobile ? undefined : { opacity: 0, y: 40, scale: 0.95 }}
                whileInView={isMobile ? undefined : { opacity: 1, y: 0, scale: 1 }}
                transition={isMobile ? undefined : { delay: i * 0.15, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                viewport={isMobile ? undefined : { once: true, margin: '-50px' }}
                whileHover={isMobile ? undefined : { y: -8, boxShadow: '0 20px 40px -12px rgba(0, 180, 216, 0.15)' }}
              >
                <div className="flex items-end justify-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                  <span className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-[#1e3a5f]">
                    <AnimatedCounter value={stat.value} duration={2} />
                  </span>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00b4d8] mb-1 sm:mb-2">{stat.unit}</span>
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-[#1e3a5f] font-semibold mb-0.5 sm:mb-1">{stat.label}</p>
                <p className="text-xs sm:text-sm text-[#64748b]">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* WHY COMPASS - DIFFERENTIATOR */}
      {/* ============================================ */}
      <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StickySection className="text-center mb-8 sm:mb-12 lg:mb-16">
            <motion.span
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#00b4d8]/20 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              なぜCompassか
            </motion.span>
            <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold text-[#1e3a5f] mb-4 sm:mb-6 px-2">
              羅針盤のように、<span className="text-[#00b4d8]">進むべき道</span>を示す
            </h2>
            <p className="text-[#64748b] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-2">
              現在地と目的地が一目でわかるから、迷わない。
              <br className="hidden sm:block" />
              見ればわかる、触ればできる。だから<strong className="text-[#1e3a5f]">現場に定着する</strong>。
            </p>
          </StickySection>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Comparison */}
            <motion.div
              initial={isMobile ? undefined : { opacity: 0, x: -50 }}
              whileInView={isMobile ? undefined : { opacity: 1, x: 0 }}
              transition={isMobile ? undefined : { duration: 0.6 }}
              viewport={isMobile ? undefined : { once: true }}
            >
              <div className="bg-[#f8fafc] rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border border-slate-100">
                <h3 className="text-base sm:text-lg font-bold text-[#64748b] mb-4 sm:mb-6">他ツールでよくある悩み</h3>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    '画面が複雑で何をすればいいかわからない',
                    '設定項目が多すぎて挫折する',
                    '使い方の説明に時間がかかる',
                    'ベテラン社員が使ってくれない',
                    '結局Excelに戻ってしまう',
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base text-[#64748b]"
                      initial={isMobile ? undefined : { opacity: 0, x: -20 }}
                      whileInView={isMobile ? undefined : { opacity: 1, x: 0 }}
                      transition={isMobile ? undefined : { delay: 0.3 + i * 0.1, duration: 0.4 }}
                      viewport={isMobile ? undefined : { once: true }}
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Compass advantages */}
            <motion.div
              initial={isMobile ? undefined : { opacity: 0, x: 50 }}
              whileInView={isMobile ? undefined : { opacity: 1, x: 0 }}
              transition={isMobile ? undefined : { duration: 0.6 }}
              viewport={isMobile ? undefined : { once: true }}
            >
              <div className="bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 text-white">
                <h3 className="text-base sm:text-lg font-bold text-cyan-100 mb-4 sm:mb-6">Compassなら</h3>
                <ul className="space-y-3 sm:space-y-4">
                  {[
                    '開いた瞬間、何をすべきかわかる',
                    'ボタンは最小限、迷う要素がない',
                    '説明なしで誰でも使い始められる',
                    '60代の職人さんも初日から活用',
                    'スマホで3タップ、進捗報告完了',
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base"
                      initial={isMobile ? undefined : { opacity: 0, x: 20 }}
                      whileInView={isMobile ? undefined : { opacity: 1, x: 0 }}
                      transition={isMobile ? undefined : { delay: 0.3 + i * 0.1, duration: 0.4 }}
                      viewport={isMobile ? undefined : { once: true }}
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Key differentiators */}
          <div className="mt-10 sm:mt-12 lg:mt-16 grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: '3秒で理解できるUI',
                description: '画面を開いた瞬間「これを押せばいい」がわかる。考える時間ゼロの直感設計。',
              },
              {
                title: '学習コストゼロ',
                description: 'マニュアルも研修も不要。LINEが使えれば、Compassも使える。それくらいシンプル。',
              },
              {
                title: '現場で本当に使われる',
                description: '「また新しいツール？」と言っていた職人さんが、翌日から自発的に入力してくれる。',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="text-center p-4 sm:p-6"
                initial={isMobile ? undefined : { opacity: 0, y: 30 }}
                whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                transition={isMobile ? undefined : { delay: i * 0.1 }}
                viewport={isMobile ? undefined : { once: true }}
              >
                <h4 className="text-lg sm:text-xl font-bold text-[#1e3a5f] mb-2 sm:mb-3">{item.title}</h4>
                <p className="text-sm sm:text-base text-[#64748b]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PAIN POINTS SECTION */}
      {/* ============================================ */}
      <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <StickySection className="text-center mb-10 sm:mb-16 lg:mb-20">
            <motion.span
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#1e3a5f] bg-[#1e3a5f]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#1e3a5f]/20 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              よくある課題
            </motion.span>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 text-[#1e3a5f]">
              <TextReveal>こんな課題、</TextReveal>
              <br />
              <TextReveal delay={0.2}>ありませんか？</TextReveal>
            </h2>
          </StickySection>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: FileSpreadsheet,
                title: '情報がバラバラ',
                description: 'Excel、ホワイトボード、LINE...複数ツールに分散し、最新情報がどれか分からない。',
                color: '#1e3a5f',
              },
              {
                icon: Users,
                title: '進捗が見えない',
                description: '誰が何をやっているか把握できない。確認のための会議や電話が増える一方。',
                color: '#1e3a5f',
              },
              {
                icon: Clock,
                title: '遅延に気づけない',
                description: '締切が迫っても気づかず後手に。問題が大きくなってから発覚する。',
                color: '#1e3a5f',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={isMobile ? undefined : { opacity: 0, y: 50 }}
                whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                transition={isMobile ? undefined : { delay: i * 0.15, duration: 0.6 }}
                viewport={isMobile ? undefined : { once: true, margin: '-100px' }}
              >
                <motion.div
                  className="h-full bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border border-slate-100 shadow-sm"
                  whileHover={isMobile ? undefined : { y: -4, boxShadow: '0 12px 40px rgba(30, 58, 95, 0.08)' }}
                  transition={isMobile ? undefined : { duration: 0.3 }}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-[#1e3a5f]">{item.title}</h3>
                  <p className="text-sm sm:text-base text-[#64748b] leading-relaxed">{item.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================ */}
      <section id="features" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <StickySection className="text-center mb-10 sm:mb-16 lg:mb-20">
            <motion.span
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#00b4d8]/20 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              主な機能
            </motion.span>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 text-[#1e3a5f]">
              <TextReveal>Compassで</TextReveal>
              <br />
              <span className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">できること</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-[#64748b] max-w-2xl mx-auto px-2">
              プロジェクトの全体像を把握し、日々の進捗を確実に回すための機能を完備
            </p>
          </StickySection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: BarChart3, title: 'ガントチャート', description: '工程を視覚的に管理。依存関係や進捗状況が一目でわかり、計画の見直しも簡単。', color: '#00b4d8' },
              { icon: CheckCircle2, title: 'タスク管理', description: '担当・締切・進捗を一元化。ステータス管理で抜け漏れなく、確実に完了へ。', color: '#00b4d8' },
              { icon: Users, title: 'チーム招待', description: '現場も設計も、必要なメンバーを簡単招待。プロジェクトごとの権限管理も。', color: '#00b4d8' },
              { icon: Calendar, title: 'カレンダー連携', description: 'Googleカレンダーと同期し、予定を見える化。リマインダーで締切を逃さない。', color: '#00b4d8' },
              { icon: Bell, title: '通知・リマインド', description: '締切前や進捗変更時に自動通知。重要な変更を見逃さず、素早く対応。', color: '#00b4d8' },
              { icon: FileSpreadsheet, title: 'Excel連携', description: '既存のExcelデータをインポート。従来の工程表からスムーズに移行。', color: '#00b4d8' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={isMobile ? undefined : { opacity: 0, y: 30 }}
                whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                transition={isMobile ? undefined : { delay: i * 0.1, duration: 0.5 }}
                viewport={isMobile ? undefined : { once: true, margin: '-50px' }}
              >
                <motion.div
                  className="h-full bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border border-slate-100 shadow-sm"
                  whileHover={isMobile ? undefined : { y: -4, boxShadow: '0 12px 40px rgba(30, 58, 95, 0.08)' }}
                  transition={isMobile ? undefined : { duration: 0.3 }}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-[#1e3a5f]">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-[#64748b] leading-relaxed">{feature.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SCREENSHOT GALLERY */}
      {/* ============================================ */}
      <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StickySection className="text-center mb-8 sm:mb-12 lg:mb-16">
            <motion.span
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#00b4d8]/20 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              画面イメージ
            </motion.span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1e3a5f]">
              <span className="text-[#00b4d8]">実際の画面</span>をご覧ください
            </h2>
          </StickySection>

          <div className="space-y-10 sm:space-y-12 lg:space-y-16">
            {[
              {
                title: 'ガントチャート',
                description: '工程の全体像を視覚化。依存関係・進捗・遅延が一目でわかる。',
                image: '/gantt.png',
              },
              {
                title: 'プロジェクト一覧',
                description: '進行中のプロジェクトを一目で把握。進捗率・期限・予算がカードで見える。',
                image: '/project-list.png',
              },
              {
                title: 'リソース分析',
                description: 'メンバーの稼働状況をリアルタイムで確認。負荷の偏りを防ぐ。',
                image: '/dashboard.png',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-4 sm:gap-6 lg:gap-16 items-center`}
                initial={isMobile ? undefined : { opacity: 0, y: 60, scale: 0.98 }}
                whileInView={isMobile ? undefined : { opacity: 1, y: 0, scale: 1 }}
                transition={isMobile ? undefined : { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                viewport={isMobile ? undefined : { once: true, margin: '-100px' }}
              >
                <div className="lg:w-1/3 text-center lg:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-2 sm:mb-4">{item.title}</h3>
                  <p className="text-sm sm:text-base lg:text-lg text-[#64748b]">{item.description}</p>
                </div>
                <motion.div
                  className="w-full lg:w-2/3"
                  whileHover={isMobile ? undefined : { scale: 1.02 }}
                  transition={isMobile ? undefined : { duration: 0.4 }}
                >
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border border-slate-200 hover:shadow-2xl transition-shadow duration-300">
                    <img src={item.image} alt={item.title} className="w-full h-auto" draggable="false" onContextMenu={(e) => e.preventDefault()} />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PRICING SECTION */}
      {/* ============================================ */}
      <section id="pricing" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#2a4a73] to-[#1e3a5f]">
        {!isMobile && <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <StickySection className="text-center mb-8 sm:mb-12 lg:mb-16">
            <motion.span
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#00b4d8]/30 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              料金プラン
            </motion.span>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white">
              <TextReveal>シンプルな</TextReveal>
              <br />
              <TextReveal delay={0.2}>料金体系</TextReveal>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300">
              Small（〜5名）・Standard（〜15名）の定額制。15名を超える場合はEnterpriseをご案内します。
            </p>
          </StickySection>

          {planError ? (
            <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
              {planError}
            </div>
          ) : null}

          <motion.div
            className="grid gap-4 sm:gap-6 lg:grid-cols-2 max-w-5xl mx-auto"
            initial={isMobile ? undefined : { opacity: 0, y: 50 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            transition={isMobile ? undefined : { duration: 0.6 }}
            viewport={isMobile ? undefined : { once: true }}
          >
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl flex flex-col">
              {!isMobile && <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00b4d8]/10 to-[#0077b6]/10 rounded-full blur-3xl" />}

              <div className="relative text-center flex flex-col flex-grow">
                <p className="text-sm sm:text-base text-[#64748b] mb-2 font-medium">Small（〜{smallPlan.maxMembers}名）</p>
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1e3a5f]">
                    {formatPrice(smallPlan.price, smallPlan.currency)}
                  </span>
                  <span className="text-[#64748b] mb-2 sm:mb-3 text-lg">/月</span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748b] mb-6 sm:mb-10">
                  {smallPlan.trialDays ? `${smallPlan.trialDays}日間無料トライアル` : 'すぐに利用開始'}
                </p>

                <ul className="text-left space-y-3 sm:space-y-4 mb-6 sm:mb-10">
                  {smallPlan.features.map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 sm:gap-3"
                      initial={isMobile ? undefined : { opacity: 0, x: -20 }}
                      whileInView={isMobile ? undefined : { opacity: 1, x: 0 }}
                      transition={isMobile ? undefined : { delay: i * 0.08 }}
                      viewport={isMobile ? undefined : { once: true }}
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00b4d8] flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-[#1e293b]">{item}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => openSignupWithTier('small')}
                  className="w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg bg-gradient-to-r from-[#00b4d8] to-[#0096b8] text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
                  whileHover={isMobile ? undefined : { scale: 1.02 }}
                  whileTap={isMobile ? undefined : { scale: 0.98 }}
                >
                  {smallPlan.trialDays ? `${smallPlan.trialDays}日間無料で始める` : '今すぐ始める'}
                </motion.button>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/50 shadow-xl flex flex-col">
              <div className="text-center flex flex-col flex-grow">
                <p className="text-sm sm:text-base text-[#64748b] mb-2 font-medium">Standard（〜{standardPlan.maxMembers}名）</p>
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1e3a5f]">
                    {formatPrice(standardPlan.price, standardPlan.currency)}
                  </span>
                  <span className="text-[#64748b] mb-2 sm:mb-3 text-lg">/月</span>
                </div>
                <p className="text-xs sm:text-sm text-[#64748b] mb-6 sm:mb-10">
                  {standardPlan.trialDays ? `${standardPlan.trialDays}日間無料トライアル` : 'すぐに利用開始'}
                </p>
              <ul className="text-left space-y-3 sm:space-y-4 mb-6 sm:mb-10">
                {standardPlan.features.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2 sm:gap-3"
                    initial={isMobile ? undefined : { opacity: 0, x: -20 }}
                    whileInView={isMobile ? undefined : { opacity: 1, x: 0 }}
                    transition={isMobile ? undefined : { delay: i * 0.08 }}
                    viewport={isMobile ? undefined : { once: true }}
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00b4d8] flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-[#1e293b]">{item}</span>
                  </motion.li>
                ))}
              </ul>
              <motion.button
                onClick={() => openSignupWithTier('standard')}
                className="w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg bg-gradient-to-r from-[#1e3a5f] to-[#2a4a73] text-white shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all"
                whileHover={isMobile ? undefined : { scale: 1.02 }}
                whileTap={isMobile ? undefined : { scale: 0.98 }}
              >
                {standardPlan.trialDays ? `${standardPlan.trialDays}日間無料で始める` : '今すぐ始める'}
              </motion.button>
              </div>
            </div>
          </motion.div>
          <div className="mt-6 mx-auto max-w-5xl rounded-2xl border border-white/20 bg-white/10 px-5 py-4 sm:px-6 sm:py-5 text-center">
            <p className="text-sm sm:text-base text-slate-100">
              15名を超えるチームは <strong className="text-white">Enterprise（個別見積）</strong> のご案内になります。
            </p>
            <button
              type="button"
              onClick={() => handleEnterpriseInquiryClick(false)}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1e3a5f] hover:bg-slate-100 transition"
            >
              Enterpriseの詳細・相談フォームへ
              <ArrowRight size={14} />
            </button>
          </div>
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-300">
            学生プラン（{studentPrice}/月）は対象ドメイン: {studentDomainsLabel}
          </p>
        </div>
      </section>

      {/* ============================================ */}
      {/* ENTERPRISE SECTION */}
      {/* ============================================ */}
      <section id="enterprise-form" className="py-16 sm:py-20 lg:py-24 bg-[#f8fafc] border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#1e3a5f] bg-[#1e3a5f]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#1e3a5f]/20 mb-4">
              Enterprise
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e3a5f] mb-3">
              16名以上のチーム向け
            </h2>
            <p className="text-sm sm:text-base text-[#64748b] max-w-2xl mx-auto">
              利用人数・運用体制に合わせて、導入設計とお見積りをご提案します。まずは下記フォームからご相談ください。
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="text-lg font-bold text-[#1e3a5f] mb-4">Enterpriseでできること</h3>
              <ul className="space-y-3 text-sm text-[#334155]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00b4d8] flex-shrink-0 mt-0.5" />
                  <span>16名以上の組織に合わせた運用設計</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00b4d8] flex-shrink-0 mt-0.5" />
                  <span>導入オンボーディング・定着支援</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00b4d8] flex-shrink-0 mt-0.5" />
                  <span>請求書払いなどの法人契約オプション</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00b4d8] flex-shrink-0 mt-0.5" />
                  <span>料金は利用規模に応じた個別見積</span>
                </li>
              </ul>
            </div>

            <form onSubmit={handleEnterpriseSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
              <h3 className="text-lg font-bold text-[#1e3a5f]">Enterprise相談フォーム</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="会社名"
                  value={enterpriseForm.companyName}
                  onChange={(e) => handleEnterpriseFieldChange('companyName', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="担当者名"
                  value={enterpriseForm.contactName}
                  onChange={(e) => handleEnterpriseFieldChange('contactName', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  required
                  placeholder="メールアドレス"
                  value={enterpriseForm.email}
                  onChange={(e) => handleEnterpriseFieldChange('email', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm"
                />
                <input
                  type="tel"
                  placeholder="電話番号（任意）"
                  value={enterpriseForm.phone}
                  onChange={(e) => handleEnterpriseFieldChange('phone', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm"
                />
              </div>
              <input
                type="number"
                min={16}
                required
                placeholder="想定利用人数（16以上）"
                value={enterpriseForm.teamSize}
                onChange={(e) => handleEnterpriseFieldChange('teamSize', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm"
              />
              <textarea
                rows={4}
                required
                placeholder="相談内容（導入時期、運用課題など）"
                value={enterpriseForm.message}
                onChange={(e) => handleEnterpriseFieldChange('message', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none transition text-sm resize-y"
              />
              <button
                type="submit"
                disabled={enterpriseLoading || enterpriseSubmitted}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#2a4a73] px-4 py-3 text-sm font-semibold text-white hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enterpriseLoading ? '送信中...' : enterpriseSubmitted ? '送信済み' : '相談内容を送信する'}
                {!enterpriseLoading && !enterpriseSubmitted && <ArrowRight size={14} />}
              </button>
              {enterpriseSubmitted && (
                <p className="text-xs text-emerald-700">
                  送信完了しました。担当者より折り返しご連絡いたします。
                </p>
              )}
              {enterpriseError && (
                <p className="text-xs text-red-600">
                  {enterpriseError}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FLOW SECTION */}
      {/* ============================================ */}
      <section id="flow" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <StickySection className="text-center mb-10 sm:mb-16 lg:mb-20">
            <motion.span
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#00b4d8]/20 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              導入の流れ
            </motion.span>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-[#1e3a5f] flex items-end justify-center gap-1 sm:gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">2ステップ</span>
              <span>で始められる</span>
            </h2>
          </StickySection>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'デモで操作確認',
                description: 'アカウント登録なしで、すぐに触れます。データは保存されないので、安心して試せます。',
                action: { label: 'デモを試す', icon: Play, onClick: handleDemoClick },
                primary: false,
              },
              {
                step: '02',
                title: '14日トライアル',
                description: '自分の組織・現場で実データを使って運用。14日後に自動で課金へ移行（いつでもキャンセル可）。',
                action: { label: 'トライアルを開始', icon: ArrowRight, onClick: handleTrialClick },
                primary: true,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={isMobile ? undefined : { opacity: 0, x: i === 0 ? -50 : 50 }}
                whileInView={isMobile ? undefined : { opacity: 1, x: 0 }}
                transition={isMobile ? undefined : { duration: 0.6, delay: i * 0.2 }}
                viewport={isMobile ? undefined : { once: true }}
              >
                <motion.div
                  className={`h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 ${
                    item.primary
                      ? 'bg-gradient-to-br from-[#00b4d8] to-[#0077b6] text-white'
                      : 'bg-white border border-slate-200 shadow-sm'
                  }`}
                  whileHover={isMobile ? undefined : { y: -4, boxShadow: item.primary ? '0 20px 50px rgba(0, 180, 216, 0.3)' : '0 12px 40px rgba(30, 58, 95, 0.08)' }}
                  transition={isMobile ? undefined : { duration: 0.3 }}
                >
                  <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 ${item.primary ? 'text-white/30' : 'text-slate-100'}`}>
                    {item.step}
                  </div>
                  <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${item.primary ? 'text-white' : 'text-[#1e3a5f]'}`}>{item.title}</h3>
                  <p className={`mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed ${item.primary ? 'text-cyan-100' : 'text-[#64748b]'}`}>
                    {item.description}
                  </p>
                  <button
                    onClick={item.action.onClick}
                    className={`inline-flex items-center gap-2 text-sm sm:text-base font-semibold transition group ${
                      item.primary ? 'text-white hover:text-cyan-100' : 'text-[#00b4d8] hover:text-[#0096b8]'
                    }`}
                  >
                    <item.action.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                    {item.action.label}
                    <ArrowRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ SECTION */}
      {/* ============================================ */}
      <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <StickySection className="text-center mb-8 sm:mb-12 lg:mb-16">
            <motion.span
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#1e3a5f] bg-[#1e3a5f]/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#1e3a5f]/20 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              よくある質問
            </motion.span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1e3a5f]">
              FAQ
            </h2>
          </StickySection>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                q: '導入にどれくらい時間がかかりますか？',
                a: 'アカウント作成後、すぐにご利用いただけます。既存のExcelデータがある場合も、インポート機能で簡単に移行できます。多くのお客様は1日で基本的な運用を開始されています。',
              },
              {
                q: 'ITに詳しくないスタッフでも使えますか？',
                a: 'はい、建築・施工現場の方が直感的に使えるよう設計しています。LINEやExcelが使える方であれば問題なくお使いいただけます。導入時のサポートも行っています。',
              },
              {
                q: 'スマートフォンからも使えますか？',
                a: 'はい、iOS/Androidのブラウザから利用可能です。現場からの進捗報告や、外出先での確認に便利です。',
              },
              {
                q: '途中でプランを変更できますか？',
                a: 'Small（〜5名）からStandard（〜15名）へのアップグレードはいつでも可能です。プロジェクトの規模に応じて柔軟に変更いただけます。',
              },
              {
                q: 'データのセキュリティは大丈夫ですか？',
                a: 'すべての通信はSSL暗号化されており、データは国内のセキュアなサーバーで管理しています。定期的なバックアップも実施しています。',
              },
              {
                q: '無料トライアル後、自動で課金されますか？',
                a: 'トライアル終了前にメールでお知らせします。継続をご希望されない場合は、トライアル期間中にキャンセルいただければ課金は発生しません。',
              },
            ].map((faq, i) => (
              <motion.details
                key={i}
                className="group bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <summary className="flex items-center justify-between p-4 sm:p-6 cursor-pointer list-none">
                  <span className="font-semibold text-sm sm:text-base text-[#1e3a5f] pr-3 sm:pr-4">{faq.q}</span>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#64748b] flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-[#64748b] leading-relaxed">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CIRCLE SECTION */}
      {/* ============================================ */}
      <section id="circle" className="py-12 sm:py-16 lg:py-24 relative overflow-hidden bg-gradient-to-br from-[#10233a] via-[#1e3a5f] to-[#162a45]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,180,216,0.18),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.12),transparent_45%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <StickySection className="max-w-3xl mx-auto text-center">
            <motion.span
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#7dd3fc] bg-[#00b4d8]/15 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#00b4d8]/40 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              もっと学びたい方へ
            </motion.span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-white">
              AI×建築サークル
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 mb-6 sm:mb-8 leading-relaxed px-2">
              建築業界に特化したAI活用を学ぶ会員制コミュニティ。
              <br className="hidden sm:block" />
              ChatGPT・画像生成AI・業務自動化など、実践的な勉強会やセミナーを毎月開催。
              <br className="hidden sm:block" />
              メンバー同士の情報交換や、最新AI事例の共有も活発です。
            </p>
            <div className="bg-white/95 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-left max-w-lg mx-auto shadow-xl">
              <p className="text-xs sm:text-sm font-semibold text-[#1e3a5f] mb-3 sm:mb-4">サークル会員特典</p>
              <ul className="space-y-2 text-xs sm:text-sm text-[#64748b] mb-3 sm:mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00b4d8] flex-shrink-0 sm:w-4 sm:h-4" />
                  <span><strong className="text-[#1e3a5f]">Compass 3名分</strong>が無料で付属</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00b4d8] flex-shrink-0 sm:w-4 sm:h-4" />
                  <span>Smallプラン相当の機能を無料で利用可能</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#00b4d8] flex-shrink-0 sm:w-4 sm:h-4" />
                  <span>AI学習コンテンツ・勉強会すべて利用可</span>
                </li>
              </ul>
              <div className="border-t border-slate-200 pt-3 sm:pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-[#64748b]">月額料金</p>
                  <p className="text-lg sm:text-xl font-bold text-[#1e3a5f]">¥5,000<span className="text-xs sm:text-sm font-normal text-[#64748b]">/月</span></p>
                </div>
              </div>
            </div>
            <motion.a
              href="/circle"
              className="inline-flex items-center gap-2 text-sm sm:text-base text-[#7dd3fc] font-semibold hover:text-white transition group"
              whileHover={{ x: 5 }}
            >
              サークルについて詳しく
              <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </StickySection>
        </div>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA SECTION */}
      {/* ============================================ */}
      <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-[#0e2338] via-[#16324f] to-[#102a44]">
        {!isMobile && <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0b2238]/70 px-5 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 shadow-[0_24px_80px_rgba(2,12,27,0.45)]">
            <motion.h2
              className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-6 sm:mb-8 text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <TextReveal>迷わない現場へ。</TextReveal>
              <br />
              <span className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">Compassを始めよう</span>
            </motion.h2>
            <motion.p
              className="text-sm sm:text-base lg:text-lg text-slate-100 font-medium mb-8 sm:mb-12 max-w-2xl mx-auto px-2 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              14日間の無料トライアルで、現場の変化を体感してください。
              <br />
              クレジットカード不要。いつでもキャンセル可能。
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.button
                onClick={handleTrialClick}
                className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg bg-gradient-to-r from-[#00b4d8] to-[#0096b8] text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  無料トライアルを開始
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </span>
              </motion.button>

              <motion.button
                onClick={handleDemoClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-base sm:text-lg bg-white/10 text-white border border-white/35 hover:bg-white/20 hover:border-white/50 hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={18} className="text-cyan-200 sm:w-5 sm:h-5" />
                まずはデモを試す
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="py-10 sm:py-12 lg:py-16 border-t border-slate-100 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center">
              <img src="/compass-logo.png" alt="Compass" className="h-6 sm:h-8 w-auto" draggable="false" onContextMenu={(e) => e.preventDefault()} />
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#64748b]">
              {[
                { label: '利用規約', href: '/terms' },
                { label: 'プライバシーポリシー', href: '/privacy' },
                { label: '特定商取引法', href: '/legal' },
                { label: 'ヘルプ', href: '/help' },
              ].map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="hover:text-[#1e3a5f] transition"
                  whileHover={{ y: -2 }}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
          <div className="border-t border-slate-200 pt-6 sm:pt-8 flex flex-col items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#64748b]">
              <span>Developed by</span>
              <img src="/archiprisma_dev logo.png" alt="ARCHI-PRISMA" className="h-8 sm:h-10 lg:h-12 w-auto" draggable="false" onContextMenu={(e) => e.preventDefault()} />
            </div>
            <p className="text-xs sm:text-sm text-[#94a3b8]">
              © {new Date().getFullYear()} APDW Inc. All rights reserved.
            </p>
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
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTier('small')}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        selectedTier === 'small'
                          ? 'border-[#00b4d8] bg-[#00b4d8]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-sm text-[#1e3a5f]">Small</p>
                      <p className="text-xs text-[#64748b]">〜{smallPlan.maxMembers}名</p>
                      <p className="text-sm font-bold text-[#1e3a5f] mt-1">{formatPrice(smallPlan.price, smallPlan.currency)}/月</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTier('standard')}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        selectedTier === 'standard'
                          ? 'border-[#00b4d8] bg-[#00b4d8]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-sm text-[#1e3a5f]">Standard</p>
                      <p className="text-xs text-[#64748b]">〜{standardPlan.maxMembers}名</p>
                      <p className="text-sm font-bold text-[#1e3a5f] mt-1">{formatPrice(standardPlan.price, standardPlan.currency)}/月</p>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-[#64748b]">
                    15名を超える場合は
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
                        <span>
                          <strong>{selectedPlan.trialDays ?? 0}日間無料トライアル</strong>
                          {' '}- その後 {selectedPrice}/月
                        </span>
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

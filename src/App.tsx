import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Users,
  Calendar,
  BarChart3,
  ArrowRight,
  Play,
  Building2,
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

// ============================================
// ANIMATED TEXT REVEAL
// ============================================
function TextReveal({
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

// ============================================
// SCROLL PROGRESS SECTION
// ============================================
function StickySection({
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

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDemoClick = () => {
    window.location.href = 'https://compass-demo.web.app/';
  };

  const handleTrialClick = () => {
    window.location.href = 'https://compass-demo.web.app/signup';
  };

  return (
    <div className="min-h-screen bg-white text-[#1e293b] overflow-x-hidden">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00b4d8] to-[#0077b6] origin-left z-[100]"
        style={{ scaleX: smoothProgress }}
      />

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img src="/compass-logo.png" alt="Compass" className="h-8 w-auto" />
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
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} className="text-[#1e3a5f]" /> : <Menu size={24} className="text-[#1e3a5f]" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-6 py-6 space-y-4">
                {['機能', '料金', '導入', 'サークル'].map((item) => (
                  <a key={item} href={`#${item}`} className="block py-2 text-[#1e293b] font-medium">
                    {item}
                  </a>
                ))}
                <div className="pt-4 space-y-3">
                  <button onClick={handleDemoClick} className="w-full py-3 text-[#1e3a5f] font-medium border border-slate-200 rounded-xl">
                    デモを試す
                  </button>
                  <button onClick={handleTrialClick} className="w-full py-3 bg-gradient-to-r from-[#00b4d8] to-[#0096b8] text-white font-semibold rounded-xl">
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
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-b from-white via-[#f8fafc] to-white">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-0 w-[600px] h-[600px] bg-[#00b4d8]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1e3a5f]/5 rounded-full blur-[100px]" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,58,95,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,95,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 lg:pt-32 pb-8">
          {/* Text Content - Centered */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-4 py-2 rounded-full border border-[#00b4d8]/20">
                <Building2 size={16} />
                建築・施工チームのための工程管理
              </span>
            </motion.div>

            {/* Main copy */}
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-8 tracking-tight text-[#1e3a5f]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <TextReveal delay={0.5}>現場が迷わない。</TextReveal>
              <br />
              <span className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">
                プロジェクトが進む。
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-[#64748b] mb-10 leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              今どこにいて、次に何をすべきかが一目でわかる。
              <br className="hidden sm:block" />
              だから現場が迷わず、プロジェクトが前に進む。
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <motion.button
                onClick={handleTrialClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#00b4d8] to-[#0096b8] text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  14日間無料で試す
                  <ArrowRight size={20} />
                </span>
              </motion.button>

              <motion.button
                onClick={handleDemoClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg bg-white text-[#1e3a5f] border border-slate-200 hover:border-[#00b4d8]/50 hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={20} className="text-[#00b4d8]" />
                デモを見る
              </motion.button>
            </motion.div>

            <motion.div
              className="flex items-center justify-center gap-6 text-sm text-[#64748b]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#00b4d8]" />
                クレジットカード不要
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#00b4d8]" />
                いつでもキャンセル可
              </span>
            </motion.div>
          </div>

          {/* Hero Visual - Video */}
          <motion.div
            className="relative max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {/* Glow effect behind */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#00b4d8]/20 via-[#0077b6]/20 to-[#1e3a5f]/20 rounded-3xl blur-2xl" />

            {/* Video */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 bg-white">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              >
                <source src="/compass-intro.mp4" type="video/mp4" />
              </video>

              {/* Mute toggle button */}
              <motion.button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 p-3 rounded-full bg-[#1e3a5f]/80 text-white hover:bg-[#1e3a5f] transition-colors backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </motion.button>
            </div>
          </motion.div>
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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <StickySection className="text-center mb-16">
            <motion.span
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-4 py-2 rounded-full border border-[#00b4d8]/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              導入効果
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1e3a5f]">
              数字で見る<span className="text-[#00b4d8]">Compass</span>
            </h2>
          </StickySection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '30', unit: '%', label: '工数削減', sub: '平均' },
              { value: '85', unit: '%', label: '情報共有の改善', sub: '利用者調査' },
              { value: '2', unit: '時間', label: '週あたりの会議削減', sub: '平均' },
              { value: '98', unit: '%', label: '継続利用率', sub: 'トライアル後' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center p-8 rounded-2xl bg-[#f8fafc] border border-slate-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-5xl lg:text-6xl font-extrabold text-[#1e3a5f]">{stat.value}</span>
                  <span className="text-2xl font-bold text-[#00b4d8] mb-2">{stat.unit}</span>
                </div>
                <p className="text-[#1e3a5f] font-semibold mb-1">{stat.label}</p>
                <p className="text-sm text-[#64748b]">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* WHY COMPASS - DIFFERENTIATOR */}
      {/* ============================================ */}
      <section className="py-32 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <StickySection className="text-center mb-16">
            <motion.span
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-4 py-2 rounded-full border border-[#00b4d8]/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              なぜCompassか
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1e3a5f] mb-6">
              羅針盤のように、<span className="text-[#00b4d8]">進むべき道</span>を示す
            </h2>
            <p className="text-[#64748b] text-lg max-w-2xl mx-auto">
              現在地と目的地が一目でわかるから、迷わない。
              <br className="hidden sm:block" />
              見ればわかる、触ればできる。だから<strong className="text-[#1e3a5f]">現場に定着する</strong>。
            </p>
          </StickySection>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Comparison */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-[#f8fafc] rounded-2xl p-8 border border-slate-100">
                <h3 className="text-lg font-bold text-[#64748b] mb-6">他ツールでよくある悩み</h3>
                <ul className="space-y-4">
                  {[
                    '画面が複雑で何をすればいいかわからない',
                    '設定項目が多すぎて挫折する',
                    '使い方の説明に時間がかかる',
                    'ベテラン社員が使ってくれない',
                    '結局Excelに戻ってしまう',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#64748b]">
                      <X className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Compass advantages */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-2xl p-8 text-white">
                <h3 className="text-lg font-bold text-cyan-100 mb-6">Compassなら</h3>
                <ul className="space-y-4">
                  {[
                    '開いた瞬間、何をすべきかわかる',
                    'ボタンは最小限、迷う要素がない',
                    '説明なしで誰でも使い始められる',
                    '60代の職人さんも初日から活用',
                    'スマホで3タップ、進捗報告完了',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Key differentiators */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
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
                className="text-center p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-xl font-bold text-[#1e3a5f] mb-3">{item.title}</h4>
                <p className="text-[#64748b]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PAIN POINTS SECTION */}
      {/* ============================================ */}
      <section className="py-32 relative overflow-hidden bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <StickySection className="text-center mb-20">
            <motion.span
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1e3a5f] bg-[#1e3a5f]/10 px-4 py-2 rounded-full border border-[#1e3a5f]/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              よくある課題
            </motion.span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-[#1e3a5f]">
              <TextReveal>こんな課題、</TextReveal>
              <br />
              <TextReveal delay={0.2}>ありませんか？</TextReveal>
            </h2>
          </StickySection>

          <div className="grid md:grid-cols-3 gap-6">
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
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <motion.div
                  className="h-full bg-white rounded-2xl p-8 border border-slate-100 shadow-sm"
                  whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(30, 58, 95, 0.08)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon className="w-7 h-7" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#1e3a5f]">{item.title}</h3>
                  <p className="text-[#64748b] leading-relaxed">{item.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================ */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <StickySection className="text-center mb-20">
            <motion.span
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-4 py-2 rounded-full border border-[#00b4d8]/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              主な機能
            </motion.span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-[#1e3a5f]">
              <TextReveal>Compassで</TextReveal>
              <br />
              <span className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">できること</span>
            </h2>
            <p className="text-[#64748b] text-lg max-w-2xl mx-auto">
              プロジェクトの全体像を把握し、日々の進捗を確実に回すための機能を完備
            </p>
          </StickySection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true, margin: '-50px' }}
              >
                <motion.div
                  className="h-full bg-white rounded-2xl p-8 border border-slate-100 shadow-sm"
                  whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(30, 58, 95, 0.08)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#1e3a5f]">{feature.title}</h3>
                  <p className="text-[#64748b] leading-relaxed">{feature.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* SCREENSHOT GALLERY */}
      {/* ============================================ */}
      <section className="py-32 relative overflow-hidden bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <StickySection className="text-center mb-16">
            <motion.span
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-4 py-2 rounded-full border border-[#00b4d8]/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              画面イメージ
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1e3a5f]">
              <span className="text-[#00b4d8]">実際の画面</span>をご覧ください
            </h2>
          </StickySection>

          <div className="space-y-16">
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
                className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="lg:w-1/3 text-center lg:text-left">
                  <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">{item.title}</h3>
                  <p className="text-[#64748b] text-lg">{item.description}</p>
                </div>
                <div className="lg:w-2/3">
                  <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                    <img src={item.image} alt={item.title} className="w-full h-auto" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PRICING SECTION */}
      {/* ============================================ */}
      <section id="pricing" className="py-32 relative overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#2a4a73] to-[#1e3a5f]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <StickySection className="text-center mb-16">
            <motion.span
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/20 px-4 py-2 rounded-full border border-[#00b4d8]/30 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              料金プラン
            </motion.span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
              <TextReveal>シンプルな</TextReveal>
              <br />
              <TextReveal delay={0.2}>料金体系</TextReveal>
            </h2>
            <p className="text-slate-300 text-lg">
              必要な分だけ。人数が増えたら席を追加するだけ。
            </p>
          </StickySection>

          <motion.div
            className="max-w-lg mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-3xl p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00b4d8]/10 to-[#0077b6]/10 rounded-full blur-3xl" />

              <div className="relative text-center">
                <p className="text-[#64748b] mb-2 font-medium">1ユーザーあたり</p>
                <div className="flex items-end justify-center gap-1 mb-2">
                  <span className="text-6xl sm:text-7xl font-extrabold text-[#1e3a5f]">
                    ¥1,000
                  </span>
                  <span className="text-[#64748b] mb-3 text-xl">/月</span>
                </div>
                <p className="text-sm text-[#64748b] mb-10">（税抜）</p>

                <ul className="text-left space-y-4 mb-10">
                  {[
                    '全機能が使える',
                    '席数に上限なし - 必要に応じて追加',
                    '14日間の無料トライアル',
                    '法人・個人どちらもOK',
                    'カードが難しい場合は請求書対応可',
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#00b4d8] flex-shrink-0 mt-0.5" />
                      <span className="text-[#1e293b]">{item}</span>
                    </motion.li>
                  ))}
                </ul>

                <motion.button
                  onClick={handleTrialClick}
                  className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#00b4d8] to-[#0096b8] text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  14日間無料で始める
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FLOW SECTION */}
      {/* ============================================ */}
      <section id="flow" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <StickySection className="text-center mb-20">
            <motion.span
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00b4d8] bg-[#00b4d8]/10 px-4 py-2 rounded-full border border-[#00b4d8]/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              導入の流れ
            </motion.span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1e3a5f]">
              <span className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">2ステップ</span>
              <TextReveal delay={0.2}>で始められる</TextReveal>
            </h2>
          </StickySection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                initial={{ opacity: 0, x: i === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className={`h-full rounded-3xl p-8 ${
                    item.primary
                      ? 'bg-gradient-to-br from-[#00b4d8] to-[#0077b6] text-white'
                      : 'bg-white border border-slate-200 shadow-sm'
                  }`}
                  whileHover={{ y: -4, boxShadow: item.primary ? '0 20px 50px rgba(0, 180, 216, 0.3)' : '0 12px 40px rgba(30, 58, 95, 0.08)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`text-6xl font-bold mb-6 ${item.primary ? 'text-white/30' : 'text-slate-100'}`}>
                    {item.step}
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 ${item.primary ? 'text-white' : 'text-[#1e3a5f]'}`}>{item.title}</h3>
                  <p className={`mb-8 leading-relaxed ${item.primary ? 'text-cyan-100' : 'text-[#64748b]'}`}>
                    {item.description}
                  </p>
                  <button
                    onClick={item.action.onClick}
                    className={`inline-flex items-center gap-2 font-semibold transition group ${
                      item.primary ? 'text-white hover:text-cyan-100' : 'text-[#00b4d8] hover:text-[#0096b8]'
                    }`}
                  >
                    <item.action.icon size={18} />
                    {item.action.label}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
      <section className="py-32 relative overflow-hidden bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <StickySection className="text-center mb-16">
            <motion.span
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1e3a5f] bg-[#1e3a5f]/10 px-4 py-2 rounded-full border border-[#1e3a5f]/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              よくある質問
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#1e3a5f]">
              FAQ
            </h2>
          </StickySection>

          <div className="space-y-4">
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
                a: '席数はいつでも追加・削減が可能です。月単位での課金となるため、プロジェクトの規模に応じて柔軟に調整いただけます。',
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
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-[#1e3a5f] pr-4">{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-[#64748b] flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-[#64748b] leading-relaxed">
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
      <section id="circle" className="py-24 relative overflow-hidden bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <StickySection className="max-w-3xl mx-auto text-center">
            <motion.span
              className="inline-flex items-center gap-2 text-sm font-medium text-[#1e3a5f] bg-[#1e3a5f]/10 px-4 py-2 rounded-full border border-[#1e3a5f]/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              もっと学びたい方へ
            </motion.span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#1e3a5f]">
              AI×建築サークル
            </h2>
            <p className="text-[#64748b] mb-8 leading-relaxed text-lg">
              建築業界に特化したAI活用を学ぶ会員制コミュニティ。
              <br className="hidden sm:block" />
              ChatGPT・画像生成AI・業務自動化など、実践的な勉強会やセミナーを毎月開催。
              <br className="hidden sm:block" />
              メンバー同士の情報交換や、最新AI事例の共有も活発です。
            </p>
            <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left max-w-lg mx-auto">
              <p className="text-sm font-semibold text-[#1e3a5f] mb-4">サークル会員特典</p>
              <ul className="space-y-2 text-sm text-[#64748b] mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00b4d8] flex-shrink-0" />
                  <span><strong className="text-[#1e3a5f]">Compass 3席分</strong>が無料で付属</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00b4d8] flex-shrink-0" />
                  <span>4席目以降は¥1,000/席で追加可能</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00b4d8] flex-shrink-0" />
                  <span>AI学習コンテンツ・勉強会すべて利用可</span>
                </li>
              </ul>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#64748b]">月額料金</p>
                  <p className="text-xl font-bold text-[#1e3a5f]">¥5,000<span className="text-sm font-normal text-[#64748b]">/月</span></p>
                </div>
              </div>
            </div>
            <motion.a
              href="/circle"
              className="inline-flex items-center gap-2 text-[#00b4d8] font-semibold hover:text-[#0096b8] transition group"
              whileHover={{ x: 5 }}
            >
              サークルについて詳しく
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </StickySection>
        </div>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA SECTION */}
      {/* ============================================ */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00b4d8]/5 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <StickySection className="text-center">
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-[#1e3a5f]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <TextReveal>迷わない現場へ。</TextReveal>
              <br />
              <span className="bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">Compassを始めよう</span>
            </motion.h2>
            <motion.p
              className="text-[#64748b] text-lg mb-12 max-w-xl mx-auto"
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
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.button
                onClick={handleTrialClick}
                className="w-full sm:w-auto px-10 py-5 rounded-xl font-semibold text-lg bg-gradient-to-r from-[#00b4d8] to-[#0096b8] text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  無料トライアルを開始
                  <ArrowRight size={20} />
                </span>
              </motion.button>

              <motion.button
                onClick={handleDemoClick}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 rounded-xl font-semibold text-lg bg-white text-[#1e3a5f] border border-slate-200 hover:border-[#00b4d8]/50 hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={20} className="text-[#00b4d8]" />
                まずはデモを見る
              </motion.button>
            </motion.div>
          </StickySection>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="py-16 border-t border-slate-100 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center">
              <img src="/compass-logo.png" alt="Compass" className="h-8 w-auto" />
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#64748b]">
              {['利用規約', 'プライバシーポリシー', '特定商取引法', 'ヘルプ'].map((item) => (
                <motion.a
                  key={item}
                  href={`/${item}`}
                  className="hover:text-[#1e3a5f] transition"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
          </motion.div>
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-[#94a3b8]">
            © {new Date().getFullYear()} APDW Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

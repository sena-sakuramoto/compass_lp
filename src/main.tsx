import { StrictMode, Component, Suspense, lazy } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Dynamic imports — framer-motion は App 経由でのみ読み込まれる
// モジュール初期化エラーが発生してもキャッチ可能になる
const App = lazy(() => import('./App.tsx'))
const TermsPage = lazy(() => import('./pages/TermsPage.tsx').then(m => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.tsx').then(m => ({ default: m.PrivacyPage })))
const LegalPage = lazy(() => import('./pages/LegalPage.tsx').then(m => ({ default: m.LegalPage })))
const HelpPage = lazy(() => import('./pages/HelpPage.tsx').then(m => ({ default: m.HelpPage })))
const UpdatesPage = lazy(() => import('./pages/UpdatesPage.tsx').then(m => ({ default: m.UpdatesPage })))
const UpdateDetailPage = lazy(() => import('./pages/UpdateDetailPage.tsx').then(m => ({ default: m.UpdateDetailPage })))

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#dc2626', fontSize: 20 }}>
            ページの表示中にエラーが発生しました
          </h1>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14, marginTop: 12, color: '#64748b' }}>
            {this.state.error.message}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 8, color: '#94a3b8' }}>
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '8px 16px', background: '#00b4d8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14 }}
          >
            ページを再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#64748b', fontSize: 14 }}>読み込み中...</p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/updates/:slug" element={<UpdateDetailPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

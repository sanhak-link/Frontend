import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useNavigate, Link } from 'react-router-dom';
import Home from './home';
import Register from './src/register';
import './app.css';

// 아이콘 라이브러리 (터미널에서 npm install lucide-react 실행 필요)
import { Home as HomeIcon, MessageCircle, User as UserIcon } from "lucide-react";

/** ---------- [기존] 알림 상태 훅 ---------- */
function useAlertState() {
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/alerts/active', { signal: ctrl.signal, credentials: 'include' });
        if (res.ok) {
          const d = await res.json();
          setIsAlert(!!(d && (d.active || d.alert)));
        }
      } catch (_) {
        const q = new URLSearchParams(window.location.search);
        if (q.get('alert') === '1') setIsAlert(true);
      }
    })();

    let es;
    try {
      es = new EventSource('/api/alerts/stream', { withCredentials: true });
      es.addEventListener('alert.created', () => setIsAlert(true));
      es.addEventListener('alert.resolved', () => setIsAlert(false));
      es.onerror = () => { };
    } catch (_) { }

    return () => {
      ctrl.abort();
      if (es) es.close();
    };
  }, []);

  return isAlert;
}

/** ---------- [수정됨] 레이아웃: 정상 모드 ---------- */
function NormalLayout() {
  return (
    <div style={{ width: 1280, height: 800, position: 'relative', background: 'white', overflow: 'hidden', margin: '0 auto' }}>
      <div style={{ width: 550, height: 265, left: 640, top: 158, position: 'absolute', background: '#D9D9D9', borderRadius: 20 }} />
      <div style={{ width: 312, height: 64, left: 751, top: 298, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 300, lineHeight: '22px', wordBreak: 'keep-all' }}>
        이상 목격 전체 영상을 업로드하면<br />현재 상황 증거를 확인할 수 있습니다.
      </div>
      <div style={{ width: 550, height: 265, left: 640, top: 443, position: 'absolute', background: '#D9D9D9', borderRadius: 20 }} />
      <div style={{ width: 550, height: 550, left: 72, top: 158, position: 'absolute', background: 'rgba(78, 95, 208, 0.30)', borderRadius: 20 }} />
      
      {/* 👇 [수정됨] 이미지를 클릭하면 /user-home 으로 이동하도록 Link 추가 */}
      <Link to="/user-home" style={{ cursor: 'pointer' }}>
        <img style={{ width: 188, height: 281, left: 449, top: 443, position: 'absolute' }} src="/image_file/normal_bird.png" alt="증거 이미지" />
      </Link>

      <div style={{ width: 369, height: 35, left: 52, top: 70, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 50, fontFamily: 'Pretendard', fontWeight: 300, lineHeight: '22px', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
        SMARTSHIELD
      </div>
      <div style={{ width: 177, height: 31, left: 818, top: 260, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: '22px' }}>
        영상 내역
      </div>
      <div style={{ width: 770, height: 31, left: 433, top: 70, position: 'absolute', color: 'black', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 300, lineHeight: '22px', display: 'flex', gap: 20, justifyContent: 'center' }}>
        <Link to="/settings" style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>정보 설정</Link>
        <Link to="/history" style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>신고 기록</Link>
        <span style={{ cursor: 'pointer' }}>고객센터</span>
      </div>
      <div style={{ width: 195, height: 35, left: 809, top: 541, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: '22px' }}>
        경위서 작성
      </div>
      <div style={{ width: 444, height: 65, left: 125, top: 390, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 300, lineHeight: '32px', wordBreak: 'keep-all' }}>
        도움 요청이 존재하지 않습니다.
      </div>
      <div style={{ width: 400, height: 607, left: -708, top: 70, position: 'absolute', background: 'rgba(78.13, 95.49, 208.34, 0.30)', borderRadius: 20 }} />
      <div style={{ width: 287, height: 64, left: 763, top: 584, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 300, lineHeight: '26px', wordBreak: 'keep-all' }}>
        AI가 영상을 확인하고 요약하여<br />상황에 맞는 경위서를 작성해 줍니다.
      </div>
    </div>
  );
}

/** ---------- [기존] 레이아웃: 알림 모드 ---------- */
function AlertLayout() {
  return (
    <div style={{ width: 1280, height: 800, position: 'relative', background: 'white', overflow: 'hidden', margin: '0 auto' }}>
      <div style={{ width: 550, height: 265, left: 640, top: 158, position: 'absolute', background: '#D9D9D9', borderRadius: 20 }} />
      <div style={{ width: 312, height: 64, left: 751, top: 298, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 300, lineHeight: '22px', wordWrap: 'break-word' }}>
        현장의 전체 영상 및<br /> 위험 상황 영상을 확인할 수 있습니다.
      </div>
      <div style={{ width: 550, height: 265, left: 640, top: 443, position: 'absolute', background: '#D9D9D9', borderRadius: 20 }} />
      <div style={{ width: 369, height: 35, left: 52, top: 70, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 50, fontFamily: 'Pretendard', fontWeight: 300, lineHeight: '22px', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
        SMARTSHIELD
      </div>
      <div style={{ width: 177, height: 31, left: 818, top: 260, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: '22px' }}>
        영상 내역
      </div>
      <div style={{ width: 770, height: 31, left: 433, top: 70, position: 'absolute', color: 'black', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 300, lineHeight: '22px', wordWrap: 'break-word' }}>
        정보 수정   |
      </div>
      <div style={{ width: 195, height: 35, left: 809, top: 541, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: '22px' }}>
        경위서 작성
      </div>
      <div style={{ width: 400, height: 607, left: -708, top: 70, position: 'absolute', background: 'rgba(78.13, 95.49, 208.34, 0.30)', borderRadius: 20 }} />
      <div style={{ width: 287, height: 64, left: 763, top: 584, position: 'absolute', textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 300, lineHeight: '22px', wordWrap: 'break-word' }}>
        AI가 영상을 확인하고 요약하여<br />상황에 맞는 경위서를 작성해줍니다.
      </div>
      <div style={{ width: 550, height: 550, left: 73, top: 158, position: 'absolute', background: '#D46464', borderRadius: 20 }} />
      <img style={{ width: 214, height: 322, left: 432, top: 368, position: 'absolute' }} src="/image_file/emergency_bird.png" alt="" />
      <div style={{ width: 444, height: 65, left: 126, top: 400, position: 'absolute', textAlign: 'center', color: 'white', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: '22px', wordWrap: 'break-word' }}>
        도움 요청을 확인해주세요
      </div>
    </div>
  );
}

/** ---------- [기존] 대시보드 (분기) ---------- */
function Dashboard() {
  const isAlert = useAlertState();
  return isAlert ? <AlertLayout /> : <NormalLayout />;
}

/** * ---------- [신규] 새로운 UserDashboard (page.tsx 변환) ---------- */
function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 1. 서버에 내 정보 요청
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("Token invalid");
          return res.json();
        })
        .then(data => {
          // 2. 성공 시 정보 세팅
          setUser(data);
        })
        .catch(() => {
          // 3. 실패 시 토큰 삭제 및 로그아웃 처리
          localStorage.removeItem("accessToken");
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 로딩 끝났는데 유저 없으면 홈으로
    if (!loading && !user) {
      navigate("/home");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#4B5563' }}>로딩 중...</div>
      </div>
    );
  }

  if (!user) return null;

  // 인라인 스타일 정의
  const containerStyle = { minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', fontFamily: 'Pretendard, sans-serif' };
  const mainStyle = { flex: 1, padding: '1.5rem' };
  const titleStyle = { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' };
  const buttonContainerStyle = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '28rem' };

  const blueButtonStyle = { display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#2563EB', color: 'white', padding: '1.5rem', borderRadius: '1rem', textDecoration: 'none', transition: 'background-color 0.2s' };
  const redButtonStyle = { display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#EF4444', color: 'white', padding: '1.5rem', borderRadius: '1rem', textDecoration: 'none', transition: 'background-color 0.2s' };
  const textStyle = { fontSize: '1.125rem', fontWeight: '600' };

  const navStyle = { backgroundColor: 'white', borderTop: '1px solid #E5E7EB', padding: '1rem 1.5rem' };
  const navContainerStyle = { display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: '28rem', margin: '0 auto' };
  const navItemActiveStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#2563EB', textDecoration: 'none' };
  const navItemInactiveStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#9CA3AF', textDecoration: 'none' };

  return (
    <div style={containerStyle}>
      <main style={mainStyle}>
        <h1 style={titleStyle}>안녕하세요, {user.name || user.email}님 !</h1>

        <div style={buttonContainerStyle}>
          <Link to="/business-confirm" style={blueButtonStyle}>
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={textStyle}>영상 확인</span>
          </Link>

          <Link to="/business-analysis" style={blueButtonStyle}>
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span style={textStyle}>영상 분석</span>
          </Link>

          <Link to="/emergency" style={redButtonStyle}>
            <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span style={textStyle}>긴급 도움 요청</span>
          </Link>
        </div>
      </main>

      <nav style={navStyle}>
        <div style={navContainerStyle}>
          <Link to="/user-home" style={navItemActiveStyle}>
            <HomeIcon style={{ width: '1.5rem', height: '1.5rem' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>홈</span>
          </Link>
          <Link to="/chat" style={navItemInactiveStyle}>
            <MessageCircle style={{ width: '1.5rem', height: '1.5rem' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>채팅</span>
          </Link>
          <Link to="/profile" style={navItemInactiveStyle}>
            <UserIcon style={{ width: '1.5rem', height: '1.5rem' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>회원정보</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

/** ---------- 라우팅 ---------- */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main-page" element={<Dashboard />} />
        <Route path="/user-home" element={<UserDashboard />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
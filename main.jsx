import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './home';
import Register from './src/register';
import './app.css'; 
/** ---------- 알림 상태 훅 ---------- */
function useAlertState() {
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    // 1) 초기 동기화
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/alerts/active', { signal: ctrl.signal, credentials: 'include' });
        if (res.ok) {
          const d = await res.json();
          // {active:true, alert:{...}} 형태 또는 {active:false}
          setIsAlert(!!(d && (d.active || d.alert)));
        }
      } catch (_) {
        // 서버 준비 전에는 쿼리로 강제 모드 전환 허용 (?alert=1)
        const q = new URLSearchParams(window.location.search);
        if (q.get('alert') === '1') setIsAlert(true);
      }
    })();

    // 2) 실시간 구독 (SSE)
    let es;
    try {
      es = new EventSource('/api/alerts/stream', { withCredentials: true });
      es.addEventListener('alert.created', () => setIsAlert(true));
      es.addEventListener('alert.resolved', () => setIsAlert(false));
      es.onerror = () => { /* 필요 시 재시도 또는 토스트 */ };
    } catch (_) {
      // SSE 미구현 시 무시
    }

    return () => {
      ctrl.abort();
      if (es) es.close();
    };
  }, []);

  return isAlert;
}

/** ---------- 레이아웃: 정상 모드 ---------- */
function NormalLayout() {
  return (
    <div
      style={{
        width: 1280,
        height: 800,
        position: 'relative',
        background: 'white',
        overflow: 'hidden',
        margin: '0 auto',
      }}
    >
      <div style={{ width: 550, height: 265, left: 640, top: 158, position: 'absolute', background: '#D9D9D9', borderRadius: 20 }} />
      <div
        style={{
          width: 312, height: 64, left: 751, top: 298, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'Pretendard',
          fontWeight: 300, lineHeight: '22px', wordBreak: 'keep-all',
        }}
      >
        이상 목격 전체 영상을 업로드하면
        <br />
        현재 상황 증거를 확인할 수 있습니다.
      </div>
      <div style={{ width: 550, height: 265, left: 640, top: 443, position: 'absolute', background: '#D9D9D9', borderRadius: 20 }} />
      <div style={{ width: 550, height: 550, left: 72, top: 158, position: 'absolute', background: 'rgba(78, 95, 208, 0.30)', borderRadius: 20 }} />
      <img
        style={{ width: 188, height: 281, left: 449, top: 443, position: 'absolute' }}
        src="image_file/normal_bird.png" // Windows 경로 구분자(\) 대신 / 사용
        alt="증거 이미지"
      />
      <div
        style={{
          width: 369, height: 35, left: 52, top: 70, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 50, fontFamily: 'Pretendard',
          fontWeight: 300, lineHeight: '22px', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        SMARTSHIELD
      </div>
      <div
        style={{ width: 177, height: 31, left: 818, top: 260, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: '22px' }}
      >
        영상 내역
      </div>
      <div
        style={{
          width: 770, height: 31, left: 433, top: 70, position: 'absolute',
          color: 'black', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 300,
          lineHeight: '22px', display: 'flex', gap: 20, justifyContent: 'center',
        }}
      >
        <span>정보 설정</span>
        <span>신고 기록</span>
        <span>고객센터</span>
      </div>
      <div
        style={{ width: 195, height: 35, left: 809, top: 541, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: '22px' }}
      >
        경위서 작성
      </div>
      <div
        style={{
          width: 444, height: 65, left: 125, top: 390, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'Pretendard',
          fontWeight: 300, lineHeight: '32px', wordBreak: 'keep-all',
        }}
      >
        도움 요청이 존재하지 않습니다.
      </div>
      <div style={{ width: 400, height: 607, left: -708, top: 70, position: 'absolute', background: 'rgba(78.13, 95.49, 208.34, 0.30)', borderRadius: 20 }} />
      <div
        style={{
          width: 287, height: 64, left: 763, top: 584, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'Pretendard',
          fontWeight: 300, lineHeight: '26px', wordBreak: 'keep-all',
        }}
      >
        AI가 영상을 확인하고 요약하여
        <br />
        상황에 맞는 경위서를 작성해 줍니다.
      </div>
    </div>
  );
}

/** ---------- 레이아웃: 알림 모드 ---------- */
function AlertLayout() {
  return (
    <div
      style={{
        width: 1280, height: 800, position: 'relative', background: 'white', overflow: 'hidden',  margin: '0 auto',  
      }}
    >
      <div style={{ width: 550, height: 265, left: 640, top: 158, position: 'absolute', background: '#D9D9D9', borderRadius: 20 }} />
      <div
        style={{
          width: 312, height: 64, left: 751, top: 298, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'Pretendard',
          fontWeight: 300, lineHeight: '22px', wordWrap: 'break-word',
        }}
      >
        현장의 전체 영상 및
        <br /> 위험 상황 영상을 확인할 수 있습니다.
      </div>
      <div style={{ width: 550, height: 265, left: 640, top: 443, position: 'absolute', background: '#D9D9D9', borderRadius: 20 }} />
      <div
        style={{
          width: 369, height: 35, left: 52, top: 70, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 50, fontFamily: 'Pretendard',
          fontWeight: 300, lineHeight: '22px', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        SMARTSHIELD
      </div>
      <div
        style={{
          width: 177, height: 31, left: 818, top: 260, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: '22px',
        }}
      >
        영상 내역
      </div>
      <div
        style={{
          width: 770, height: 31, left: 433, top: 70, position: 'absolute',
          color: 'black', fontSize: 20, fontFamily: 'Pretendard', fontWeight: 300, lineHeight: '22px',
          wordWrap: 'break-word',
        }}
      >
        정보 수정   |                   
      </div>
      <div
        style={{
          width: 195, height: 35, left: 809, top: 541, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 40, fontFamily: 'Pretendard', fontWeight: 500, lineHeight: '22px',
        }}
      >
        경위서 작성
      </div>
      <div style={{ width: 400, height: 607, left: -708, top: 70, position: 'absolute', background: 'rgba(78.13, 95.49, 208.34, 0.30)', borderRadius: 20 }} />
      <div
        style={{
          width: 287, height: 64, left: 763, top: 584, position: 'absolute',
          textAlign: 'center', color: 'black', fontSize: 20, fontFamily: 'Pretendard',
          fontWeight: 300, lineHeight: '22px', wordWrap: 'break-word',
        }}
      >
        AI가 영상을 확인하고 요약하여
        <br />상황에 맞는 경위서를 작성해줍니다.
      </div>
      <div style={{ width: 550, height: 550, left: 73, top: 158, position: 'absolute', background: '#D46464', borderRadius: 20 }} />
      <img style={{ width: 214, height: 322, left: 432, top: 368, position: 'absolute' }} src="image_file\emergency_bird.png" alt="" />
      <div
        style={{
          width: 444, height: 65, left: 126, top: 400, position: 'absolute',
          textAlign: 'center', color: 'white', fontSize: 40, fontFamily: 'Pretendard',
          fontWeight: 500, lineHeight: '22px', wordWrap: 'break-word',
        }}
      >
        도움 요청을 확인해주세요
      </div>
    </div>
  );
}

/** ---------- 대시보드 (분기) ---------- */
function Dashboard() {
  const isAlert = useAlertState();
  return isAlert ? <AlertLayout /> : <NormalLayout />;
}

/** ---------- 라우팅 ---------- */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        {/* /dashboard → /main-page 로 변경 */}
        <Route path="/main-page" element={<Dashboard />} />
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

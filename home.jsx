import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from "./src/components/button.jsx";
import { login } from "./src/lib/api.js";


export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('이메일/비밀번호를 입력해 주세요.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await login({ email, password });
    setIsSubmitting(false);

    if (!res.ok) {
      setErrorMsg(res.error || '로그인에 실패했습니다.');
      return;
    }
    // 성공 → 메인으로 이동
    navigate('/main-page'); 
  }

  return (
    <div
      style={{
        width: 1280,
        height: 800,
        position: 'relative',
        background: 'white',
        overflow: 'hidden',
        margin: '0 auto',
        fontFamily:
          'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", Arial, sans-serif',
      }}
    >
      {/* 상단 타이틀 */}
      <div
        style={{
          width: 423,
          height: 95,
          left: 419,
          top: 198,
          position: 'absolute',
          textAlign: 'center',
          color: 'black',
          fontSize: 40,
          fontWeight: 300,
          lineHeight: '22px',
          textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        SMARTSHIELD
      </div>

      {/* 입력폼: 레이아웃 유지 */}
      <form
        id="loginForm"
        onSubmit={handleLogin}
        style={{
          width: 498,
          height: 271,
          left: 384,
          top: 252,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* 이메일 */}
        <div
          style={{
            width: 318,
            height: 91,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <div
            style={{
              color: 'rgba(0, 0, 0, 0.85)',
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            이메일
          </div>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={{
              width: 320,
              height: 50,
              padding: '15px 16px',
              background: '#F5F5F5',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              outline: 'none',
              border: '1px solid transparent',
              fontSize: 16,
              fontWeight: 500,
            }}
          />
        </div>

        {/* 비밀번호 */}
        <div
          style={{
            width: 322,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <div
            style={{
              color: 'rgba(0, 0, 0, 0.85)',
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            비밀번호
          </div>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{
              width: 320,
              height: 50,
              padding: '15px 16px',
              background: '#F5F5F5',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              outline: 'none',
              border: '1px solid transparent',
              fontSize: 16,
              fontWeight: 500,
            }}
          />
        </div>

        {/* 에러 메시지 */}
        {errorMsg && (
          <div
            style={{ marginTop: 8, color: '#e53935', fontSize: 14, fontWeight: 600 }}
          >
            {errorMsg}
          </div>
        )}
      </form>

<div
  style={{
    width: 322,
    left: 472,
    top: 516,
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  }}
>
  {/* 로그인 */}
  <Button
    type="submit"
    variant="ghost"
    size="md"
    fullWidth
    loading={isSubmitting}
    disabled={isSubmitting}
    onClick={() => {
      const formEl = document.getElementById('loginForm');
      if (formEl?.requestSubmit) formEl.requestSubmit();
      else formEl?.submit();
    }}
    style={{
      width: '100%',
      height: 65,
      padding: '15px 123px',
      background: '#096BC7',
      borderRadius: 6,
      color: 'white',
      fontSize: 16,
      fontWeight: 600,
      border: 'none',
    }}
  >
    로그인
  </Button>

  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ color: '#888888', fontSize: 14, fontWeight: 500 }}>
      계정이 없으신가요?
    </div>
    <Link
      to="/register"
      style={{
        padding: '10px 18px',
        background: '#096BC7',
        borderRadius: 6,
        textDecoration: 'none',
        color: 'white',
        fontSize: 16,
        fontWeight: 600,
        display: 'inline-flex',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      계정 등록
    </Link>
  </div>
</div>

      {/*메인*/}
      <div
        style={{
          left: 306,
          top: 237,
          position: 'absolute',
          width: 653,
          textAlign: 'center',
          color: 'black',
          fontSize: 18,
          fontWeight: 300,
          lineHeight: '22px',
          textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        }}
      >
        당신의 안전을 지켜주는 AI, SmartShield
      </div>

      {/* 로고 */}
      <img
        style={{
          width: 183,
          height: 76,
          left: 22,
          top: 17,
          position: 'absolute',
        }}
        src="image_file\police.png"
        alt="SmartShield 로고"
      />
    </div>
  );
}

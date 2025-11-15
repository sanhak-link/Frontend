import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from "./lib/api.js";

// 회원가입 화면 레이아웃을 그대로 출력합니다.
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return '이름을 입력하세요.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return '이메일 형식이 올바르지 않습니다.';
    if (form.password.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
    return null;
  };

  const onSubmit = async (e) => {
  e.preventDefault();
  const v = validate();
  if (v) return setErr(v);
  setErr("");
  setLoading(true);

  try {
    const res = await signup({
      email: form.email,
      password: form.password,
      name: form.name,
      phoneNumber: form.phoneNumber || undefined,
      managementCode: form.managementCode || undefined,
    });

    if (!res.ok) {
      setErr(res.error || "회원가입에 실패했습니다.");
      return;
    }
    navigate("/main-page");
  } catch (e) {
    setErr(e?.message || "네트워크 오류");
  } finally {
    setLoading(false);
  }
};

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
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: 24,
          right: 32,
          padding: '10px 18px',
          borderRadius: 999,
          border: '1px solid #d9d9d9',
          background: 'white',
          cursor: 'pointer',
          textDecoration: 'none',
          color: '#111',
          zIndex: 1,
        }}
      >
        홈으로 돌아가기
      </Link>

      <div
        style={{
          width: 400,
          height: 607,
          left: 451,
          top: 96,
          position: 'absolute',
          background: 'rgba(78, 95, 208, 0.30)',
          borderRadius: 20,
        }}
      />

      {/* 입력 폼: 위치/크기/정렬 그대로 유지 */}
      <form
        onSubmit={onSubmit}
        style={{
          width: 329,
          height: 438,
          left: 486,
          top: 163,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <FormField
          label="이름"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="이름을 입력하세요"
        />
        <FormField
          label="전화번호"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={onChange}
          placeholder="숫자만 입력 (선택)"
        />
        <FormField
          label="이메일"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="example@domain.com"
        />
        <FormField
          label="비밀번호"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          placeholder="비밀번호(6자 이상)"
        />

        {/* 에러 메시지: 레이아웃 흔들림 최소화 */}
        {err ? (
          <div style={{ width: 320, color: '#c00', fontSize: 14, textAlign: 'left' }}>{err}</div>
        ) : (
          <div style={{ width: 320, height: 0 }} />
        )}
      </form>

      <div
        style={{
          width: 295,
          height: 44,
          left: 491,
          top: 118,
          position: 'absolute',
          color: 'black',
          fontSize: 25,
          fontWeight: 700,
          lineHeight: '32px',
        }}
      >
        시스템 사용을 위해
        <br />
        정보를 입력해주세요.
      </div>

      {/* 제출 버튼: 동일 위치/사이즈, 버튼 엘리먼트로 교체 */}
      <button
        type="submit"
        form="" // 폼과 같은 DOM 내에 있으므로 기본적으로 가장 가까운 form으로 제출됨
        onClick={(e) => {
          // 일부 브라우저에서 form 연결이 불안하면 강제로 가장 가까운 form submit
          const f = e.currentTarget.closest('div')?.querySelector('form');
          if (f) f.requestSubmit();
        }}
        disabled={loading}
        style={{
          width: 320,
          height: 50,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 15,
          paddingBottom: 15,
          left: 491,
          top: 594,
          position: 'absolute',
          background: '#096BC7',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {loading ? '처리 중…' : '가입하기'}
        </div>
      </button>
    </div>
  );
}

function FormField({ label, name, value = '', onChange, type = 'text', placeholder = '' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 8,
        width: '100%',
      }}
    >
      <div
        style={{
          color: 'rgba(0, 0, 0, 0.85)',
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: 320,
          height: 50,
          padding: '15px 16px',
          background: '#F5F5F5',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: '100%',
            outline: 'none',
            border: 'none',
            background: 'transparent',
            fontSize: 16,
            fontWeight: 500,
            color: '#111',
          }}
        />
      </div>
    </div>
  );
}

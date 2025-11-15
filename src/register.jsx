import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, sendEmailCode, verifyEmailCode } from "./lib/api.js";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    emailCode: "",
    password: "",
    isEmailVerified: false,
  });

  const [msg, setMsg] = useState("");
  const [emailSendLoading, setEmailSendLoading] = useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // 인증코드 보내기 (api.js sendEmailCode 사용)
  const handleSendEmailCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setMsg("올바른 이메일을 입력하세요.");
      return;
    }

    setEmailSendLoading(true);
    setMsg("");

    const res = await sendEmailCode(form.email);

    if (!res.ok) {
      setMsg(res.error || "인증 코드 발송 실패");
    } else {
      setMsg("인증 코드가 발송되었습니다.");
    }
    setEmailSendLoading(false);
  };

  // 인증코드 확인 (api.js verifyEmailCode 사용)
  const handleVerifyEmailCode = async () => {
    if (!form.emailCode.trim()) {
      setMsg("인증 코드를 입력하세요.");
      return;
    }

    setEmailVerifyLoading(true);
    setMsg("");

    const res = await verifyEmailCode({
      email: form.email,
      code: form.emailCode,
    });

    if (!res.ok) {
      setMsg(res.error || "인증 실패");
    } else {
      setForm((p) => ({ ...p, isEmailVerified: true }));
      setMsg("✔ 이메일 인증이 완료되었습니다.");
    }
    setEmailVerifyLoading(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return setMsg("이름을 입력하세요.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setMsg("이메일 형식이 올바르지 않습니다.");
    if (!form.isEmailVerified) return setMsg("이메일 인증을 완료해주세요.");
    if (form.password.length < 6)
      return setMsg("비밀번호는 6자 이상이어야 합니다.");

    setLoading(true);
    setMsg("");

    try {
      const res = await signup({
        email: form.email,
        password: form.password,
        name: form.name,
        phoneNumber: form.phoneNumber,
      });

      if (!res.ok) {
        setMsg(res.error || "회원가입에 실패했습니다.");
      } else {
        navigate("/main-page");
      }
    } catch {
      setMsg("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: 1280,
        height: 800,
        position: "relative",
        background: "white",
        overflow: "hidden",
      }}
    >
      {/* 연보라 패널 */}
      <div
        style={{
          width: 400,
          height: 730,
          left: 451,
          top: 24,
          position: "absolute",
          background: "rgba(78.13, 95.49, 208.34, 0.30)",
          borderRadius: 20,
        }}
      />

      {/* 타이틀 */}
      <div
        style={{
          width: 211,
          height: 44,
          left: 598,
          top: 41,
          position: "absolute",
          color: "black",
          fontSize: 27,
          fontFamily: "Pretendard",
          fontWeight: "700",
          wordWrap: "break-word",
        }}
      >
        회원가입
      </div>

      {/* 폼 전체 */}
      <form
        id="register-form"
        onSubmit={onSubmit}
        style={{
          width: 329,
          height: 438,
          left: 486,
          top: 150,
          position: "absolute",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          display: "inline-flex",
          fontFamily: "Pretendard",
        }}
      >
        {/* 이름 */}
        <Field label="이름">
          <Input name="name" value={form.name} onChange={onChange} />
        </Field>

        {/* 전화번호 */}
        <Field label="전화번호">
          <Input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={onChange}
          />
        </Field>

        {/* 이메일 */}
        <Field label="이메일">
          <Input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
          />
        </Field>

        {/* 인증 코드 보내기 버튼 */}
        <button
          type="button"
          onClick={emailSendLoading ? undefined : handleSendEmailCode}
          style={{
            width: 320,
            height: 30,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 15,
            paddingBottom: 15,
            background: "#7658E4",
            overflow: "hidden",
            borderRadius: 6,
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 10,
            display: "inline-flex",
            border: "none",
            cursor: "pointer",
            fontFamily: "Pretendard",
          }}
        >
          <div
            style={{
              textAlign: "right",
              color: "white",
              fontSize: 16,
              fontFamily: "Pretendard",
              fontWeight: "600",
              wordWrap: "break-word",
            }}
          >
            {emailSendLoading
              ? "발송 중..."
              : "                        인증 코드 보내기"}
          </div>
        </button>

        {/* 인증 코드 */}
        <div
          data-property-1="Email_Box"
          style={{
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 8,
            display: "flex",
          }}
        >
          <div
            style={{
              color: "rgba(0, 0, 0, 0.85)",
              fontSize: 16,
              fontFamily: "Pretendard",
              fontWeight: "600",
              wordWrap: "break-word",
            }}
          >
            인증 코드
          </div>
          <div
            style={{
              width: 320,
              height: 50,
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 15,
              paddingBottom: 15,
              background: "#F5F5F5",
              overflow: "hidden",
              borderRadius: 6,
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 10,
              display: "inline-flex",
            }}
          >
            <input
              name="emailCode"
              value={form.emailCode}
              onChange={onChange}
              placeholder="메일로 받은 코드를 입력해주세요"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 16,
                fontFamily: "Pretendard",
                fontWeight: "500",
                color: "#111",
              }}
            />
          </div>
        </div>

        {/* 인증 확인 버튼 */}
        <button
          type="button"
          onClick={emailVerifyLoading ? undefined : handleVerifyEmailCode}
          style={{
            width: 320,
            height: 30,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 15,
            paddingBottom: 15,
            background: "#7658E4",
            overflow: "hidden",
            borderRadius: 6,
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 10,
            display: "inline-flex",
            border: "none",
            cursor: "pointer",
            fontFamily: "Pretendard",
          }}
        >
          <div
            style={{
              textAlign: "right",
              color: "white",
              fontSize: 16,
              fontFamily: "Pretendard",
              fontWeight: "600",
              wordWrap: "break-word",
            }}
          >
            {emailVerifyLoading
              ? "확인 중..."
              : "                              인증 확인"}
          </div>
        </button>

        {/* 비밀번호 */}
        <Field label=" 비밀번호">
          <Input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
          />
        </Field>

        {/* 메시지 */}
        {msg && (
          <div
            style={{
              width: 320,
              color: form.isEmailVerified ? "#1C9A36" : "#c00",
              fontSize: 14,
              fontFamily: "Pretendard",
            }}
          >
            {msg}
          </div>
        )}
      </form>

      {/* 가입하기 버튼 */}
      <div
        onClick={() => {
          const f = document.getElementById("register-form");
          if (f) f.requestSubmit();
        }}
        style={{
          width: 320,
          height: 40,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 15,
          paddingBottom: 15,
          left: 491,
          top: 663,
          position: "absolute",
          background: "#096BC7",
          overflow: "hidden",
          borderRadius: 6,
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 10,
          display: "inline-flex",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        <div
          style={{
            textAlign: "right",
            color: "white",
            fontSize: 16,
            fontFamily: "Pretendard",
            fontWeight: "600",
            wordWrap: "break-word",
          }}
        >
          {loading
            ? "                               처리 중..."
            : "                               가입하기"}
        </div>
        <div style={{ width: 100, height: 100, position: "relative" }} />
      </div>
    </div>
  );
}

/* 이름/전화번호/이메일/비밀번호용 필드 */
function Field({ label, children }) {
  return (
    <div
      data-property-1="Email_Box"
      style={{
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 8,
        display: "flex",
      }}
    >
      <div
        style={{
          color: "rgba(0, 0, 0, 0.85)",
          fontSize: 16,
          fontFamily: "Pretendard",
          fontWeight: "600",
          wordWrap: "break-word",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Input({ placeholder, ...rest }) {
  return (
    <div
      style={{
        width: 320,
        height: 50,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 15,
        paddingBottom: 15,
        background: "#F5F5F5",
        borderRadius: 6,
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 10,
        display: "inline-flex",
      }}
    >
      <input
        {...rest}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 16,
          fontFamily: "Pretendard",
          fontWeight: "500",
          color: "#111",
        }}
      />
    </div>
  );
}

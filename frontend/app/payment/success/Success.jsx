'use client';

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "../../../styles/App.css";

export function SuccessPage({ onNavigate }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const hasConfirmedRef = useRef(false); // 중복 실행 방지
  const isProcessingRef = useRef(false); // 처리 중 플래그

  // URL 파라미터에서 결제 정보 가져오기 (Next.js useSearchParams 사용)
  const getUrlParams = () => {
    if (!searchParams) return {};
    return {
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
      paymentKey: searchParams.get("paymentKey"),
    };
  };

  useEffect(() => {
    // 중복 실행 방지 - 이미 처리했거나 처리 중이면 중단
    if (hasConfirmedRef.current || isProcessingRef.current) {
      console.log("이미 처리 중이거나 완료된 결제입니다. 중복 실행 방지.");
      return;
    }

    // 쿼리 파라미터 값이 결제 요청할 때 보낸 데이터와 동일한지 반드시 확인하세요.
    // 클라이언트에서 결제 금액을 조작하는 행위를 방지할 수 있습니다.
    const requestData = getUrlParams();
    
    // searchParams가 아직 로드되지 않았으면 대기
    if (!searchParams) {
      return;
    }

    if (!requestData.paymentKey || !requestData.orderId || !requestData.amount) {
      setError("결제 정보가 올바르지 않습니다.");
      setLoading(false);
      hasConfirmedRef.current = true; // 처리 완료 표시
      return;
    }

    // localStorage로 중복 처리 방지
    const processedKey = `payment_processed_${requestData.paymentKey}`;
    if (typeof window !== 'undefined' && localStorage.getItem(processedKey)) {
      console.log("이미 처리된 결제입니다. paymentKey:", requestData.paymentKey);
      setPaymentInfo(requestData);
      setLoading(false);
      hasConfirmedRef.current = true;
      return;
    }

    setPaymentInfo(requestData);
    isProcessingRef.current = true; // 처리 시작
    hasConfirmedRef.current = true; // 실행 표시

    async function confirm() {
      try {
        setLoading(true);
        // 백엔드 API로 직접 결제 승인 요청
        // 백엔드의 PaymentService가 토스 페이먼츠 API를 호출하고 결제 정보를 저장합니다
        const response = await fetch("http://localhost:8080/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey: requestData.paymentKey,
            orderId: requestData.orderId,
            amount: parseInt(requestData.amount),
          }),
        });

        // 응답 본문을 안전하게 파싱
        let json;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            json = await response.json();
          } catch (e) {
            console.error("JSON 파싱 실패:", e);
            const text = await response.text();
            console.error("응답 본문:", text);
            throw new Error("서버 응답을 파싱할 수 없습니다.");
          }
        } else {
          const text = await response.text();
          console.error("JSON이 아닌 응답:", text);
          throw new Error("서버가 JSON 형식으로 응답하지 않았습니다.");
        }

        if (!response.ok) {
          // 결제 실패 비즈니스 로직
          const errorMessage = json?.message || json?.error || response.statusText || "결제 승인에 실패했습니다.";
          const errorCode = json?.code || String(response.status);
          console.error("결제 승인 실패:", {
            status: response.status,
            statusText: response.statusText,
            body: json
          });
          setError(errorMessage);
          setLoading(false);
          if (onNavigate) {
            onNavigate('payment-fail', { 
              message: errorMessage,
              code: errorCode
            });
          }
          return;
        }

        // 결제 성공 비즈니스 로직
        console.log("결제 승인 성공:", json);
        
        // 처리 완료 표시 (localStorage에 저장)
        if (typeof window !== 'undefined') {
          const processedKey = `payment_processed_${requestData.paymentKey}`;
          localStorage.setItem(processedKey, 'true');
        }
        
        setLoading(false);
        isProcessingRef.current = false;
        
        // 결제 성공 페이지로 이동
        if (onNavigate) {
          setTimeout(() => {
            onNavigate('payment-success', { amount: parseInt(requestData.amount) });
          }, 2000);
        }
      } catch (err) {
        console.error("결제 승인 요청 실패:", err);
        setError(err.message || "결제 승인 요청에 실패했습니다.");
        setLoading(false);
        isProcessingRef.current = false; // 처리 실패 시 플래그 해제
      }
    }
    confirm();
    
    // cleanup 함수 - 컴포넌트 언마운트 시 처리 중 플래그 해제
    return () => {
      // cleanup은 하지 않음 (한 번만 실행되어야 하므로)
    };
  }, [searchParams]); // searchParams가 변경될 때만 재실행

  if (loading) {
    return (
      <div className="result wrapper">
        <div className="box_section">
          <h2 style={{ padding: "20px 0px 10px 0px" }}>결제 승인 중...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result wrapper">
        <div className="box_section">
          <h2 style={{ padding: "20px 0px 10px 0px" }}>
            <img
              width="30px"
              src="https://static.toss.im/3d-emojis/u1F6A8-apng.png"
            />
            결제 승인 실패
          </h2>
          <p>{error}</p>
          <div style={{ marginTop: "20px" }}>
            <button 
              className="button"
              onClick={() => {
                router.push('/');
              }}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result wrapper">
      <div className="box_section">
        <h2 style={{ padding: "20px 0px 10px 0px" }}>
          <img
            width="35px"
            src="https://static.toss.im/3d-emojis/u1F389_apng.png"
          />
          결제 성공
        </h2>
        {paymentInfo && (
          <>
            <p>{`주문번호: ${paymentInfo.orderId}`}</p>
            <p>{`결제 금액: ${Number(paymentInfo.amount).toLocaleString()}원`}</p>
            <p style={{ fontSize: "12px", color: "#666", wordBreak: "break-all" }}>
              {`paymentKey: ${paymentInfo.paymentKey}`}
            </p>
          </>
        )}
        <div style={{ marginTop: "20px" }}>
          <button 
            className="button"
            onClick={() => {
              router.push('/');
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

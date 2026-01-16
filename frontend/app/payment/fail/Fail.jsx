'use client';

import React from "react";
import { useSearchParams } from "next/navigation";
import "../../../styles/App.css";

export function FailPage({ onNavigate }) {
  const searchParams = useSearchParams();
  
  // URL 파라미터에서 에러 정보 가져오기 (Next.js useSearchParams 사용)
  const getUrlParams = () => {
    if (!searchParams) return {};
    return {
      code: searchParams.get("code"),
      message: searchParams.get("message"),
      error: searchParams.get("error"),
    };
  };

  const [errorInfo, setErrorInfo] = React.useState(getUrlParams());

  React.useEffect(() => {
    // URL 파라미터가 변경되면 업데이트
    if (searchParams) {
    const params = getUrlParams();
    setErrorInfo(params);
    }
  }, [searchParams]);

  return (
    <div className="result wrapper">
    <div className="box_section">  
      <h2 style={{padding: "20px 0px 10px 0px"}}>
          <img
            width="30px"
            src="https://static.toss.im/3d-emojis/u1F6A8-apng.png"
          />
          결제 실패
      </h2>
      <p>{errorInfo.code && `에러 코드: ${errorInfo.code}`}</p>
      <p>{errorInfo.message && `실패 사유: ${errorInfo.message}`}</p>
      <p>{errorInfo.error && `오류: ${errorInfo.error}`}</p>
      
      <div style={{ marginTop: "20px" }}>
        <button 
          className="button"
          onClick={() => onNavigate && onNavigate('home')}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  </div>
  );
}

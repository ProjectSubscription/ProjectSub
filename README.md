# Premium Content Subscription Platform

프리미엄 콘텐츠 구독 플랫폼입니다. 크리에이터들이 전문 콘텐츠를 제공하고, 사용자들이 구독하거나 개별 콘텐츠를 구매할 수 있는 서비스입니다.

## 🚀 프로젝트 소개

이 프로젝트는 크리에이터 기반의 프리미엄 콘텐츠 구독 플랫폼으로, 다음과 같은 기능을 제공합니다:

- **구독 서비스**: 크리에이터별 월간/연간 구독
- **결제 시스템**: 토스페이먼츠 연동 결제
- **쿠폰 시스템**: 할인 쿠폰 발급 및 사용
- **크리에이터 관리**: 크리에이터 신청 및 승인 프로세스
- **콘텐츠 관리**: 무료/프리미엄 콘텐츠 게시 및 관리
- **OAuth 로그인**: 카카오, 구글, 네이버 소셜 로그인

## 🛠 기술 스택

### Backend
- **Java 21**
- **Spring Boot 3.5.9**
- **Spring Security** (OAuth2)
- **Spring Data JPA**
- **Spring Batch**
- **MySQL 8.0**
- **Redis 7** (캐싱)
- **Gradle**

### Frontend
- **Next.js 16.1.1**
- **React 19.2.3**
- **Tailwind CSS 4**
- **Radix UI** (컴포넌트 라이브러리)
- **React Hook Form**
- **Axios**

### Infrastructure
- **Docker & Docker Compose**
- **MySQL**
- **Redis**

## 📋 주요 기능

### 1. 사용자 기능
- OAuth 소셜 로그인 (카카오, 구글, 네이버)
- 회원 정보 관리
- 구독 채널 관리
- 콘텐츠 조회 및 구매
- 쿠폰 관리
- 결제 내역 조회

### 2. 크리에이터 기능
- 크리에이터 신청 및 승인
- 구독 상품 관리
- 콘텐츠 게시 및 관리
- 무료/프리미엄 콘텐츠 구분

### 3. 관리자 기능
- 크리에이터 신청 승인/반려
- 사용자 관리
- 콘텐츠 관리

### 4. 결제 시스템
- 토스페이먼츠 연동
- 구독 결제
- 콘텐츠 구매 결제
- 쿠폰 적용 결제

## 🏗 프로젝트 구조

```
ProjectSub/
├── backend/              # Spring Boot 백엔드
│   ├── src/
│   │   ├── main/java/    # Java 소스 코드
│   │   └── main/resources/ # 설정 파일
│   └── build.gradle      # Gradle 빌드 설정
├── frontend/             # Next.js 프론트엔드
│   ├── app/              # Next.js App Router
│   ├── components/       # React 컴포넌트
│   └── package.json      # npm 의존성
├── docker-compose.yml    # Docker Compose 설정
└── README.md            # 프로젝트 설명서
```

## 📚 API 문서

### 주요 API 엔드포인트

- **인증**: `/oauth2/authorization/{provider}` - OAuth 로그인
- **회원**: `/api/members/me` - 회원 정보 조회/수정
- **크리에이터**: `/api/creators/{id}` - 크리에이터 정보 조회
- **구독**: `/api/subscriptions` - 구독 관리
- **결제**: `/api/payments` - 결제 처리
- **쿠폰**: `/api/coupons` - 쿠폰 관리
- **콘텐츠**: `/api/posts` - 콘텐츠 관리

## 🗄 데이터베이스

MySQL 데이터베이스를 사용합니다. 

## 🔐 보안

- Spring Security를 사용한 인증/인가
- OAuth2를 통한 소셜 로그인
- 세션 기반 인증
- CSRF 보호
- SQL Injection 방지 (JPA 사용)
- 환경 변수를 통한 민감 정보 관리
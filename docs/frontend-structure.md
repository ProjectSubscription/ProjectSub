# Frontend 디렉토리 구조

이 문서는 Next.js App Router를 사용하는 Frontend 프로젝트의 디렉토리 구조를 설명합니다.

## 전체 구조

```
frontend/
├── app/                          # Next.js App Router 메인 디렉토리 (라우팅만)
│   ├── admin/                    # 관리자 페이지
│   │   ├── applications/
│   │   │   └── page.js          # 판매자 신청 관리
│   │   ├── payments/
│   │   │   └── page.js          # 결제 내역 관리
│   │   └── settlements/
│   │       └── page.js          # 정산 관리
│   ├── channels/                 # 채널 관련 페이지
│   │   ├── [id]/
│   │   │   └── page.js          # 채널 상세 페이지 (동적 라우트)
│   │   └── page.js              # 채널 목록 페이지
│   ├── contents/                 # 콘텐츠 관련 페이지
│   │   └── [id]/
│   │       └── page.js           # 콘텐츠 상세 페이지 (동적 라우트)
│   ├── creator/                  # 크리에이터 관련 페이지
│   │   ├── apply/
│   │   │   └── page.js           # 크리에이터 신청
│   │   ├── channel/
│   │   │   └── page.js           # 채널 관리
│   │   ├── content/
│   │   │   ├── new/
│   │   │   │   └── page.js       # 새 콘텐츠 업로드
│   │   │   └── page.js           # 콘텐츠 관리
│   │   ├── dashboard/
│   │   │   └── page.js           # 크리에이터 대시보드
│   │   └── settlement/
│   │       └── page.js            # 정산 관리
│   ├── home/
│   │   └── page.js               # 홈 페이지
│   ├── lib/                      # 유틸리티 및 헬퍼 함수
│   │   └── api.js                # 백엔드 API 통신 함수
│   ├── login/
│   │   └── page.js               # 로그인 페이지
│   ├── my-coupons/
│   │   └── page.js               # 보유 쿠폰
│   ├── my-purchases/
│   │   └── page.js               # 구매한 콘텐츠
│   ├── my-reviews/
│   │   └── page.js               # 내 리뷰
│   ├── my-subscriptions/
│   │   └── page.js               # 내 구독
│   ├── mypage/
│   │   └── page.js               # 마이페이지
│   ├── password-reset/
│   │   └── page.js               # 비밀번호 재설정
│   ├── password-reset-request/
│   │   └── page.js               # 비밀번호 재설정 요청
│   ├── payment/
│   │   ├── success/
│   │   │   └── page.js           # 결제 성공
│   │   └── page.js               # 결제 페이지
│   ├── favicon.ico
│   ├── globals.css               # 전역 스타일
│   ├── layout.js                 # 루트 레이아웃
│   ├── mockData.js               # 목업 데이터
│   ├── page.js                   # 루트 페이지 (Landing)
│   └── types.js                  # TypeScript 타입 정의
├── components/                   # 모든 React 컴포넌트 (app 밖으로 이동)
│   ├── pages/                    # 페이지 레벨 컴포넌트
│   │   ├── AdminApplicationsPage.jsx
│   │   ├── ChannelDetailPage.jsx
│   │   ├── ContentDetailPage.jsx
│   │   ├── CreatorDashboard.jsx
│   │   ├── HomePage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── PasswordResetPage.jsx
│   │   ├── PasswordResetRequestPage.jsx
│   │   ├── PaymentPage.jsx
│   │   ├── PaymentSuccessPage.jsx
│   │   └── UserPages.jsx
│   ├── channel/                  # 채널 관련 컴포넌트
│   │   ├── ChannelHeader.jsx
│   │   ├── ChannelTabs.jsx
│   │   ├── SubscriptionPlans.jsx
│   │   ├── ContentGrid.jsx
│   │   └── ChannelAbout.jsx
│   ├── content/                  # 콘텐츠 관련 컴포넌트
│   │   ├── VideoPlayer.jsx
│   │   ├── ContentInfo.jsx
│   │   ├── ReviewSection.jsx
│   │   └── ContentSidebar.jsx
│   ├── home/                     # 홈 페이지 컴포넌트
│   │   ├── HeroBanner.jsx
│   │   ├── TrendingChannels.jsx
│   │   ├── NewContent.jsx
│   │   └── CategoryChannels.jsx
│   ├── landing/                  # 랜딩 페이지 컴포넌트
│   │   ├── HeroSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   ├── PopularChannelsSection.jsx
│   │   ├── FreeContentSection.jsx
│   │   ├── CategoryRankingSection.jsx
│   │   └── CTASection.jsx
│   ├── login/                    # 로그인 페이지 컴포넌트
│   │   ├── LoginMethodToggle.jsx
│   │   ├── OAuthButtons.jsx
│   │   ├── EmailLoginForm.jsx
│   │   └── DemoAccounts.jsx
│   ├── payment/                  # 결제 페이지 컴포넌트
│   │   ├── PaymentItemInfo.jsx
│   │   ├── CouponSection.jsx
│   │   ├── PaymentMethod.jsx
│   │   └── PaymentSummary.jsx
│   ├── ClientLayout.jsx         # 클라이언트 레이아웃 (Header, Sidebar, Footer 포함)
│   ├── Header.jsx                # 헤더 컴포넌트
│   ├── Sidebar.jsx               # 사이드바 컴포넌트
│   ├── Footer.jsx                # 푸터 컴포넌트
│   ├── figma/                    # Figma 관련 컴포넌트
│   └── ui/                       # UI 컴포넌트 라이브러리 (shadcn/ui)
│       ├── button.jsx
│       ├── card.jsx
│       ├── input.jsx
│       └── ... (기타 UI 컴포넌트들)
├── public/                       # 정적 파일
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── styles/                       # 추가 스타일 파일
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css
├── .gitignore
├── Dockerfile
├── eslint.config.mjs
├── jsconfig.json                 # 절대 경로 alias 설정
├── next.config.mjs
├── package.json
├── package-lock.json
├── postcss.config.mjs
└── README.md
```

## 주요 디렉토리 설명

### `/app` - Next.js App Router

Next.js 13+ App Router를 사용하는 메인 디렉토리입니다. 각 폴더는 라우트를 나타내며, `page.js` 파일이 해당 라우트의 페이지 컴포넌트입니다.

#### 라우트 구조

- **공개 페이지**
  - `/` - 랜딩 페이지
  - `/login` - 로그인 페이지
  - `/password-reset-request` - 비밀번호 재설정 요청
  - `/password-reset` - 비밀번호 재설정

- **인증 필요 페이지**
  - `/home` - 홈 페이지
  - `/channels` - 채널 목록
  - `/channels/[id]` - 채널 상세 (동적 라우트)
  - `/contents/[id]` - 콘텐츠 상세 (동적 라우트)
  - `/payment` - 결제 페이지
  - `/payment/success` - 결제 성공

- **마이페이지**
  - `/mypage` - 마이페이지 메인
  - `/my-subscriptions` - 내 구독
  - `/my-purchases` - 구매한 콘텐츠
  - `/my-reviews` - 내 리뷰
  - `/my-coupons` - 보유 쿠폰

- **크리에이터 페이지**
  - `/creator/apply` - 크리에이터 신청
  - `/creator/dashboard` - 크리에이터 대시보드
  - `/creator/channel` - 채널 관리
  - `/creator/content` - 콘텐츠 관리
  - `/creator/content/new` - 새 콘텐츠 업로드
  - `/creator/settlement` - 정산 관리

- **관리자 페이지**
  - `/admin/applications` - 판매자 신청 관리
  - `/admin/payments` - 결제 내역 관리
  - `/admin/settlements` - 정산 관리

#### `/components` - 모든 React 컴포넌트

프로젝트의 모든 React 컴포넌트를 포함하는 디렉토리입니다. `app` 디렉토리 밖에 위치하여 프로젝트 전체에서 공통으로 사용할 수 있습니다.

**절대 경로 사용**: `jsconfig.json`에 설정된 alias를 통해 `@/components/...` 형태로 import합니다.

##### `/components/pages` - 페이지 레벨 컴포넌트

각 라우트의 `page.js`에서 사용하는 페이지 컴포넌트들입니다. 여러 세부 컴포넌트를 조합하여 구성됩니다.

- **AdminApplicationsPage.jsx**: 판매자 신청 관리 페이지
- **ChannelDetailPage.jsx**: 채널 상세 페이지
- **ContentDetailPage.jsx**: 콘텐츠 상세 페이지
- **CreatorDashboard.jsx**: 크리에이터 대시보드
- **HomePage.jsx**: 홈 페이지
- **LandingPage.jsx**: 랜딩 페이지
- **LoginPage.jsx**: 로그인 페이지
- **PasswordResetPage.jsx**: 비밀번호 재설정 페이지
- **PasswordResetRequestPage.jsx**: 비밀번호 재설정 요청 페이지
- **PaymentPage.jsx**: 결제 페이지
- **PaymentSuccessPage.jsx**: 결제 성공 페이지
- **UserPages.jsx**: 사용자 페이지 (MyPage, MySubscriptionsPage)

##### `/components/channel` - 채널 관련 컴포넌트

- **ChannelHeader.jsx**: 채널 헤더 (채널 정보, 구독 버튼)
- **ChannelTabs.jsx**: 채널 탭 네비게이션
- **SubscriptionPlans.jsx**: 구독 상품 목록
- **ContentGrid.jsx**: 채널 콘텐츠 그리드
- **ChannelAbout.jsx**: 채널 소개 섹션

##### `/components/content` - 콘텐츠 관련 컴포넌트

- **VideoPlayer.jsx**: 비디오 플레이어
- **ContentInfo.jsx**: 콘텐츠 정보 (제목, 통계, 설명)
- **ReviewSection.jsx**: 리뷰 섹션 (리뷰 목록, 작성 폼)
- **ContentSidebar.jsx**: 콘텐츠 사이드바 (채널 정보, 관련 콘텐츠)

##### `/components/home` - 홈 페이지 컴포넌트

- **HeroBanner.jsx**: 히어로 배너
- **TrendingChannels.jsx**: 인기 급상승 채널
- **NewContent.jsx**: 최신 콘텐츠
- **CategoryChannels.jsx**: 카테고리별 채널

##### `/components/landing` - 랜딩 페이지 컴포넌트

- **HeroSection.jsx**: 히어로 섹션
- **FeaturesSection.jsx**: 기능 소개 섹션
- **PopularChannelsSection.jsx**: 인기 채널 섹션
- **FreeContentSection.jsx**: 무료 콘텐츠 섹션
- **CategoryRankingSection.jsx**: 카테고리별 랭킹 섹션
- **CTASection.jsx**: CTA (Call to Action) 섹션

##### `/components/login` - 로그인 페이지 컴포넌트

- **LoginMethodToggle.jsx**: 로그인 방법 전환 (소셜/이메일)
- **OAuthButtons.jsx**: OAuth 로그인 버튼들
- **EmailLoginForm.jsx**: 이메일 로그인 폼
- **DemoAccounts.jsx**: 데모 계정 버튼들

##### `/components/payment` - 결제 페이지 컴포넌트

- **PaymentItemInfo.jsx**: 구매 정보
- **CouponSection.jsx**: 쿠폰/할인코드 섹션
- **PaymentMethod.jsx**: 결제 수단 선택
- **PaymentSummary.jsx**: 결제 요약

##### 공통 컴포넌트

- **ClientLayout.jsx**: 클라이언트 사이드 레이아웃 컴포넌트
  - 사용자 인증 상태 관리
  - Header, Sidebar, Footer 포함
  - 공개/인증 페이지 구분

- **Header.jsx**: 상단 네비게이션 바
  - 로고 및 검색 기능
  - 사용자 메뉴
  - 알림

- **Sidebar.jsx**: 사이드바 네비게이션
  - 역할별 메뉴 (USER, CREATOR, ADMIN)
  - 반응형 디자인 (모바일/데스크톱)

- **Footer.jsx**: 푸터 컴포넌트

- **ui/**: shadcn/ui 기반 UI 컴포넌트 라이브러리

#### `/app/lib`

유틸리티 함수 및 헬퍼 함수들입니다.

- **api.js**: 백엔드 API 통신 함수
  - Spring Boot API와 연동
  - 세션 기반 인증 지원
  - 모든 API 엔드포인트에 대한 함수 제공

### `/public`

정적 파일들 (이미지, 아이콘 등)을 저장하는 디렉토리입니다.

### `/styles`

추가 CSS 파일들입니다.

## 파일 설명

### 주요 설정 파일

- **next.config.mjs**: Next.js 설정 파일
- **package.json**: 프로젝트 의존성 및 스크립트
- **jsconfig.json**: JavaScript 프로젝트 설정
  - 절대 경로 alias 설정 (`@/components/*`, `@/app/*`)
  - `@/components/...` 형태로 컴포넌트 import 가능
  - `@/app/...` 형태로 app 디렉토리 파일 import 가능
- **eslint.config.mjs**: ESLint 설정
- **postcss.config.mjs**: PostCSS 설정
- **Dockerfile**: Docker 이미지 빌드 설정

### 주요 소스 파일

- **app/layout.js**: 루트 레이아웃 (메타데이터, 폰트 설정)
- **app/page.js**: 루트 페이지 (랜딩 페이지)
- **app/types.js**: 타입 정의 (UserRole, ContentAccessType, PageRoute 등)
- **app/mockData.js**: 개발용 목업 데이터

## 라우팅 규칙

Next.js App Router는 파일 시스템 기반 라우팅을 사용합니다:

- `page.js` 파일이 있는 폴더가 라우트가 됩니다
- `[id]` 같은 동적 세그먼트는 동적 라우트를 생성합니다
- `layout.js`는 해당 폴더와 하위 폴더에 공통 레이아웃을 적용합니다

## Import 경로 규칙

프로젝트에서는 절대 경로 alias를 사용합니다 (`jsconfig.json` 설정):

- **컴포넌트 import**: `@/components/...`
  ```javascript
  import { HomePage } from '@/components/pages/HomePage';
  import { Header } from '@/components/Header';
  ```

- **app 디렉토리 파일 import**: `@/app/...`
  ```javascript
  import { mockChannels } from '@/app/mockData';
  import { PageRoute } from '@/app/types';
  import { getMyInfo } from '@/app/lib/api';
  ```

이렇게 하면 상대 경로(`../`, `../../`)를 사용하지 않고도 깔끔하게 import할 수 있습니다.

### jsconfig.json 설정

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/app/*": ["./app/*"]
    }
  }
}
```

## 백엔드 연동

백엔드 API는 `app/lib/api.js`를 통해 호출합니다. 환경 변수 `NEXT_PUBLIC_API_BASE_URL`을 설정하여 백엔드 서버 주소를 지정할 수 있습니다.

기본값: `http://localhost:8080`

## 개발 환경 설정

1. 환경 변수 설정 (`.env.local` 파일 생성)
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

2. 의존성 설치
   ```bash
   npm install
   ```

3. 개발 서버 실행
   ```bash
   npm run dev
   ```

4. 빌드
   ```bash
   npm run build
   ```

5. 프로덕션 실행
   ```bash
   npm start
   ```

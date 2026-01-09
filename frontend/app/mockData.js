// Mock Users
export const mockUsers = [
  {
    id: 'user-1',
    email: 'user@example.com',
    name: '김사용자',
    role: 'USER',
    profileImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400',
    creatorStatus: 'NONE'
  },
  {
    id: 'creator-1',
    email: 'creator@example.com',
    name: '이크리에이터',
    role: 'CREATOR',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    creatorStatus: 'APPROVED'
  },
  {
    id: 'admin-1',
    email: 'admin@example.com',
    name: '관리자',
    role: 'ADMIN',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
  }
];

// Mock Channels
export const mockChannels = [
  {
    id: 'channel-1',
    creatorId: 'creator-1',
    creatorName: '이크리에이터',
    name: '디지털 아트 마스터클래스',
    description: '프로 일러스트레이터가 알려주는 디지털 드로잉의 모든 것',
    thumbnailUrl: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    subscriberCount: 1253,
    category: '예술',
    createdAt: '2024-01-15'
  },
  {
    id: 'channel-2',
    creatorId: 'creator-2',
    creatorName: '박교육',
    name: '온라인 코딩 부트캠프',
    description: '초보자도 6개월이면 개발자가 될 수 있습니다',
    thumbnailUrl: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    subscriberCount: 3420,
    category: '교육',
    createdAt: '2023-11-20'
  },
  {
    id: 'channel-3',
    creatorId: 'creator-3',
    creatorName: '최음악',
    name: '프로듀싱 101',
    description: '음악 프로듀싱의 A to Z, 기초부터 실전까지',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    subscriberCount: 892,
    category: '음악',
    createdAt: '2024-02-10'
  },
  {
    id: 'channel-4',
    creatorId: 'creator-4',
    creatorName: '김헬스',
    name: '홈트레이닝 완전정복',
    description: '집에서도 가능한 전문가급 운동 루틴',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    subscriberCount: 2156,
    category: '건강',
    createdAt: '2023-12-05'
  },
  {
    id: 'channel-5',
    creatorId: 'creator-5',
    creatorName: '정요리',
    name: '비건 쿠킹 클래스',
    description: '건강하고 맛있는 비건 레시피를 배워보세요',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    subscriberCount: 1678,
    category: '요리',
    createdAt: '2024-01-03'
  },
  {
    id: 'channel-6',
    creatorId: 'creator-1',
    creatorName: '이크리에이터',
    name: '크리에이터 워크스페이스',
    description: '창작자를 위한 생산성 향상 팁과 도구',
    thumbnailUrl: 'https://images.unsplash.com/photo-1746440160680-2c50206e568a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    subscriberCount: 987,
    category: '비즈니스',
    createdAt: '2024-03-01'
  }
];

// Mock Subscription Plans
export const mockSubscriptionPlans = [
  {
    id: 'plan-1',
    channelId: 'channel-1',
    name: '월간 구독',
    price: 19900,
    duration: 'MONTHLY',
    description: '모든 강의 무제한 시청'
  },
  {
    id: 'plan-2',
    channelId: 'channel-1',
    name: '연간 구독',
    price: 199000,
    duration: 'YEARLY',
    description: '모든 강의 무제한 시청 + 특별 보너스 강의'
  },
  {
    id: 'plan-3',
    channelId: 'channel-2',
    name: '월간 구독',
    price: 29900,
    duration: 'MONTHLY',
    description: '모든 코딩 강의 + Q&A 채팅방'
  },
  {
    id: 'plan-4',
    channelId: 'channel-2',
    name: '연간 구독',
    price: 299000,
    duration: 'YEARLY',
    description: '모든 강의 + 1:1 코드 리뷰 월 1회'
  }
];

// Mock Contents
export const mockContents = [
  {
    id: 'content-1',
    channelId: 'channel-1',
    title: '디지털 드로잉 기초 - 레이어 이해하기',
    description: '디지털 작업의 핵심인 레이어 시스템을 완벽히 마스터합니다',
    thumbnailUrl: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=600',
    accessType: 'FREE',
    previewRatio: 100,
    viewCount: 5420,
    likeCount: 432,
    createdAt: '2024-11-15',
    status: 'PUBLISHED'
  },
  {
    id: 'content-2',
    channelId: 'channel-1',
    title: '캐릭터 드로잉 실전 테크닉',
    description: '프로가 사용하는 캐릭터 디자인 노하우',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    accessType: 'SUBSCRIPTION',
    previewRatio: 20,
    viewCount: 3210,
    likeCount: 289,
    createdAt: '2024-11-20',
    status: 'PUBLISHED'
  },
  {
    id: 'content-3',
    channelId: 'channel-1',
    title: '색감 마스터하기 - 고급편',
    description: '색채 이론부터 실전 활용까지',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
    accessType: 'PAID',
    price: 15000,
    previewRatio: 10,
    viewCount: 1890,
    likeCount: 156,
    createdAt: '2024-12-01',
    status: 'PUBLISHED'
  },
  {
    id: 'content-4',
    channelId: 'channel-2',
    title: 'HTML/CSS 완전 기초',
    description: '웹 개발의 첫 걸음을 시작하세요',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600',
    accessType: 'FREE',
    previewRatio: 100,
    viewCount: 8934,
    likeCount: 712,
    createdAt: '2024-10-01',
    status: 'PUBLISHED'
  },
  {
    id: 'content-5',
    channelId: 'channel-2',
    title: 'React 실전 프로젝트',
    description: '실무에서 바로 쓰는 React 개발',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
    accessType: 'SUBSCRIPTION',
    previewRatio: 15,
    viewCount: 4521,
    likeCount: 387,
    createdAt: '2024-11-10',
    status: 'PUBLISHED'
  },
  {
    id: 'content-6',
    channelId: 'channel-3',
    title: '비트 메이킹 입문',
    description: '처음 시작하는 음악 프로듀싱',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',
    accessType: 'FREE',
    previewRatio: 100,
    viewCount: 2314,
    likeCount: 198,
    createdAt: '2024-11-05',
    status: 'PUBLISHED'
  }
];

// Mock User Subscriptions
export const mockUserSubscriptions = [
  {
    id: 'sub-1',
    userId: 'user-1',
    channelId: 'channel-1',
    planId: 'plan-1',
    startDate: '2024-11-01',
    endDate: '2024-12-01',
    status: 'ACTIVE'
  },
  {
    id: 'sub-2',
    userId: 'user-1',
    channelId: 'channel-2',
    planId: 'plan-3',
    startDate: '2024-10-15',
    endDate: '2024-11-15',
    status: 'EXPIRED'
  }
];

// Mock Purchases
export const mockPurchases = [
  {
    id: 'purchase-1',
    userId: 'user-1',
    contentId: 'content-3',
    amount: 15000,
    createdAt: '2024-12-05'
  }
];

// Mock Payments
export const mockPayments = [
  {
    id: 'payment-1',
    userId: 'user-1',
    type: 'SUBSCRIPTION',
    amount: 19900,
    discount: 0,
    finalAmount: 19900,
    status: 'SUCCESS',
    createdAt: '2024-11-01'
  },
  {
    id: 'payment-2',
    userId: 'user-1',
    type: 'SINGLE',
    amount: 15000,
    discount: 1500,
    finalAmount: 13500,
    status: 'SUCCESS',
    createdAt: '2024-12-05',
    couponId: 'coupon-1'
  },
  {
    id: 'payment-3',
    userId: 'user-1',
    type: 'SUBSCRIPTION',
    amount: 29900,
    discount: 0,
    finalAmount: 29900,
    status: 'SUCCESS',
    createdAt: '2024-10-15'
  }
];

// Mock Coupons
export const mockCoupons = [
  {
    id: 'coupon-1',
    code: 'WELCOME10',
    discountType: 'PERCENT',
    discountValue: 10,
    minAmount: 10000,
    maxDiscount: 5000,
    expiresAt: '2025-12-31',
    isUsed: true
  },
  {
    id: 'coupon-2',
    code: 'NEWYEAR2025',
    discountType: 'FIXED',
    discountValue: 5000,
    minAmount: 20000,
    expiresAt: '2025-01-31',
    isUsed: false
  },
  {
    id: 'coupon-3',
    code: 'FIRST20',
    discountType: 'PERCENT',
    discountValue: 20,
    minAmount: 15000,
    maxDiscount: 10000,
    expiresAt: '2025-06-30',
    isUsed: false
  }
];

// Mock Reviews
export const mockReviews = [
  {
    id: 'review-1',
    userId: 'user-1',
    userName: '김사용자',
    contentId: 'content-1',
    rating: 5,
    comment: '정말 유익한 강의였습니다! 초보자도 쉽게 따라할 수 있어요.',
    createdAt: '2024-11-20'
  },
  {
    id: 'review-2',
    userId: 'user-2',
    userName: '박학생',
    contentId: 'content-1',
    rating: 4,
    comment: '설명이 친절하고 좋았어요. 다만 조금 더 심화 내용이 있었으면 합니다.',
    createdAt: '2024-11-22'
  },
  {
    id: 'review-3',
    userId: 'user-3',
    userName: '최구독자',
    contentId: 'content-2',
    rating: 5,
    comment: '프로의 노하우를 배울 수 있어서 좋았습니다. 강력 추천!',
    createdAt: '2024-11-25'
  }
];

// Mock Settlements
export const mockSettlements = [
  {
    id: 'settlement-1',
    creatorId: 'creator-1',
    month: '2024-11',
    totalRevenue: 5430000,
    commission: 543000,
    netAmount: 4887000,
    status: 'READY'
  },
  {
    id: 'settlement-2',
    creatorId: 'creator-1',
    month: '2024-10',
    totalRevenue: 4890000,
    commission: 489000,
    netAmount: 4401000,
    status: 'COMPLETED',
    completedAt: '2024-11-05'
  },
  {
    id: 'settlement-3',
    creatorId: 'creator-1',
    month: '2024-09',
    totalRevenue: 3210000,
    commission: 321000,
    netAmount: 2889000,
    status: 'COMPLETED',
    completedAt: '2024-10-05'
  }
];

// Mock Creator Applications
export const mockCreatorApplications = [
  {
    id: 'app-1',
    userId: 'user-5',
    userName: '신청자A',
    email: 'applicant-a@example.com',
    channelName: '포토그래피 클래스',
    description: '10년 경력의 사진작가입니다. 초보자를 위한 사진 촬영 및 보정 강의를 진행하고 싶습니다.',
    status: 'PENDING',
    createdAt: '2025-01-05'
  },
  {
    id: 'app-2',
    userId: 'user-6',
    userName: '신청자B',
    email: 'applicant-b@example.com',
    channelName: '글쓰기 특강',
    description: '베스트셀러 작가의 글쓰기 노하우를 공유하고 싶습니다.',
    status: 'PENDING',
    createdAt: '2025-01-07'
  },
  {
    id: 'app-3',
    userId: 'user-7',
    userName: '신청자C',
    email: 'applicant-c@example.com',
    channelName: '부동산 투자',
    description: '부동산 투자 관련 강의',
    status: 'REJECTED',
    rejectionReason: '서비스 정책상 투자 관련 콘텐츠는 제한됩니다.',
    createdAt: '2025-01-03'
  }
];

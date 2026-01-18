/**
 * API 통신 유틸리티
 * 백엔드 Spring Boot API와 연동
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * API 요청 헬퍼 함수
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    credentials: 'include', // 쿠키 포함 (세션 기반 인증)
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    // 401 Unauthorized 에러에 대한 특별 처리
    if (response.status === 401) {
      const error = await response.json().catch(() => ({ message: '인증에 실패했습니다.' }));
      throw new Error(error.message || '인증에 실패했습니다.');
    }
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // 204 No Content는 빈 응답
  if (response.status === 204) {
    return null;
  }

  // 응답 본문을 텍스트로 먼저 읽어서 비어있는지 확인
  const text = await response.text();
  
  // 빈 응답인 경우 null 반환
  if (!text || text.trim() === '') {
    return null;
  }

  // JSON 파싱 시도
  try {
    return JSON.parse(text);
  } catch (error) {
    // JSON 파싱 실패 시 null 반환 (빈 응답으로 처리)
    console.warn('JSON 파싱 실패, 빈 응답으로 처리:', error);
    return null;
  }
}

/**
 * GET 요청
 */
export async function apiGet(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return apiRequest(url, { method: 'GET' });
}

/**
 * POST 요청
 */
export async function apiPost(endpoint, data = {}) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT 요청
 */
export async function apiPut(endpoint, data = {}) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * PATCH 요청
 */
export async function apiPatch(endpoint, data = {}) {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE 요청
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

// ==================== 인증 / 회원 ====================

/**
 * 일반 로그인 (이메일/비밀번호)
 * 커스텀 로그인 API 사용 (JSON 요청/응답)
 */
export async function login(email, password) {
  try {
    const userInfo = await apiPost('/api/auth/login', { email, password });
    return { success: true, user: userInfo };
  } catch (error) {
    // 401 에러에 대한 특별한 메시지 처리 (로그인 실패)
    if (error.message && (error.message.includes('401') || error.message.includes('인증에 실패'))) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    throw error;
  }
}

/**
 * OAuth 로그인 (리다이렉트)
 */
export function oauthLogin(provider) {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
}

/**
 * 로그아웃
 */
export async function logout() {
  return apiPost('/api/auth/logout');
}

/**
 * 회원가입
 */
export async function registerMember(data) {
  return apiPost('/api/members/register', data);
}

/**
 * 내 정보 조회
 */
export async function getMyInfo() {
  return apiGet('/api/members/me');
}

/**
 * 회원 정보 수정
 */
export async function updateMemberInfo(data) {
  return apiPut('/api/members/me', data);
}

/**
 * 비밀번호 변경
 */
export async function changePassword(currentPassword, newPassword) {
  return apiPatch('/api/members/password', {
    currentPassword,
    newPassword,
  });
}

/**
 * 닉네임 변경
 */
export async function changeNickname(newNickname) {
  return apiPatch('/api/members/nickname', {
    newNickname,
  });
}

/**
 * 생년 변경
 */
export async function changeBirthYear(birthYear) {
  return apiPatch('/api/members/birthyear', {
    birthYear,
  });
}

/**
 * 회원 탈퇴
 */
export async function deleteMember() {
  return apiDelete('/api/members/me');
}

/**
 * 비밀번호 재설정 요청 (이메일 발송)
 */
export async function requestPasswordReset(email) {
  return apiPost('/api/members/reset-password/request', { email });
}

/**
 * 비밀번호 재설정 (토큰 검증 후 변경)
 */
export async function resetPassword(token, newPassword) {
  return apiPost('/api/members/reset-password', {
    token,
    newPassword,
  });
}

// ==================== 판매자 (CREATOR) ====================

/**
 * 판매자 신청
 */
export async function createCreatorApplication(data) {
  return apiPost('/api/creators/applications', data);
}

/**
 * 내 신청 조회
 */
export async function getMyApplication() {
  return apiGet('/api/creators/applications/me');
}

/**
 * 모든 신청 이력 조회 (관리자)
 */
export async function getAllApplications(params = {}) {
  return apiGet('/api/admin/creators/applications', params);
}

/**
 * 신청 상세 조회
 */
export async function getApplicationDetail(applicationId) {
  return apiGet(`/api/creators/applications/${applicationId}`);
}

/**
 * 신청 승인/반려 (관리자)
 */
export async function approveApplication(applicationId, data) {
  return apiPost(`/api/admin/creators/applications/${applicationId}`, data);
}

/**
 * 판매자 정보 조회
 */
export async function getCreator(id) {
  return apiGet(`/api/creators/${id}`);
}

/**
 * 내 판매자 정보
 */
export async function getMyCreatorInfo() {
  return apiGet('/api/creators/me');
}

// ==================== 채널 (CHANNEL) ====================

/**
 * 채널 생성
 */
export async function createChannel(data) {
  return apiPost('/api/channels', data);
}

/**
 * 채널 수정
 */
export async function updateChannel(id, data) {
  return apiPut(`/api/channels/${id}`, data);
}

/**
 * 채널 조회
 */
export async function getChannel(id) {
  return apiGet(`/api/channels/${id}`);
}

/**
 * 채널 목록
 */
export async function getChannels(params = {}) {
  return apiGet('/api/channels', params);
}

// ==================== 구독 (SUBSCRIPTION) ====================

/**
 * 구독 상품 등록
 */
export async function createSubscriptionPlan(channelId, data) {
  return apiPost(`/api/channels/${channelId}/plans`, data);
}

/**
 * 구독 상품 조회
 */
export async function getSubscriptionPlans(channelId) {
  return apiGet(`/api/channels/${channelId}/plans`);
}

/**
 * 구독 신청
 */
export async function createSubscription(data) {
  return apiPost('/api/subscriptions', data);
}

/**
 * 내 구독 목록
 */
export async function getMySubscriptions() {
  return apiGet('/api/subscriptions/me');
}

/**
 * 구독 취소
 */
export async function cancelSubscription(id) {
  return apiPost(`/api/subscriptions/${id}/cancel`);
}

// ==================== 콘텐츠 (CONTENT) ====================

/**
 * 콘텐츠 등록
 */
export async function createContent(data) {
  return apiPost('/api/contents', data);
}

/**
 * 콘텐츠 수정
 */
export async function updateContent(id, data) {
  return apiPut(`/api/contents/${id}`, data);
}

/**
 * 콘텐츠 삭제
 */
export async function deleteContent(id) {
  return apiDelete(`/api/contents/${id}`);
}

/**
 * 콘텐츠 조회
 */
export async function getContent(id) {
  return apiGet(`/api/contents/${id}`);
}

/**
 * 콘텐츠 목록
 */
export async function getContents(params = {}) {
  return apiGet('/api/contents', params);
}

// ==================== 결제 (PAYMENT) ====================

/**
 * 단건 구매
 */
export async function purchaseContent(data) {
  return apiPost('/api/payments/content', data);
}

/**
 * 구독 결제
 */
export async function paySubscription(data) {
  return apiPost('/api/payments/subscription', data);
}

/**
 * 결제 내역
 */
export async function getMyPayments(params = {}) {
  return apiGet('/api/payments/me', params);
}

/**
 * 구독 결제 내역
 */
export async function getMySubscriptionPayments() {
  return apiGet('/api/payments/me/subscriptions');
}

/**
 * 콘텐츠 결제 내역
 */
export async function getMyContentPayments() {
  return apiGet('/api/payments/me/contents');
}

// ==================== 리뷰 / 댓글 ====================

/**
 * 리뷰 작성
 */
export async function createReview(contentId, data) {
  return apiPost(`/api/contents/${contentId}/reviews`, data);
}

/**
 * 리뷰 조회
 */
export async function getReviews(contentId) {
  return apiGet(`/api/contents/${contentId}/reviews`);
}

/**
 * 댓글 작성
 */
export async function createComment(contentId, data) {
  return apiPost(`/api/contents/${contentId}/comments`, data);
}

/**
 * 댓글 조회
 */
export async function getComments(contentId) {
  return apiGet(`/api/contents/${contentId}/comments`);
}

/**
 * 댓글 수정
 */
export async function updateComment(id, data) {
  return apiPut(`/api/comments/${id}`, data);
}

/**
 * 댓글 삭제
 */
export async function deleteComment(id) {
  return apiDelete(`/api/comments/${id}`);
}

/**
 * 내 댓글 목록
 */
export async function getMyComments(params = {}) {
  return apiGet('/api/comments/me', params);
}

// ==================== 메인페이지 (HOME) ====================

/**
 * 인기 후기
 */
export async function getPopularReviews(params = {}) {
  return apiGet('/api/home/popular-reviews', params);
}

/**
 * 무료 게시물
 */
export async function getFreeContents(params = {}) {
  return apiGet('/api/home/free-contents', params);
}

/**
 * 이번 주 인기 채널
 */
export async function getPopularChannels(params = {}) {
  return apiGet('/api/home/popular-channels', params);
}

/**
 * 게시물 추천
 */
export async function getRecommendedContents(params = {}) {
  return apiGet('/api/home/recommended-contents', params);
}

/**
 * 카테고리별 랭킹
 */
export async function getCategoryRankings(params = {}) {
  return apiGet('/api/home/rankings/category', params);
}

/**
 * 연령별 랭킹
 */
export async function getAgeRankings(params = {}) {
  return apiGet('/api/home/rankings/age', params);
}

/**
 * 신규 채널
 */
export async function getNewChannels(params = {}) {
  return apiGet('/api/home/new-channels', params);
}

/**
 * 이번 주 판매량
 */
export async function getTopSales(params = {}) {
  return apiGet('/api/home/top-sales', params);
}

// ==================== 쿠폰 ====================

/**
 * 쿠폰 등록
 */
export async function registerCoupon(data) {
  return apiPost('/api/coupons/register', data);
}

/**
 * 보유 쿠폰 목록
 */
export async function getMyCoupons(params = {}) {
  return apiGet('/api/coupons/me', params);
}

/**
 * 사용 가능 쿠폰
 */
export async function getAvailableCoupons() {
  return apiGet('/api/coupons/me/available');
}

/**
 * 종료된 쿠폰
 */
export async function getExpiredCoupons() {
  return apiGet('/api/coupons/me/expired');
}

// ==================== 마이페이지 ====================

/**
 * 설정 조회
 */
export async function getSettings() {
  return apiGet('/api/members/me/settings');
}

/**
 * 신규 콘텐츠 수신 설정
 */
export async function updateNewContentSetting(enabled) {
  return apiPut('/api/members/me/settings/new-content', { enabled });
}

/**
 * 뉴스레터 수신 설정
 */
export async function updateNewsletterSetting(enabled) {
  return apiPut('/api/members/me/settings/newsletter', { enabled });
}

/**
 * 소식받기 설정
 */
export async function updateNotificationsSetting(data) {
  return apiPut('/api/members/me/settings/notifications', data);
}

/**
 * 구독 채널 목록
 */
export async function getMySubscriptionChannels() {
  return apiGet('/api/subscriptions/me/channels');
}

/**
 * 구독 채널 최신 콘텐츠
 */
export async function getSubscriptionChannelContents(channelId, params = {}) {
  return apiGet(`/api/subscriptions/me/channels/${channelId}/contents`, params);
}

/**
 * 구매 콘텐츠 목록
 */
export async function getMyPurchases(params = {}) {
  return apiGet('/api/purchases/me', params);
}

/**
 * 이용 가능 콘텐츠
 */
export async function getAvailablePurchases() {
  return apiGet('/api/purchases/me/available');
}

/**
 * 기간 만료 콘텐츠
 */
export async function getExpiredPurchases() {
  return apiGet('/api/purchases/me/expired');
}

/**
 * 최근 본 콘텐츠
 */
export async function getViewedHistory(params = {}) {
  return apiGet('/api/history/viewed', params);
}

/**
 * 좋아요한 콘텐츠
 */
export async function getMyLikes(params = {}) {
  return apiGet('/api/likes/me', params);
}

/**
 * 콘텐츠 좋아요
 */
export async function likeContent(contentId) {
  return apiPost(`/api/contents/${contentId}/like`);
}

/**
 * 콘텐츠 좋아요 취소
 */
export async function unlikeContent(contentId) {
  return apiDelete(`/api/contents/${contentId}/like`);
}

/**
 * 최근 본 콘텐츠 조회
 */
export async function getRecentViewedContents(params = {}) {
  return apiGet('/api/contents/recent-viewed', params);
}

/**
 * 채널의 대표 콘텐츠 조회
 */
export async function getFeaturedContents(channelId) {
  return apiGet(`/api/contents/channels/${channelId}/featured`);
}

// ==================== 정산 ====================

/**
 * 정산 조회
 */
export async function getSettlements(params = {}) {
  return apiGet('/api/settlements', params);
}

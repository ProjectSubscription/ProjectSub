/**
 * API 통신 유틸리티
 * 백엔드 Spring Boot API와 연동
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

/**
 * API 요청 헬퍼 함수
 */
export async function apiRequest(endpoint, options = {}) {
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
  // undefined/null 파라미터는 쿼리에 포함되지 않도록 제거
  const filteredParams = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null)
  );
  const queryString = new URLSearchParams(filteredParams).toString();
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
  try {
    const oauthUrl = `${API_BASE_URL}/oauth2/authorization/${provider}`;
    console.log('OAuth 로그인 시도:', oauthUrl);
    window.location.href = oauthUrl;
  } catch (error) {
    console.error('OAuth 로그인 오류:', error);
    alert('소셜 로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

/**
 * 로그아웃
 */
export async function logout() {
  return apiPost('/api/auth/logout');
}

/**
 * OAuth 프로필 완성 (추가 정보 입력)
 */
export async function completeOAuthProfile(token, data) {
  return apiPost(`/api/oauth/complete-profile?token=${encodeURIComponent(token)}`, data);
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

// ==================== 정산 (SETTLEMENT) ====================

/**
 * 내 정산 목록 조회
 */
export async function getMySettlements() {
  return apiGet('/api/creators/me/settlements');
}

/**
 * 정산 상세 조회
 */
export async function getSettlementDetail(settlementId) {
  return apiGet(`/api/creators/me/settlements/${settlementId}`);
}

// ==================== 관리자 정산 (ADMIN SETTLEMENT) ====================

/**
 * 관리자용: 전체 정산 목록 조회
 */
export async function getAdminSettlements(params = {}) {
  return apiGet('/api/admin/settlements', params);
}

/**
 * 관리자용: 정산 상세 조회
 */
export async function getAdminSettlementDetail(settlementId) {
  return apiGet(`/api/admin/settlements/${settlementId}`);
}

/**
 * 관리자용: 정산 통계 조회
 */
export async function getSettlementStatistics() {
  return apiGet('/api/admin/settlements/statistics');
}

/**
 * 관리자용: 정산 재시도
 */
export async function retrySettlement(settlementId) {
  return apiPost(`/api/admin/settlements/${settlementId}/retry`);
}

/**
 * 관리자용: 정산 배치 수동 실행
 */
export async function runSettlementBatch() {
  return apiPost('/api/admin/settlements/batch');
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
 * 채널 이미지 업로드
 */
export async function uploadChannelThumbnail(channelId, file) {
  const url = `${API_BASE_URL}/api/channels/${channelId}/thumbnail`;
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    let errorText = '';
    let errorData = null;

    try {
      errorText = await response.text();
      if (errorText && errorText.trim()) {
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
      }
    } catch (readErr) {
      console.warn('에러 응답 본문 읽기 실패:', readErr);
    }

    const errorMessage = errorData?.message || errorData?.error || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const text = await response.text();
  if (!text || text.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.warn('JSON 파싱 실패, 빈 응답으로 처리:', error);
    return null;
  }
}

/**
 * 채널 조회
 */
export async function getChannel(id) {
  return apiGet(`/api/channels/${id}`);
}

/**
 * 내 채널 조회 (크리에이터)
 */
export async function getMyChannel() {
  return apiGet('/api/channels/my');
}

/**
 * 채널 목록
 */
export async function getChannels(params = {}) {
  return apiGet('/api/channels', params);
}

/**
 * 채널 카테고리 목록
 */
export async function getChannelCategories() {
  return apiGet('/api/channels/categories');
}

// ==================== 구독 (SUBSCRIPTION) ====================

/**
 * 구독 상품 등록
 */
export async function createSubscriptionPlan(channelId, data) {
  return apiPost(`/api/channels/${channelId}/plans`, data);
}

/**
 * 구독 상품 조회 (활성화된 상품만)
 */
export async function getSubscriptionPlans(channelId) {
  return apiGet(`/api/channels/${channelId}/plans`);
}

/**
 * 구독 상품 전체 조회 (크리에이터용 - 활성/비활성 모두)
 */
export async function getAllSubscriptionPlans(channelId) {
  return apiGet(`/api/channels/${channelId}/plans/all`);
}

/**
 * 구독 상품 수정
 */
export async function updateSubscriptionPlan(channelId, planId, data) {
  return apiPut(`/api/channels/${channelId}/plans/${planId}`, data);
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
 * 콘텐츠 조회 (인증 없이도 조회 가능)
 */
export async function getContent(id) {
  // 콘텐츠 조회: 항상 인증 정보를 포함하여 요청
  // 백엔드에서 인증 정보가 없어도 무료 콘텐츠는 접근 가능하며,
  // 인증 정보가 있으면 구매/구독 여부를 확인하여 hasAccess를 제대로 반환함
  // 따라서 항상 인증 정보를 포함하여 요청하는 것이 올바름
  try {
    return await apiGet(`/api/contents/${id}`);
  } catch (error) {
    // 인증 에러가 발생한 경우에도 무료 콘텐츠는 조회 가능하므로 재시도
    // 인증 없이 요청하여 무료 콘텐츠인지 확인
    const url = `${API_BASE_URL}/api/contents/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'omit', // 인증 없이 조회
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status !== 401) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      // 401 에러는 무시하고 계속 진행 (무료 콘텐츠일 수 있음)
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
    } catch (parseError) {
      console.warn('JSON 파싱 실패, 빈 응답으로 처리:', parseError);
      return null;
    }
  }
}

/**
 * 콘텐츠 목록
 */
export async function getContents(params = {}) {
  return apiGet('/api/contents', params);
}

// ==================== 주문 (ORDER) ====================

/**
 * 내 주문 목록 조회
 */
export async function getMyOrders(memberId) {
  return apiRequest(`/api/orders/member/${memberId}`, {
    method: 'GET',
    headers: {
      'User-Id': memberId.toString(),
    },
  });
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
 * 채널 최근 리뷰 조회
 */
export async function getChannelRecentReviews(channelId, limit = 3) {
  return apiGet(`/api/channels/${channelId}/reviews`, { limit });
}

/**
 * 채널 리뷰 요약 조회
 */
export async function getChannelReviewSummary(channelId) {
  return apiGet(`/api/channels/${channelId}/reviews/summary`);
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
 * 리뷰 댓글 작성
 */
export async function createReviewComment(reviewId, data) {
  return apiPost(`/api/reviews/${reviewId}/comments`, data);
}

/**
 * 리뷰 댓글 조회
 */
export async function getReviewComments(reviewId) {
  return apiGet(`/api/reviews/${reviewId}/comments`);
}

/**
 * 리뷰 추천 토글 (추천/추천 취소)
 */
export async function toggleReviewLike(contentId, reviewId) {
  return apiPost(`/api/contents/${contentId}/reviews/${reviewId}/like`);
}

/**
 * 가장 추천이 많은 리뷰 조회 (콘텐츠 정보 포함)
 */
export async function getTopReviews(limit = 5) {
  return apiGet(`/api/reviews/top?limit=${limit}`);
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
  return apiPost('/api/coupons/issue', data);
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

/**
 * 채널별 다운로드 가능한 쿠폰 목록 조회
 * GET /api/channels/{channelId}/coupons
 */
export async function getChannelCoupons(channelId) {
  return apiGet(`/api/channels/${channelId}/coupons`);
}

/**
 * 컨텐츠별 다운로드 가능한 쿠폰 목록 조회
 * GET /api/contents/{contentId}/coupons
 */
export async function getContentCoupons(contentId) {
  return apiGet(`/api/contents/${contentId}/coupons`);
}

/**
 * 쿠폰 발급 (다운로드)
 * POST /api/coupons/{couponId}/issue
 */
export async function issueCoupon(couponId) {
  return apiPost(`/api/coupons/${couponId}/issue`);
}

/**
 * 쿠폰 검증
 * POST /api/coupons/{couponId}/validate
 */
export async function validateCoupon(couponId, paymentType, targetId) {
  return apiPost(`/api/coupons/${couponId}/validate`, {
    paymentType,
    targetId,
  });
}

// ==================== 관리자 쿠폰 관리 ====================

/**
 * 관리자 쿠폰 생성
 * POST /api/admin/coupons
 */
export async function createAdminCoupon(data) {
  return apiPost('/api/admin/coupons', data);
}

/**
 * 관리자 쿠폰 목록 조회
 * GET /api/admin/coupons
 */
export async function getAdminCoupons(params = {}) {
  return apiGet('/api/admin/coupons', params);
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

// ==================== 알림 (NOTIFICATION) ====================

/**
 * 알림 목록 조회
 */
export async function getNotifications() {
  return apiGet('/api/notifications');
}

/**
 * 안읽은 알림 개수 조회
 */
export async function getUnreadNotificationCount() {
  return apiGet('/api/notifications/unread-count');
}

/**
 * 알림 읽음 처리
 */
export async function readNotification(notificationId) {
  return apiRequest(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

/**
 * 알림 전체 읽음 처리
 */
export async function readAllNotifications() {
  return apiRequest('/api/notifications/read-all', {
    method: 'PATCH',
  });
}

/**
 * 알림 삭제
 */
export async function deleteNotification(notificationId) {
  return apiDelete(`/api/notifications/${notificationId}/delete`);
}

/**
 * 알림 설정 조회
 */
export async function getNotificationSettings() {
  return apiGet('/api/notification-settings');
}

/**
 * 알림 설정 변경
 */
export async function updateNotificationSettings(data) {
  return apiRequest('/api/notification-settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * SSE 알림 구독 연결
 * Next.js API Route를 통해 프록시하여 쿠키 인증 문제 해결
 */
export function subscribeNotifications() {
  // Next.js API Route를 통해 프록시 (쿠키 자동 포함)
  return new EventSource('/api/notifications/subscribe');
}

// ==================== 뉴스레터 API ====================

/**
 * 발행된 뉴스레터 목록 조회 (일반 사용자용)
 * @param {number} page - 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지 크기
 */
export async function getNewsletters(page = 0, size = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: 'publishedAt,desc'
  });
  return apiGet(`/api/newsletters?${params.toString()}`);
}

/**
 * 뉴스레터 상세 조회 (일반 사용자용 - 발행된 것만)
 * @param {number} id - 뉴스레터 ID
 */
export async function getNewsletter(id) {
  return apiGet(`/api/newsletters/${id}`);
}

/**
 * 뉴스레터 상세 조회 (관리자용 - 모든 상태 조회 가능)
 * @param {number} id - 뉴스레터 ID
 */
export async function getNewsletterForAdmin(id) {
  return apiGet(`/api/admin/newsletters/${id}`);
}

/**
 * 전체 뉴스레터 목록 조회 (관리자용)
 * @param {number} page - 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지 크기
 */
export async function getAllNewsletters(page = 0, size = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: 'publishedAt,desc'
  });
  return apiGet(`/api/admin/newsletters-all?${params.toString()}`);
}

/**
 * 상태별 뉴스레터 목록 조회 (관리자용)
 * @param {string} status - 상태 (DRAFT, PUBLISHED, ARCHIVED)
 * @param {number} page - 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지 크기
 */
export async function getNewslettersByStatus(status, page = 0, size = 20) {
  const params = new URLSearchParams({
    status: status,
    page: page.toString(),
    size: size.toString(),
    sort: 'publishedAt,desc'
  });
  return apiGet(`/api/admin/newsletters?${params.toString()}`);
}

/**
 * 뉴스레터 생성 (관리자용)
 * @param {string} title - 제목
 * @param {string} content - 내용
 */
export async function createNewsletter(title, content) {
  return apiPost('/api/admin/newsletters', { title, content });
}

/**
 * 뉴스레터 수정 (관리자용)
 * @param {number} id - 뉴스레터 ID
 * @param {string} title - 제목
 * @param {string} content - 내용
 */
export async function updateNewsletter(id, title, content) {
  return apiPut(`/api/admin/newsletters/${id}`, { title, content });
}

/**
 * 뉴스레터 발행 (관리자용)
 * @param {number} id - 뉴스레터 ID
 */
export async function publishNewsletter(id) {
  return apiRequest(`/api/admin/newsletters/${id}/publish`, {
    method: 'PATCH',
  });
}

/**
 * 뉴스레터 보관 (관리자용)
 * @param {number} id - 뉴스레터 ID
 */
export async function archiveNewsletter(id) {
  return apiRequest(`/api/admin/newsletters/${id}/archive`, {
    method: 'PATCH',
  });
}

/**
 * 뉴스레터 삭제 (관리자용)
 * @param {number} id - 뉴스레터 ID
 */
export async function deleteNewsletter(id) {
  return apiDelete(`/api/admin/newsletters/${id}`);
}

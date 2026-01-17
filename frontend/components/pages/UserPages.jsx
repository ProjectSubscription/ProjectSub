import React from 'react';
import { CreditCard, Calendar, CheckCircle, Clock, X, FileText, Eye, Settings, Lock, User, Edit2, AlertTriangle, Bell } from 'lucide-react';
import { PageRoute } from '@/app/types';
import { mockUserSubscriptions, mockChannels, mockSubscriptionPlans } from '@/app/mockData';
import { getMyApplication, getApplicationDetail, getMyInfo, changePassword, changeNickname, changeBirthYear, deleteMember, getNotificationSettings, updateNotificationSettings } from '@/app/lib/api';

// 구독 관련 컴포넌트는 subscription 폴더로 분리됨
export { MySubscriptionsPage } from '../subscription/MySubscriptionsPage';

// My Creator Applications Page
export function MyCreatorApplicationsPage({ userId, onNavigate }) {
  const [applications, setApplications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [selectedApp, setSelectedApp] = React.useState(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);

  React.useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        const response = await getMyApplication();
        // 백엔드에서 Page 객체를 반환하므로 content 배열을 추출
        const apps = response.content || response || [];
        setApplications(apps);
      } catch (err) {
        setError(err.message || '신청 이력을 불러오는 중 오류가 발생했습니다.');
        console.error('신청 이력 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            검토 대기
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            승인됨
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="w-3 h-3" />
            반려됨
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryName = (category) => {
    const categoryMap = {
      'ECONOMY_BUSINESS': '경제/비즈니스',
      'FINANCE': '재테크',
      'REAL_ESTATE': '부동산',
      'BOOK_PUBLISHING': '책/작가/출판사',
      'HOBBY_PRACTICAL': '취미/실용',
      'EDUCATION': '교육/학습',
      'SELF_DEVELOPMENT': '자기개발/취업',
      'CULTURE_ART': '문화/예술',
      'TREND_LIFE': '트렌드/라이프',
    };
    return categoryMap[category] || category;
  };

  const handleViewDetail = async (appId) => {
    try {
      setLoadingDetail(true);
      const detail = await getApplicationDetail(appId);
      setSelectedApp(detail);
    } catch (err) {
      alert('상세 정보를 불러오는 중 오류가 발생했습니다.');
      console.error('상세 정보 조회 오류:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">크리에이터 신청 이력</h1>
        <p className="text-gray-600">내가 신청한 크리에이터 신청 내역을 확인하세요</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">신청 이력이 없습니다</h3>
          <p className="text-gray-600 mb-6">크리에이터 신청을 진행해보세요</p>
          <button
            onClick={() => onNavigate('creator-apply', {})}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            크리에이터 신청하기
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.applicationId} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{app.channelName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>카테고리: {getCategoryName(app.channelCategory)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(app.createdAt)}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
                {app.status === 'REJECTED' && app.rejectReason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">반려 사유</p>
                    <p className="text-sm text-red-600">{app.rejectReason}</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewDetail(app.applicationId)}
                    disabled={loadingDetail}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-4 h-4" />
                    상세보기
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 상세보기 모달 */}
          {selectedApp && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">신청 상세 정보</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      채널명
                    </label>
                    <p className="text-gray-900">{selectedApp.channelName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      채널 설명
                    </label>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedApp.channelDescription}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카테고리
                    </label>
                    <p className="text-gray-900">{getCategoryName(selectedApp.channelCategory)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      신청일
                    </label>
                    <p className="text-gray-900">{formatDate(selectedApp.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상태
                    </label>
                    <div>
                      {getStatusBadge(selectedApp.status)}
                    </div>
                  </div>
                  {selectedApp.rejectReason && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        반려 사유
                      </label>
                      <p className="text-red-700 whitespace-pre-wrap">{selectedApp.rejectReason}</p>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Simple MyPage component
export function MyPage({ userId, onNavigate }) {
  const [userInfo, setUserInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [editingField, setEditingField] = React.useState(null);
  const [formData, setFormData] = React.useState({});
  const [error, setError] = React.useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const loadUserInfo = React.useCallback(async () => {
    try {
      setLoading(true);
      const info = await getMyInfo();
      setUserInfo(info);
    } catch (err) {
      console.error('사용자 정보 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({});
    setError('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setFormData({});
    setError('');
  };

  const handleSubmit = async (field) => {
    try {
      setError('');
      let result;
      
      if (field === 'password') {
        if (!formData.currentPassword || !formData.newPassword) {
          setError('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
          return;
        }
        if (formData.newPassword.length < 8) {
          setError('새 비밀번호는 8자 이상이어야 합니다.');
          return;
        }
        result = await changePassword(formData.currentPassword, formData.newPassword);
      } else if (field === 'nickname') {
        if (!formData.newNickname) {
          setError('닉네임을 입력해주세요.');
          return;
        }
        result = await changeNickname(formData.newNickname);
      }

      // 성공 시 사용자 정보 다시 로드
      const updatedInfo = await getMyInfo();
      setUserInfo(updatedInfo);
      setEditingField(null);
      setFormData({});
      
      // 닉네임 변경 시 페이지 새로고침하여 헤더의 닉네임도 업데이트
      if (field === 'nickname') {
        window.location.reload();
      } else {
        alert('정보가 변경되었습니다.');
      }
    } catch (err) {
      setError(err.message || '정보 변경에 실패했습니다.');
      console.error('정보 변경 오류:', err);
    }
  };

  const handleDeleteMember = async () => {
    if (!window.confirm('정말로 회원 탈퇴를 하시겠습니까?\n탈퇴한 계정은 복구할 수 없습니다.')) {
      return;
    }

    try {
      await deleteMember();
      alert('회원 탈퇴가 완료되었습니다.');
      // 로그아웃 처리 및 홈으로 이동
      window.location.href = '/';
    } catch (err) {
      alert(err.message || '회원 탈퇴에 실패했습니다.');
      console.error('회원 탈퇴 오류:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>

      {/* 정보 변경 섹션 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">정보 변경</h2>
        </div>

        <div className="space-y-6">
          {/* 닉네임 */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                닉네임
              </label>
              {editingField !== 'nickname' && (
                <button
                  onClick={() => handleEdit('nickname')}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  수정
                </button>
              )}
            </div>
            {editingField === 'nickname' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.newNickname || ''}
                  onChange={(e) => setFormData({ ...formData, newNickname: e.target.value })}
                  placeholder={userInfo?.nickname || '닉네임'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmit('nickname')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900">{userInfo?.nickname || '-'}</p>
            )}
          </div>

          {/* 생년 */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4" />
                출생년도
              </label>
            </div>
            <p className="text-gray-900">{userInfo?.birthYear ? `${userInfo.birthYear}년` : '-'}</p>
            <p className="text-xs text-gray-500 mt-1">출생년도는 변경할 수 없습니다.</p>
          </div>

          {/* 비밀번호 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4" />
                비밀번호
              </label>
              {editingField !== 'password' && (
                <button
                  onClick={() => handleEdit('password')}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  변경
                </button>
              )}
            </div>
            {editingField === 'password' ? (
              <div className="space-y-3">
                <input
                  type="password"
                  value={formData.currentPassword || ''}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="현재 비밀번호"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  value={formData.newPassword || ''}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="새 비밀번호 (8자 이상)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmit('password')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">••••••••</p>
            )}
          </div>
        </div>
      </div>

      {/* 기타 메뉴 */}
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate('my-subscriptions', {})}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <CreditCard className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">내 구독</h3>
          <p className="text-gray-600">구독 중인 채널 관리</p>
        </button>
        <button
          onClick={() => onNavigate('my-purchases', {})}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">구매한 콘텐츠</h3>
          <p className="text-gray-600">단건 구매 콘텐츠 보기</p>
        </button>
        <button
          onClick={() => onNavigate('my-applications', {})}
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <FileText className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">크리에이터 신청 이력</h3>
          <p className="text-gray-600">신청 내역 및 승인 상태 확인</p>
        </button>
      </div>

      {/* 회원 탈퇴 섹션 */}
      <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-red-900">회원 탈퇴</h2>
        </div>
        <p className="text-sm text-red-700 mb-4">
          회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>
        <button
          onClick={handleDeleteMember}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}

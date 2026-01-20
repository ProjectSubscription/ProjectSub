import React from 'react';
import { Clock, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';
import { getAllApplications, getApplicationDetail, approveApplication } from '@/app/lib/api';

export function AdminApplicationsPage() {
  const [applications, setApplications] = React.useState([]);
  const [filter, setFilter] = React.useState('all');
  const [selectedApp, setSelectedApp] = React.useState(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  // 신청 이력 로드
  React.useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError('');
        const response = await getAllApplications();
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

  // 상세 정보 로드
  const handleViewDetail = async (appId) => {
    try {
      const detail = await getApplicationDetail(appId);
      setSelectedApp(detail);
    } catch (err) {
      alert('상세 정보를 불러오는 중 오류가 발생했습니다.');
      console.error('상세 정보 조회 오류:', err);
    }
  };

  // 상태 매핑: 백엔드 REQUESTED -> 프론트엔드 PENDING
  const mapStatusForFilter = (status) => {
    return status === 'REQUESTED' ? 'PENDING' : status;
  };

  const filteredApps = filter === 'all'
    ? applications
    : applications.filter(app => mapStatusForFilter(app.status) === filter);

  const pendingCount = applications.filter(a => a.status === 'REQUESTED').length;

  const handleApprove = async (appId) => {
    if (!confirm('이 신청을 승인하시겠습니까?')) {
      return;
    }

    try {
      setProcessing(true);
      await approveApplication(appId, {
        status: 'APPROVED',
        rejectReason: null,
      });
      
      // 목록 새로고침
      const response = await getAllApplications();
      const apps = response.content || response || [];
      setApplications(apps);
      
      setSelectedApp(null);
      alert('승인되었습니다.');
    } catch (err) {
      alert(err.message || '승인 처리 중 오류가 발생했습니다.');
      console.error('승인 처리 오류:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (appId) => {
    if (!rejectionReason.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }

    if (!confirm('이 신청을 반려하시겠습니까?')) {
      return;
    }

    try {
      setProcessing(true);
      await approveApplication(appId, {
        status: 'REJECTED',
        rejectReason: rejectionReason.trim(),
      });
      
      // 목록 새로고침
      const response = await getAllApplications();
      const apps = response.content || response || [];
      setApplications(apps);
      
      setSelectedApp(null);
      setRejectionReason('');
      alert('반려되었습니다.');
    } catch (err) {
      alert(err.message || '반려 처리 중 오류가 발생했습니다.');
      console.error('반려 처리 오류:', err);
    } finally {
      setProcessing(false);
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

  const getStatusBadge = (status) => {
    const mappedStatus = mapStatusForFilter(status);
    switch (mappedStatus) {
      case 'PENDING':
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
            <XCircle className="w-3 h-3" />
            반려됨
          </span>
        );
      default:
        return null;
    }
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

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">판매자 신청 관리</h1>
        <p className="text-gray-600">크리에이터 신청을 검토하고 승인하세요</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">전체 신청</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700 mb-1">검토 대기</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-green-700 mb-1">승인됨</p>
              <p className="text-2xl font-bold text-green-900">
                {applications.filter(a => a.status === 'APPROVED').length}
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-sm text-red-700 mb-1">반려됨</p>
              <p className="text-2xl font-bold text-red-900">
                {applications.filter(a => a.status === 'REJECTED').length}
              </p>
            </div>
          </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'PENDING'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          검토 대기
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'APPROVED'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          승인됨
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'REJECTED'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          반려됨
        </button>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                신청자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                채널명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                신청일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  신청 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.applicationId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{app.nickname}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{app.channelName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewDetail(app.applicationId)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      상세보기
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">신청 상세 정보</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  신청자 이름
                </label>
                <p className="text-gray-900">{selectedApp.nickname}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <p className="text-gray-900">{selectedApp.email}</p>
              </div>
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
                  <p className="text-red-700">{selectedApp.rejectReason}</p>
                </div>
              )}

              {(selectedApp.status === 'REQUESTED' || selectedApp.status === 'PENDING') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    반려 사유 (반려 시 필수)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="반려 사유를 입력하세요..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setSelectedApp(null);
                  setRejectionReason('');
                }}
                disabled={processing}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                닫기
              </button>
              {(selectedApp.status === 'REQUESTED' || selectedApp.status === 'PENDING') && (
                <>
                  <button
                    onClick={() => handleReject(selectedApp.applicationId)}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-5 h-5" />
                    반려
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApp.applicationId)}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5" />
                    승인
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

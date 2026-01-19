import React from 'react';
import {
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Play,
  TrendingUp,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import {
  getAdminSettlements,
  getAdminSettlementDetail,
  getSettlementStatistics,
  retrySettlement,
  runSettlementBatch
} from '@/app/lib/api';

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = React.useState([]);
  const [statistics, setStatistics] = React.useState(null);
  const [selectedSettlement, setSelectedSettlement] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  // 필터 상태
  const [filters, setFilters] = React.useState({
    creatorNickname: '',
    settlementPeriod: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalElements, setTotalElements] = React.useState(0);

  // 데이터 로드
  React.useEffect(() => {
    loadData();
  }, [currentPage, filters]);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      // 통계와 목록을 동시에 로드
      const [statsData, settlementsData] = await Promise.all([
        getSettlementStatistics(),
        getAdminSettlements({
          creatorNickname: filters.creatorNickname || undefined,
          settlementPeriod: filters.settlementPeriod || undefined,
          status: filters.status || undefined,
          page: currentPage,
          size: 20
        })
      ]);

      setStatistics(statsData);
      
      // Page 객체에서 content 추출
      const settlementsList = settlementsData.content || settlementsData || [];
      setSettlements(settlementsList);
      setTotalPages(settlementsData.totalPages || 0);
      setTotalElements(settlementsData.totalElements || 0);
    } catch (err) {
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('데이터 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSettlementClick = async (settlementId) => {
    try {
      const detail = await getAdminSettlementDetail(settlementId);
      setSelectedSettlement(detail);
    } catch (err) {
      console.error('정산 상세 조회 오류:', err);
      setError(err.message || '정산 상세 내역을 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleRetry = async (settlementId) => {
    if (!confirm('이 정산을 재시도하시겠습니까?')) {
      return;
    }

    try {
      setProcessing(true);
      const result = await retrySettlement(settlementId);
      
      if (result.success) {
        alert('정산 재시도가 성공했습니다.');
        loadData(); // 목록 새로고침
        if (selectedSettlement && selectedSettlement.id === settlementId) {
          // 상세 정보도 새로고침
          const detail = await getAdminSettlementDetail(settlementId);
          setSelectedSettlement(detail);
        }
      } else {
        alert(result.message || '정산 재시도가 실패했습니다.');
      }
    } catch (err) {
      alert(err.message || '정산 재시도 중 오류가 발생했습니다.');
      console.error('정산 재시도 오류:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRunBatch = async () => {
    if (!confirm('정산 배치를 수동으로 실행하시겠습니까?')) {
      return;
    }

    try {
      setProcessing(true);
      const result = await runSettlementBatch();
      
      if (result.success) {
        alert('정산 배치가 실행되었습니다.');
        // 잠시 후 목록 새로고침
        setTimeout(() => {
          loadData();
        }, 2000);
      } else {
        alert(result.message || '정산 배치 실행이 실패했습니다.');
      }
    } catch (err) {
      alert(err.message || '정산 배치 실행 중 오류가 발생했습니다.');
      console.error('정산 배치 실행 오류:', err);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return amount ? amount.toLocaleString() + '원' : '0원';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      READY: { label: '대기중', color: 'bg-gray-100 text-gray-700', icon: Clock },
      COMPLETED: { label: '완료', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      FAILED: { label: '실패', color: 'bg-red-100 text-red-700', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.READY;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); // 필터 변경 시 첫 페이지로
  };

  const handleResetFilters = () => {
    setFilters({
      creatorNickname: '',
      settlementPeriod: '',
      status: ''
    });
    setCurrentPage(0);
  };

  if (loading && !statistics) {
    return (
      <div className="py-12 text-center">
        <div className="bg-white rounded-xl p-12 shadow-sm">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">정산 관리</h1>
          <p className="text-gray-600">전체 크리에이터의 정산 내역을 관리하세요</p>
        </div>
        <button
          onClick={handleRunBatch}
          disabled={processing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5" />
          정산 배치 실행
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Statistics Dashboard */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">전체 정산 금액</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(statistics.totalSettlementAmount)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">이번 달 정산</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(statistics.thisMonthSettlementAmount)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">대기중</p>
            <p className="text-2xl font-bold text-gray-900">{statistics.readyCount || 0}건</p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-green-700 mb-1">완료</p>
            <p className="text-2xl font-bold text-green-900">{statistics.completedCount || 0}건</p>
          </div>
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm text-red-700 mb-1">실패</p>
            <p className="text-2xl font-bold text-red-900">{statistics.failedCount || 0}건</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-orange-700 mb-1">재시도 필요</p>
            <p className="text-2xl font-bold text-orange-900">{statistics.retryNeededCount || 0}건</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-bold text-gray-900">필터</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              크리에이터명
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.creatorNickname}
                onChange={(e) => handleFilterChange('creatorNickname', e.target.value)}
                placeholder="크리에이터명 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정산 기간
            </label>
            <input
              type="text"
              value={filters.settlementPeriod}
              onChange={(e) => handleFilterChange('settlementPeriod', e.target.value)}
              placeholder="YYYY-MM (예: 2024-12)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="READY">대기중</option>
              <option value="COMPLETED">완료</option>
              <option value="FAILED">실패</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 정산 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <p className="text-gray-600">로딩 중...</p>
            </div>
          ) : settlements.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">정산 내역이 없습니다</p>
              <p className="text-gray-500 text-sm">검색 조건을 변경해보세요.</p>
            </div>
          ) : (
            <>
              {settlements.map((settlement) => (
                <div
                  key={settlement.id}
                  onClick={() => handleSettlementClick(settlement.id)}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <h3 className="text-xl font-bold text-gray-900">
                          {settlement.settlementPeriod} 정산
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-8">
                        크리에이터: <span className="font-medium">{settlement.creatorNickname}</span>
                      </p>
                      <p className="text-sm text-gray-500 ml-8">
                        {settlement.createdAt && formatDate(settlement.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(settlement.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">총 매출</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(settlement.totalSalesAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">플랫폼 수수료</p>
                      <p className="text-lg font-bold text-orange-600">
                        -{formatCurrency(settlement.platformFeeAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">실 지급 금액</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(settlement.payoutAmount)}
                      </p>
                    </div>
                  </div>

                  {settlement.paymentCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        결제 내역 {settlement.paymentCount}건
                      </p>
                    </div>
                  )}

                  {settlement.status === 'FAILED' && settlement.retryCount < 3 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetry(settlement.id);
                        }}
                        disabled={processing}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className="w-4 h-4" />
                        재시도 ({settlement.retryCount}/3)
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    {currentPage + 1} / {totalPages} (총 {totalElements}건)
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 정산 상세 정보 */}
        <div className="lg:col-span-1">
          {selectedSettlement ? (
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">정산 상세</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">크리에이터</p>
                  <p className="font-medium text-gray-900">
                    {selectedSettlement.details?.[0]?.creatorNickname || '크리에이터 정보 없음'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">정산 기간</p>
                  <p className="font-medium text-gray-900">{selectedSettlement.settlementPeriod}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">정산 상태</p>
                  <div className="mt-1">{getStatusBadge(selectedSettlement.status)}</div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">정산 금액</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">총 매출</span>
                      <span className="font-medium">{formatCurrency(selectedSettlement.totalSalesAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">플랫폼 수수료</span>
                      <span className="font-medium text-orange-600">
                        -{formatCurrency(selectedSettlement.platformFeeAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="font-medium text-gray-900">실 지급 금액</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(selectedSettlement.payoutAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedSettlement.details && selectedSettlement.details.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      결제 내역 ({selectedSettlement.details.length}건)
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedSettlement.details.map((detail) => (
                        <div
                          key={detail.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs text-gray-500 font-mono truncate flex-1 mr-2">
                              {detail.paymentKey}
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                              {formatCurrency(detail.amount)}
                            </p>
                          </div>
                          {detail.paymentApprovedAt && (
                            <p className="text-xs text-gray-500">
                              {formatDate(detail.paymentApprovedAt)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSettlement.settledAt && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-600 mb-1">지급 완료 일시</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedSettlement.settledAt)}</p>
                  </div>
                )}

                {selectedSettlement.retryCount > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-600 mb-1">재시도 횟수</p>
                    <p className="text-sm text-gray-900">{selectedSettlement.retryCount}회</p>
                  </div>
                )}

                {selectedSettlement.status === 'FAILED' && selectedSettlement.retryCount < 3 && (
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleRetry(selectedSettlement.id)}
                      disabled={processing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-4 h-4" />
                      재시도
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">정산 항목을 선택하면 상세 정보가 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


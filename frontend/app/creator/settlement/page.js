'use client';

import React from 'react';
import { DollarSign, Calendar, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { getMySettlements, getSettlementDetail } from '@/app/lib/api';

export default function CreatorSettlement() {
  const [settlements, setSettlements] = React.useState([]);
  const [selectedSettlement, setSelectedSettlement] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function loadSettlements() {
      try {
        setLoading(true);
        setError('');
        const data = await getMySettlements();
        setSettlements(data || []);
      } catch (err) {
        setError(err.message || '정산 내역을 불러오는 중 오류가 발생했습니다.');
        console.error('정산 내역 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettlements();
  }, []);

  const handleSettlementClick = async (settlementId) => {
    try {
      const detail = await getSettlementDetail(settlementId);
      setSelectedSettlement(detail);
    } catch (err) {
      console.error('정산 상세 조회 오류:', err);
      setError(err.message || '정산 상세 내역을 불러오는 중 오류가 발생했습니다.');
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

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="bg-white rounded-xl p-12 shadow-sm">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error && settlements.length === 0) {
    return (
      <div className="py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">정산 관리</h1>
        <p className="text-gray-600">정산 내역 및 결제 상세 정보를 확인하세요</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 정산 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {settlements.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">정산 내역이 없습니다</p>
              <p className="text-gray-500 text-sm">아직 정산된 내역이 없습니다.</p>
            </div>
          ) : (
            settlements.map((settlement) => (
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

                {settlement.details && settlement.details.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-2">
                      결제 내역 {settlement.details.length}건
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                      <span>상세 보기</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {settlement.settledAt && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      지급 완료: {formatDate(settlement.settledAt)}
                    </p>
                  </div>
                )}

                {settlement.retryCount > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-orange-600">
                      재시도 횟수: {settlement.retryCount}회
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 정산 상세 정보 */}
        <div className="lg:col-span-1">
          {selectedSettlement ? (
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">정산 상세</h3>
              
              <div className="space-y-4">
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
                            <p className="text-xs text-gray-500 font-mono">
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

      {error && settlements.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { getMyCoupons } from '@/app/lib/api';
import MyCouponCard from '@/components/coupon/MyCouponCard';

export default function MyCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, available, expired, used

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyCoupons();
      setCoupons(data || []);
    } catch (err) {
      console.error('쿠폰 목록 조회 오류:', err);
      setError(err.message || '쿠폰 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 쿠폰 필터링
  const filteredCoupons = coupons.filter(coupon => {
    const isUsed = coupon.usedAt !== null && coupon.usedAt !== undefined;
    const isExpired = coupon.expiredAt && new Date(coupon.expiredAt) < new Date();
    
    switch (filter) {
      case 'available':
        return !isUsed && !isExpired;
      case 'expired':
        return isExpired && !isUsed;
      case 'used':
        return isUsed;
      default:
        return true;
    }
  });

  // 통계 계산
  const stats = {
    total: coupons.length,
    available: coupons.filter(c => {
      const isUsed = c.usedAt !== null && c.usedAt !== undefined;
      const isExpired = c.expiredAt && new Date(c.expiredAt) < new Date();
      return !isUsed && !isExpired;
    }).length,
    expired: coupons.filter(c => {
      const isExpired = c.expiredAt && new Date(c.expiredAt) < new Date();
      return isExpired && c.usedAt === null;
    }).length,
    used: coupons.filter(c => c.usedAt !== null && c.usedAt !== undefined).length,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">쿠폰 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">보유 쿠폰</h1>
        <p className="text-gray-600">다운받은 쿠폰 목록을 확인하고 관리하세요</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">전체</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">사용 가능</p>
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">만료됨</p>
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">사용 완료</p>
          <p className="text-2xl font-bold text-gray-600">{stats.used}</p>
        </div>
      </div>

      {/* 필터 버튼 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'available'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          사용 가능
        </button>
        <button
          onClick={() => setFilter('expired')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'expired'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          만료됨
        </button>
        <button
          onClick={() => setFilter('used')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'used'
              ? 'bg-gray-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          사용 완료
        </button>
      </div>

      {/* 쿠폰 목록 */}
      {filteredCoupons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2m0 0V5.5A2.5 2.5 0 109.5 8H12m-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">쿠폰이 없습니다</h3>
          <p className="mt-2 text-sm text-gray-500">
            {filter === 'all'
              ? '다운받은 쿠폰이 없습니다.'
              : filter === 'available'
              ? '사용 가능한 쿠폰이 없습니다.'
              : filter === 'expired'
              ? '만료된 쿠폰이 없습니다.'
              : '사용 완료된 쿠폰이 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => (
            <MyCouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      )}
    </div>
  );
}

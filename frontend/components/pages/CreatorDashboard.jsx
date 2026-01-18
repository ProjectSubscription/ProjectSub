'use client';

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Video,
  Eye,
  Heart,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { PageRoute } from '@/app/types';
import { getMyCreatorInfo } from '@/app/lib/api';

export function CreatorDashboard({ onNavigate }) {
  const [myPageData, setMyPageData] = React.useState(null);
  const [creatorId, setCreatorId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function loadCreatorMyPage() {
      try {
        setLoading(true);
        setError('');
        const data = await getMyCreatorInfo();
        // API에서 받아온 크리에이터 정보에서 id 추출
        const id = data?.id || data?.creatorId;
        setCreatorId(id);
        setMyPageData(data);
      } catch (err) {
        setError(err.message || '크리에이터 마이페이지 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('크리에이터 마이페이지 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCreatorMyPage();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 pb-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!myPageData) {
    return (
      <div className="space-y-8 pb-12">
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-600">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: '총 구독자',
      value: (myPageData.totalSubscribers || 0).toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      label: '이번 달 예상 수익',
      value: `${(myPageData.expectedRevenue || 0).toLocaleString()}원`,
      change: '+8.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      label: '총 콘텐츠',
      value: (myPageData.totalContentCount || 0).toString(),
      change: '+3',
      trend: 'up',
      icon: Video,
      color: 'purple'
    },
    {
      label: '총 조회수',
      value: (myPageData.totalViewCount || 0).toLocaleString(),
      change: '+15.2%',
      trend: 'up',
      icon: Eye,
      color: 'orange'
    }
  ];

  const featuredContents = myPageData.featuredContents || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
        <p className="text-gray-600">크리에이터 활동 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600'
          };

          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('creator-content-new', {})}
          className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-purple-700 transition-all text-left"
        >
          <Video className="w-8 h-8 mb-3" />
          <h3 className="text-xl font-bold mb-2">새 콘텐츠 업로드</h3>
          <p className="text-blue-100 text-sm">새로운 콘텐츠를 만들고 공유하세요</p>
        </button>
        <button
          onClick={() => onNavigate('creator-settlement', {})}
          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <DollarSign className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">정산 확인</h3>
          <p className="text-gray-600 text-sm">수익 내역을 확인하세요</p>
        </button>
        <button
          onClick={() => onNavigate('creator-channel', {})}
          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
        >
          <Users className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">채널 관리</h3>
          <p className="text-gray-600 text-sm">채널 정보를 수정하세요</p>
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">최근 3개월 수익</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
              <option>최근 3개월</option>
              <option>최근 6개월</option>
              <option>올해</option>
            </select>
          </div>
          <div className="space-y-3">
            {myPageData.monthlyRevenues && myPageData.monthlyRevenues.length > 0 ? (
              myPageData.monthlyRevenues.map((revenue, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{revenue.month || `${index + 1}월`}</p>
                    {revenue.commission !== undefined && (
                      <p className="text-sm text-gray-500">
                        수수료: {revenue.commission.toLocaleString()}원
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {revenue.netAmount !== undefined && (
                      <p className="font-bold text-gray-900">
                        {revenue.netAmount.toLocaleString()}원
                      </p>
                    )}
                    {revenue.status && (
                      <p className="text-xs text-gray-500">
                        {revenue.status === 'COMPLETED' ? '정산 완료' : '정산 예정'}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">수익 내역이 없습니다.</p>
            )}
          </div>
        </div>

        {/* Top Contents */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">인기 콘텐츠 TOP 3</h3>
          {featuredContents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">인기 콘텐츠가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {featuredContents.map((content, index) => (
                <div
                  key={content.contentId || content.id}
                  onClick={() => onNavigate('content-detail', { contentId: content.contentId || content.id })}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  {content.thumbnailUrl && (
                    <img
                      src={content.thumbnailUrl}
                      alt={content.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{content.title}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {content.viewCount !== undefined && (
                        <span>{content.viewCount.toLocaleString()} 조회</span>
                      )}
                      {content.likeCount !== undefined && (
                        <span>{content.likeCount.toLocaleString()} 좋아요</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">최근 활동</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">새로운 좋아요 +25</p>
              <p className="text-sm text-gray-500">캐릭터 드로잉 실전 테크닉</p>
            </div>
            <span className="text-sm text-gray-500">2시간 전</span>
          </div>
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">새 구독자 +12</p>
              <p className="text-sm text-gray-500">디지털 아트 마스터클래스</p>
            </div>
            <span className="text-sm text-gray-500">5시간 전</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">콘텐츠 발행 완료</p>
              <p className="text-sm text-gray-500">색감 마스터하기 - 고급편</p>
            </div>
            <span className="text-sm text-gray-500">1일 전</span>
          </div>
        </div>
      </div>
    </div>
  );
}

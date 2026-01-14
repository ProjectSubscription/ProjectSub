import React from 'react';
import { Users, Video, Heart, Calendar, CheckCircle } from 'lucide-react';
import { getCreator } from '@/app/lib/api';

export function CreatorInfoPage({ creatorId, onNavigate }) {
  const [creatorInfo, setCreatorInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    async function loadCreatorInfo() {
      try {
        setLoading(true);
        setError('');
        const data = await getCreator(creatorId);
        setCreatorInfo(data);
      } catch (err) {
        setError(err.message || '크리에이터 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('크리에이터 정보 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    if (creatorId) {
      loadCreatorInfo();
    }
  }, [creatorId]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!creatorInfo) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-600">크리에이터를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 크리에이터 상태 확인
  if (creatorInfo.status && creatorInfo.status !== 'ACTIVE') {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-red-600 text-lg font-medium">
            {creatorInfo.status === 'SUSPENDED' ? '정지된 크리에이터입니다.' : '탈퇴한 크리에이터입니다.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 프로필 섹션 */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{creatorInfo.channelName}</h1>
            <p className="text-lg text-gray-600 mb-4">{creatorInfo.nickname}</p>
            {creatorInfo.introduction && (
              <p className="text-gray-700 whitespace-pre-wrap mb-6">{creatorInfo.introduction}</p>
            )}
            {creatorInfo.channelDescription && (
              <p className="text-gray-600 mb-6">{creatorInfo.channelDescription}</p>
            )}
            
            {/* 통계 */}
            <div className="flex flex-wrap gap-6">
              {creatorInfo.subscriberStatisticsResponse && (
                <>
                  {creatorInfo.subscriberStatisticsResponse.totalSubscribers !== undefined && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">
                        구독자 {creatorInfo.subscriberStatisticsResponse.totalSubscribers.toLocaleString()}명
                      </span>
                    </div>
                  )}
                </>
              )}
              {creatorInfo.recentContentCount !== undefined && (
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">
                    최근 5일간 콘텐츠 {creatorInfo.recentContentCount}개
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* 구독 버튼 */}
          {!creatorInfo.isSubscribed && (
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              구독하기
            </button>
          )}
          {creatorInfo.isSubscribed && (
            <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium">
              <CheckCircle className="w-5 h-5" />
              구독 중
            </div>
          )}
        </div>
      </div>

      {/* 구독자 통계 */}
      {creatorInfo.subscriberStatisticsResponse && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">구독자 통계</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {creatorInfo.subscriberStatisticsResponse.ageDistribution && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">연령대별 구독자</h3>
                <div className="space-y-2">
                  {Object.entries(creatorInfo.subscriberStatisticsResponse.ageDistribution).map(([age, count]) => (
                    <div key={age} className="flex items-center justify-between">
                      <span className="text-gray-600">{age}대</span>
                      <span className="font-medium text-gray-900">{count}명</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {creatorInfo.subscriberStatisticsResponse.genderDistribution && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">성별 구독자</h3>
                <div className="space-y-2">
                  {Object.entries(creatorInfo.subscriberStatisticsResponse.genderDistribution).map(([gender, count]) => (
                    <div key={gender} className="flex items-center justify-between">
                      <span className="text-gray-600">{gender === 'MALE' ? '남성' : gender === 'FEMALE' ? '여성' : gender}</span>
                      <span className="font-medium text-gray-900">{count}명</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 채널 콘텐츠 목록 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">채널 콘텐츠</h2>
        <p className="text-gray-600">콘텐츠 목록은 채널 상세 페이지에서 확인할 수 있습니다.</p>
      </div>
    </div>
  );
}


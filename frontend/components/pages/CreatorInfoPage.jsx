import React from 'react';
import { Users, Video, Heart, Calendar, CheckCircle } from 'lucide-react';
import { getCreator } from '@/app/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">구독자 통계</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {creatorInfo.subscriberStatisticsResponse.ageDistribution && (
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">연령대별 구독자</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={Object.entries(creatorInfo.subscriberStatisticsResponse.ageDistribution).map(([age, count]) => ({
                      age: `${age}대`,
                      count: count
                    }))}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="age" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      stroke="#9ca3af"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      stroke="#9ca3af"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [`${value}명`, '구독자']}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {creatorInfo.subscriberStatisticsResponse.genderDistribution && (
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">성별 구독자</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Object.entries(creatorInfo.subscriberStatisticsResponse.genderDistribution).map(([gender, count]) => ({
                        name: gender === 'MALE' ? '남성' : gender === 'FEMALE' ? '여성' : gender,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(creatorInfo.subscriberStatisticsResponse.genderDistribution).map((entry, index) => {
                        const colors = ['#3b82f6', '#ec4899'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value) => `${value}명`}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => value}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 활동 지표 */}
      {creatorInfo.recentContentCount !== undefined && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">활동 지표</h2>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">최근 5일간 활동</p>
                <p className="text-sm font-medium text-gray-700">
                  {(() => {
                    const today = new Date();
                    const fiveDaysAgo = new Date();
                    fiveDaysAgo.setDate(today.getDate() - 5);
                    
                    const formatDate = (date) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}.${month}.${day}`;
                    };
                    
                    return `${formatDate(fiveDaysAgo)} ~ ${formatDate(today)}`;
                  })()}
                </p>
              </div>
              
              <div className="flex items-center gap-4 md:border-l md:border-purple-200 md:pl-6">
                <div className="text-center md:text-right">
                  <p className="text-3xl font-bold text-purple-600 mb-1">
                    {creatorInfo.recentContentCount}
                  </p>
                  <p className="text-sm text-gray-600">건 발행</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-sm text-gray-700">
                크리에이터가 최근 5일간 총 <span className="font-semibold text-purple-600">{creatorInfo.recentContentCount}건</span>의 콘텐츠를 발행했습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


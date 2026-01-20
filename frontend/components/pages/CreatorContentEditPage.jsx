'use client';

import React from 'react';
import { ArrowLeft, Upload, Video, FileText, Save, X, Calendar } from 'lucide-react';
import { updateContent, getContent, getMyChannel } from '@/app/lib/api';

export function CreatorContentEditPage({ contentId, onNavigate }) {
  const [loading, setLoading] = React.useState(false);
  const [contentLoading, setContentLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [channel, setChannel] = React.useState(null);
  const [channelLoading, setChannelLoading] = React.useState(true);

  // 폼 상태
  const [formData, setFormData] = React.useState({
    title: '',
    contentType: 'VIDEO',
    accessType: 'FREE',
    previewRatio: 0,
    body: '',
    mediaUrl: '',
    price: 0,
    publishedAt: null,
  });

  // 발행 옵션: 'immediate' (즉시 발행), 'draft' (임시저장), 'scheduled' (예약 발행)
  const [publishOption, setPublishOption] = React.useState('immediate');
  const [scheduledDateTime, setScheduledDateTime] = React.useState('');

  // 콘텐츠 데이터 로드
  React.useEffect(() => {
    async function loadData() {
      try {
        setContentLoading(true);
        setError(null);

        // 콘텐츠 ID를 숫자로 변환
        const id = typeof contentId === 'string' ? parseInt(contentId, 10) : contentId;
        if (!id || isNaN(id)) {
          throw new Error('유효하지 않은 콘텐츠 ID입니다.');
        }

        // 콘텐츠 정보 가져오기
        const contentData = await getContent(id);
        console.log('콘텐츠 정보 로딩 성공:', contentData);

        // 폼 데이터 설정
        setFormData({
          title: contentData.title || '',
          contentType: contentData.contentType || 'VIDEO',
          accessType: contentData.accessType || 'FREE',
          previewRatio: contentData.previewRatio || 0,
          body: contentData.body || '',
          mediaUrl: contentData.mediaUrl || '',
          price: contentData.price || 0,
          publishedAt: contentData.publishedAt || null,
        });

        // 발행 옵션 설정
        if (!contentData.publishedAt) {
          setPublishOption('draft');
        } else {
          const publishedAt = new Date(contentData.publishedAt);
          const now = new Date();
          if (publishedAt > now) {
            setPublishOption('scheduled');
            setScheduledDateTime(publishedAt.toISOString().slice(0, 16));
          } else {
            setPublishOption('immediate');
          }
        }

        // 채널 정보 가져오기
        const channelData = await getMyChannel();
        console.log('채널 정보 로딩 성공:', channelData);
        if (!channelData) {
          throw new Error('채널 정보가 null입니다.');
        }
        setChannel(channelData);
      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        const errorMessage = err?.response?.data?.message || err?.message || '콘텐츠 정보를 불러올 수 없습니다.';
        setError(errorMessage);
      } finally {
        setContentLoading(false);
        setChannelLoading(false);
      }
    }

    if (contentId) {
      loadData();
    }
  }, [contentId]);

  // 폼 필드 업데이트
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 유효성 검사
      if (!formData.title.trim()) {
        throw new Error('제목을 입력해주세요.');
      }

      if (!channel) {
        throw new Error('채널 정보를 불러올 수 없습니다.');
      }

      // 접근 타입에 따른 가격 검증
      if ((formData.accessType === 'SINGLE_PURCHASE' || formData.accessType === 'PARTIAL') && formData.price <= 0) {
        throw new Error('유료 콘텐츠는 가격을 입력해주세요.');
      }

      // 미디어 URL 검증 (VIDEO 타입인 경우)
      if (formData.contentType === 'VIDEO' && !formData.mediaUrl.trim()) {
        throw new Error('비디오 URL을 입력해주세요.');
      }

      // 본문 검증 (TEXT 타입인 경우)
      if (formData.contentType === 'TEXT' && !formData.body.trim()) {
        throw new Error('본문을 입력해주세요.');
      }

      // 예약 발행 검증
      if (publishOption === 'scheduled' && !scheduledDateTime) {
        throw new Error('예약 발행일을 선택해주세요.');
      }

      if (publishOption === 'scheduled') {
        const scheduledDate = new Date(scheduledDateTime);
        if (scheduledDate <= new Date()) {
          throw new Error('예약 발행일은 현재 시간 이후여야 합니다.');
        }
      }

      // 콘텐츠 ID를 숫자로 변환
      const id = typeof contentId === 'string' ? parseInt(contentId, 10) : contentId;
      
      // publishedAt 설정: immediate면 현재 시간, scheduled면 선택한 시간, draft면 null
      let publishedAt = null;
      if (publishOption === 'immediate') {
        publishedAt = new Date().toISOString();
      } else if (publishOption === 'scheduled') {
        publishedAt = new Date(scheduledDateTime).toISOString();
      }
      
      const requestData = {
        title: formData.title.trim(),
        contentType: formData.contentType,
        accessType: formData.accessType,
        previewRatio: formData.previewRatio || 0,
        body: formData.body.trim() || null,
        mediaUrl: formData.mediaUrl.trim() || null,
        price: formData.price || 0,
        publishedAt: publishedAt
      };

      console.log('콘텐츠 수정 요청:', requestData);

      const result = await updateContent(id, requestData);
      console.log('콘텐츠 수정 성공:', result);

      // 성공 시 콘텐츠 목록으로 이동
      const successMessage = 
        publishOption === 'immediate' ? '콘텐츠가 수정되었습니다.' :
        publishOption === 'scheduled' ? '콘텐츠가 예약 발행으로 수정되었습니다.' :
        '콘텐츠가 임시저장으로 수정되었습니다.';
      alert(successMessage);
      onNavigate('creator-content', {});
    } catch (err) {
      console.error('콘텐츠 수정 실패:', err);
      setError(err.message || '콘텐츠 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (contentLoading || channelLoading) {
    return (
      <div className="space-y-8 pb-12">
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="space-y-8 pb-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">채널 정보를 불러올 수 없습니다.</p>
          <button
            onClick={() => onNavigate('creator-dashboard', {})}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="space-y-8 pb-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => onNavigate('creator-content', {})}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('creator-content', {})}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">콘텐츠 수정</h1>
          <p className="text-gray-600">콘텐츠 정보를 수정하세요</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">기본 정보</h2>
          
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="콘텐츠 제목을 입력하세요"
            />
          </div>

          {/* 콘텐츠 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              콘텐츠 타입 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.contentType === 'VIDEO' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="contentType"
                  value="VIDEO"
                  checked={formData.contentType === 'VIDEO'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <Video className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">비디오</span>
              </label>
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.contentType === 'TEXT' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="contentType"
                  value="TEXT"
                  checked={formData.contentType === 'TEXT'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">텍스트</span>
              </label>
            </div>
          </div>

          {/* 접근 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              접근 타입 <span className="text-red-500">*</span>
            </label>
            <select
              name="accessType"
              value={formData.accessType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="FREE">무료</option>
              <option value="PARTIAL">부분 유료 (미리보기)</option>
              <option value="SUBSCRIBER_ONLY">구독자 전용</option>
              <option value="SINGLE_PURCHASE">단건 구매</option>
            </select>
          </div>

          {/* 미리보기 비율 (PARTIAL인 경우) */}
          {formData.accessType === 'PARTIAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미리보기 비율 (%)
              </label>
              <input
                type="number"
                name="previewRatio"
                value={formData.previewRatio}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                콘텐츠의 몇 %까지 무료로 제공할지 설정하세요
              </p>
            </div>
          )}

          {/* 가격 (SINGLE_PURCHASE 또는 PARTIAL인 경우) */}
          {(formData.accessType === 'SINGLE_PURCHASE' || formData.accessType === 'PARTIAL') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                가격 (원) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                required={formData.accessType === 'SINGLE_PURCHASE' || formData.accessType === 'PARTIAL'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="0"
              />
              {formData.accessType === 'PARTIAL' && (
                <p className="text-sm text-gray-500 mt-1">
                  전체 콘텐츠를 구매할 수 있는 가격입니다.
                </p>
              )}
            </div>
          )}
        </div>

        {/* 콘텐츠 내용 */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xl font-bold text-gray-900">콘텐츠 내용</h2>

          {/* 비디오 URL */}
          {formData.contentType === 'VIDEO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비디오 URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="mediaUrl"
                value={formData.mediaUrl}
                onChange={handleChange}
                required={formData.contentType === 'VIDEO'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="https://example.com/video.mp4"
              />
            </div>
          )}

          {/* 본문 (TEXT 타입) */}
          {formData.contentType === 'TEXT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                본문 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                required={formData.contentType === 'TEXT'}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="콘텐츠 본문을 입력하세요"
              />
            </div>
          )}
        </div>

        {/* 발행 옵션 */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-xl font-bold text-gray-900">발행 옵션</h2>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">
              발행 옵션을 선택하세요. 선택하지 않으면 <strong className="text-gray-900">즉시 발행</strong>됩니다.
            </p>
            
            {/* 임시저장 */}
            <div
              onClick={() => {
                if (publishOption === 'draft') {
                  setPublishOption('immediate');
                  setScheduledDateTime('');
                } else {
                  setPublishOption('draft');
                  setScheduledDateTime('');
                }
              }}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                publishOption === 'draft' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                publishOption === 'draft'
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}>
                {publishOption === 'draft' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-900">임시저장</span>
                <p className="text-sm text-gray-500 mt-1">나중에 발행할 수 있도록 임시로 저장합니다.</p>
              </div>
            </div>

            {/* 예약 발행 */}
            <div
              onClick={() => {
                if (publishOption === 'scheduled') {
                  setPublishOption('immediate');
                  setScheduledDateTime('');
                } else {
                  setPublishOption('scheduled');
                }
              }}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                publishOption === 'scheduled' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                publishOption === 'scheduled'
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}>
                {publishOption === 'scheduled' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-900">예약 발행</span>
                <p className="text-sm text-gray-500 mt-1">지정한 날짜와 시간에 자동으로 발행됩니다.</p>
              </div>
            </div>

            {/* 예약 발행 날짜/시간 입력 */}
            {publishOption === 'scheduled' && (
              <div className="ml-7 mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  발행 예약 일시 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required={publishOption === 'scheduled'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => onNavigate('creator-content', {})}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                저장 중...
              </>
            ) : publishOption === 'immediate' ? (
              <>
                <Upload className="w-5 h-5" />
                수정하기
              </>
            ) : publishOption === 'scheduled' ? (
              <>
                <Calendar className="w-5 h-5" />
                예약 발행으로 수정
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                임시저장으로 수정
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

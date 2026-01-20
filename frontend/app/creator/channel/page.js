'use client';

import React from 'react';
import { Pencil } from 'lucide-react';
import { getMyChannel, updateChannel, uploadChannelThumbnail, getChannelCategories } from '@/app/lib/api';

export default function CreatorChannel() {
  const [channel, setChannel] = React.useState(null);
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    category: '',
    thumbnailUrl: '',
  });
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [removeImage, setRemoveImage] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const fileInputRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [categoryOptions, setCategoryOptions] = React.useState([]);

  React.useEffect(() => {
    let cancelled = false;

    const fetchChannel = async () => {
      try {
        setLoading(true);
        const data = await getMyChannel();
        if (cancelled) return;
        setChannel(data);
        setForm({
          title: data?.title ?? '',
          description: data?.description ?? '',
          category: data?.category ?? '',
          thumbnailUrl: data?.thumbnailUrl ?? '',
        });
        setSelectedFile(null);
        setRemoveImage(false);
        setError('');
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || '채널 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchChannel();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const categories = await getChannelCategories();
        if (!cancelled) {
          setCategoryOptions(categories || []);
        }
      } catch {
        if (!cancelled) {
          setCategoryOptions([]);
        }
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    if (removeImage) {
      setPreviewUrl('');
    } else {
      setPreviewUrl(form.thumbnailUrl || '');
    }
  }, [selectedFile, form.thumbnailUrl, removeImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      setSelectedFile(null);
      return;
    }
    setError('');
    setSelectedFile(file);
    if (file) {
      setRemoveImage(false);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setRemoveImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channel?.channelId && !channel?.id) return;

    try {
      setSaving(true);
      setSuccess('');
      setError('');

      if (!form.title.trim()) {
        setError('채널명을 입력해주세요.');
        return;
      }
      if (!form.category) {
        setError('카테고리를 선택해주세요.');
        return;
      }
      if (selectedFile && selectedFile.size === 0) {
        setError('업로드할 이미지 파일이 비어 있습니다.');
        return;
      }

      const channelId = channel.channelId || channel.id;
      let resolvedThumbnailUrl = form.thumbnailUrl;

      if (removeImage) {
        resolvedThumbnailUrl = null;
      }

      if (selectedFile) {
        const uploadResult = await uploadChannelThumbnail(channelId, selectedFile);
        resolvedThumbnailUrl = uploadResult?.thumbnailUrl ?? resolvedThumbnailUrl;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        thumbnailUrl: resolvedThumbnailUrl,
      };

      await updateChannel(channelId, payload);
      setChannel((prev) => (prev ? { ...prev, ...payload } : prev));
      setForm((prev) => ({ ...prev, thumbnailUrl: resolvedThumbnailUrl || '' }));
      setSelectedFile(null);
      setRemoveImage(false);
      setSuccess('채널 정보가 저장되었습니다.');
    } catch (err) {
      setError(err?.message || '채널 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-700">로딩 중...</div>;
  }

  if (error && !channel) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  const previewInitial = form.title.trim().slice(0, 1) || '?';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">채널 관리</h1>
          <p className="text-gray-700">내 채널 정보를 수정하고 이미지를 관리하세요.</p>
        </div>
        <div className="bg-white rounded-xl px-6 py-4 shadow-sm">
          <p className="text-sm text-gray-700">총 구독자</p>
          <p className="text-2xl font-bold text-gray-900">
            {(channel?.subscriberCount ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={form.title || '채널 이미지'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
                    {previewInitial}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50"
                aria-label="채널 이미지 수정"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">채널명</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="채널명을 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">채널 소개</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="채널 소개를 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">카테고리</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">카테고리를 선택하세요</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />

          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {saving ? '저장 중...' : '채널 정보 저장'}
          </button>
        </form>

      </div>
    </div>
  );
}

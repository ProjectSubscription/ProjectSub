'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { completeOAuthProfile } from '@/app/lib/api';
import { User, Mail, Calendar } from 'lucide-react';

export function OAuthCompleteProfileModal({ token, isOpen, onComplete, onClose }) {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    birthYear: '',
    gender: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    }

    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요.';
    }

    if (!formData.birthYear) {
      newErrors.birthYear = '출생년도를 입력해주세요.';
    } else {
      const year = parseInt(formData.birthYear);
      if (isNaN(year) || year < 1900 || year > 2026) {
        newErrors.birthYear = '올바른 출생년도를 입력해주세요. (1900-2026)';
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        nickname: formData.nickname.trim(),
        gender: formData.gender,
        birthYear: parseInt(formData.birthYear),
        ...(formData.email.trim() && { email: formData.email.trim() }),
      };

      await completeOAuthProfile(token, requestData);
      onComplete();
    } catch (error) {
      console.error('프로필 완성 실패:', error);
      setErrors({ submit: error.message || '프로필 완성에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-white">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            추가 정보 입력
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            서비스를 이용하기 위해 추가 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 닉네임 */}
          <div className="space-y-2">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-900">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요"
                value={formData.nickname}
                onChange={(e) => handleChange('nickname', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 ${
                  errors.nickname ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.nickname && (
              <p className="text-sm text-red-500">{errors.nickname}</p>
            )}
          </div>

          {/* 이메일 */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              이메일 <span className="text-gray-400 text-xs">(선택)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요 (선택사항)"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 ${
                  errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* 출생년도 (성별보다 먼저) */}
          <div className="space-y-2">
            <label htmlFor="birthYear" className="block text-sm font-medium text-gray-900">
              출생년도 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="birthYear"
                type="number"
                placeholder="예: 1990"
                min="1900"
                max="2026"
                value={formData.birthYear}
                onChange={(e) => handleChange('birthYear', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 ${
                  errors.birthYear ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                }`}
              />
            </div>
            {errors.birthYear && (
              <p className="text-sm text-red-500">{errors.birthYear}</p>
            )}
          </div>

          {/* 성별 (라디오 버튼) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              성별 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={formData.gender === 'MALE'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-900">남성</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={formData.gender === 'FEMALE'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-900">여성</span>
              </label>
            </div>
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender}</p>
            )}
          </div>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isSubmitting ? '처리 중...' : '완료'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

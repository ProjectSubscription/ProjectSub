'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { completeOAuthProfile } from '@/app/lib/api';
import { Mail, User, Calendar, UserCircle } from 'lucide-react';

export default function OAuthCompleteProfile() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const emailFromQuery = searchParams.get('email');

  const [formData, setFormData] = useState({
    email: emailFromQuery || '',
    nickname: '',
    birthYear: '',
    gender: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailFixed] = useState(!!emailFromQuery);

  useEffect(() => {
    if (!token) {
      alert('유효하지 않은 접근입니다.');
      router.push('/login');
    }
  }, [token, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email' && isEmailFixed) {
      return; // 이메일이 고정된 경우 변경 불가
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email && !isEmailFixed) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    }

    if (!formData.birthYear) {
      newErrors.birthYear = '출생년도를 입력해주세요.';
    } else {
      const year = parseInt(formData.birthYear);
      if (isNaN(year) || year < 1900 || year > 2026) {
        newErrors.birthYear = '올바른 출생년도를 입력하세요 (1900-2026).';
      }
    }

    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        nickname: formData.nickname,
        birthYear: parseInt(formData.birthYear),
        gender: formData.gender,
      };
      
      // 이메일이 있는 경우에만 포함
      if (formData.email) {
        submitData.email = formData.email;
      }

      await completeOAuthProfile(token, submitData);
      alert('회원가입이 완료되었습니다.');
      router.push('/');
    } catch (error) {
      console.error('OAuth profile completion error:', error);
      alert(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CreatorHub
          </h1>
          <p className="text-gray-600 mt-2">추가 정보를 입력해주세요</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">회원가입 정보 입력</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  disabled={isEmailFixed}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } ${isEmailFixed ? 'bg-gray-100 cursor-not-allowed text-gray-700' : 'bg-white'}`}
                  required={!isEmailFixed}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              {isEmailFixed && (
                <p className="mt-1 text-xs text-gray-600">소셜 로그인으로 제공된 이메일입니다.</p>
              )}
            </div>

            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                닉네임
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="닉네임을 입력하세요"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white ${
                    errors.nickname ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.nickname && <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>}
            </div>

            {/* 출생년도 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                출생년도
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
                <select
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                    errors.birthYear ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">선택하세요</option>
                  {Array.from({ length: 127 }, (_, i) => 2026 - i).map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
              </div>
              {errors.birthYear && <p className="mt-1 text-sm text-red-600">{errors.birthYear}</p>}
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                성별
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.gender ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </div>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>

            {/* 저장 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '처리 중...' : '저장'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

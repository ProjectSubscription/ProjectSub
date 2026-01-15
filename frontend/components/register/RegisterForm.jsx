import React from 'react';
import { Mail, Lock, User, Calendar, UserCircle } from 'lucide-react';

export function RegisterForm({ onSubmit, onNavigate }) {
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    birthYear: '',
    gender: '',
  });
  const [errors, setErrors] = React.useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    }

    if (!formData.birthYear) {
      newErrors.birthYear = '출생년도를 입력해주세요.';
    } else {
      const year = parseInt(formData.birthYear);
      if (year < 1900 || year > 2026) {
        newErrors.birthYear = '올바른 출생년도를 입력하세요 (1900-2026).';
      }
    }

    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    onSubmit({
      email: submitData.email,
      password: submitData.password,
      nickname: submitData.nickname,
      birthYear: parseInt(submitData.birthYear),
      gender: submitData.gender,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          이메일
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="8자 이상"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.password ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          비밀번호 확인
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호를 다시 입력하세요"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
        </div>
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          닉네임
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            placeholder="닉네임을 입력하세요"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.nickname ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
        </div>
        {errors.nickname && <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          출생년도
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          성별
        </label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
      >
        회원가입
      </button>
    </form>
  );
}

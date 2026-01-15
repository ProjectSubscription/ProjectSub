'use client';
import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { requestPasswordReset } from '@/app/lib/api';

export function PasswordResetRequestPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await requestPasswordReset(email);
      setMessage('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
      setEmail('');
    } catch (err) {
      setError(err.message || '이메일 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate?.('landing')}
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CreatorHub
            </h1>
          </button>
          <p className="text-gray-600 mt-2">크리에이터를 위한 플랫폼</p>
        </div>

        {/* Reset Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            비밀번호 찾기
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            가입하신 이메일을 입력하시면<br />
            비밀번호 재설정 링크를 보내드립니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '발송 중...' : '재설정 링크 보내기'}
            </button>
          </form>

          {message && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate?.('login')}
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              로그인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

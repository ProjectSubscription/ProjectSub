import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-4">CreatorHub</h3>
            <p className="text-sm text-gray-400">
              크리에이터와 팬을 연결하는<br />
              구독 기반 콘텐츠 플랫폼
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links - 서비스 */}
          <div>
            <h4 className="text-white font-medium mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">소개</a></li>
              <li><a href="#" className="hover:text-white transition-colors">채널 둘러보기</a></li>
              <li><a href="#" className="hover:text-white transition-colors">인기 콘텐츠</a></li>
              <li><a href="#" className="hover:text-white transition-colors">카테고리</a></li>
            </ul>
          </div>

          {/* Links - 크리에이터 */}
          <div>
            <h4 className="text-white font-medium mb-4">크리에이터</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">크리에이터 신청</a></li>
              <li><a href="#" className="hover:text-white transition-colors">수익 정책</a></li>
              <li><a href="#" className="hover:text-white transition-colors">가이드</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Links - 고객지원 */}
          <div>
            <h4 className="text-white font-medium mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">공지사항</a></li>
              <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
              <li><a href="#" className="hover:text-white transition-colors">개인정보처리방침</a></li>
              <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2025 CreatorHub. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Mail className="w-4 h-4" />
            <a href="mailto:support@creatorhub.com" className="hover:text-white transition-colors">
              support@creatorhub.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

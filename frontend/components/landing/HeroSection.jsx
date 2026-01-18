'use client';

import React from 'react';
import { Play, TrendingUp, Users, ArrowRight } from 'lucide-react';

export function HeroSection({ onNavigate, isAuthenticated = false }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              당신의 열정을<br />
              수익으로 만드세요
            </h1>
            <p className="text-xl text-blue-100">
              크리에이터와 팬이 만나는 구독 기반 콘텐츠 플랫폼
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => onNavigate(isAuthenticated ? 'home' : 'login')}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                지금 시작하기
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate(isAuthenticated ? 'channels' : 'login')}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
              >
                무료 콘텐츠 둘러보기
              </button>
            </div>
            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold">10,000+</p>
                <p className="text-blue-100 text-sm">활성 크리에이터</p>
              </div>
              <div>
                <p className="text-3xl font-bold">500,000+</p>
                <p className="text-blue-100 text-sm">구독자</p>
              </div>
              <div>
                <p className="text-3xl font-bold">1M+</p>
                <p className="text-blue-100 text-sm">콘텐츠</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-white opacity-10 rounded-2xl transform rotate-6"></div>
              <div className="relative bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-30">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                      <Play className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">무제한 시청</p>
                      <p className="text-sm text-blue-100">모든 콘텐츠 자유롭게</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">크리에이터 수익</p>
                      <p className="text-sm text-blue-100">90% 수익률 보장</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white bg-opacity-30 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">커뮤니티</p>
                      <p className="text-sm text-blue-100">팬과 소통하기</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

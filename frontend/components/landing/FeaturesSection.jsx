import React from 'react';
import { DollarSign, Play, Users } from 'lucide-react';

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            왜 CreatorHub인가요?
          </h2>
          <p className="text-lg text-gray-600">
            크리에이터와 팬 모두를 위한 최적의 플랫폼
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">높은 수익률</h3>
            <p className="text-gray-600">
              업계 최고 수준의 90% 수익률로 크리에이터를 지원합니다. 더 많은 수익을 창출하세요.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Play className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">다양한 콘텐츠</h3>
            <p className="text-gray-600">
              무료부터 프리미엄까지, 구독과 단건 구매 모두 지원하는 유연한 판매 방식.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">강력한 커뮤니티</h3>
            <p className="text-gray-600">
              팬과의 직접적인 소통으로 더 깊은 관계를 형성하고 충성도를 높이세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

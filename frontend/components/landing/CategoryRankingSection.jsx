import React from 'react';
import { Play, Star } from 'lucide-react';

export function CategoryRankingSection({ categories, selectedCategory, onCategoryChange, rankingContents, onNavigate }) {
  return (
    <section className="py-20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">카테고리별 콘텐츠 랭킹</h2>
          <p className="text-gray-600">인기 콘텐츠를 카테고리별로 확인하세요</p>
        </div>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Ranking List - 1~5위는 1열, 6~10위는 2열 */}
        <div className="space-y-6">
          {/* 1~5위: 1열 */}
          <div className="space-y-4">
            {rankingContents.slice(0, 5).map((content, index) => (
              <div
                key={content.id}
                onClick={() => onNavigate('login')}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex gap-4 p-4">
                  {/* 썸네일 */}
                  <div className="flex-shrink-0">
                    <img
                      src={content.thumbnailUrl}
                      alt={content.title}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* 순위 */}
                  <div className="flex-shrink-0 flex items-center">
                    <span className="font-bold text-lg text-black">
                      {index + 1}
                    </span>
                  </div>
                  
                  {/* 콘텐츠 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{content.creatorName}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {content.viewCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {content.likeCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 6~10위: 2열 */}
          <div className="grid md:grid-cols-2 gap-6">
            {rankingContents.slice(5, 10).map((content, index) => (
              <div
                key={content.id}
                onClick={() => onNavigate('login')}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex gap-4 p-4">
                  {/* 썸네일 */}
                  <div className="flex-shrink-0">
                    <img
                      src={content.thumbnailUrl}
                      alt={content.title}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* 순위 */}
                  <div className="flex-shrink-0 flex items-center">
                    <span className="font-bold text-lg text-black">
                      {index + 6}
                    </span>
                  </div>
                  
                  {/* 콘텐츠 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{content.creatorName}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {content.viewCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {content.likeCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

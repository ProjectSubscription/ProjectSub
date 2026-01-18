import React from 'react';
import { Clock, Play, Heart } from 'lucide-react';

export function NewContent({ contents, onNavigate }) {
  const handleContentClick = (content) => {
    // contentId를 사용하여 콘텐츠 상세 페이지로 이동
    const contentId = content.contentId || content.id;
    if (contentId && onNavigate) {
      onNavigate('content-detail', { contentId });
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" />
            최신 콘텐츠
          </h3>
          <p className="text-gray-600 mt-1">방금 올라온 신선한 콘텐츠</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {contents.map((content) => {
          const contentId = content.contentId || content.id;
          const thumbnailUrl = content.mediaUrl || content.thumbnailUrl || '/placeholder-content.jpg';
          
          return (
            <div
              key={contentId}
              onClick={() => handleContentClick(content)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="relative aspect-video">
                <img
                  src={thumbnailUrl}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-blue-600 ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  {content.accessType === 'FREE' ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      무료
                    </span>
                  ) : (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                      유료
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {content.title}
                </h4>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{(content.viewCount || 0).toLocaleString()} 조회</span>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{(content.likeCount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import React from 'react';
import { Heart, Play, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export function PopularContent({ contents, onNavigate }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const itemsPerPage = 4; // 한 번에 보여줄 콘텐츠 수
  const totalPages = Math.ceil(contents.length / itemsPerPage);

  const handleContentClick = (content) => {
    const contentId = content.contentId || content.id;
    if (contentId && onNavigate) {
      onNavigate('content-detail', { contentId });
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const getVisibleContents = () => {
    const start = currentIndex * itemsPerPage;
    const end = start + itemsPerPage;
    return contents.slice(start, end);
  };

  if (contents.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            인기 콘텐츠
          </h3>
          <p className="text-gray-600 mt-1">가장 많은 사랑을 받은 콘텐츠</p>
        </div>
        {contents.length > itemsPerPage && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="이전"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {totalPages}
            </span>
            <button
              onClick={goToNext}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="다음"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => {
            const start = pageIndex * itemsPerPage;
            const end = start + itemsPerPage;
            const pageContents = contents.slice(start, end);

            return (
              <div
                key={pageIndex}
                className="w-full flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {pageContents.map((content) => {
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
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-current" />
                          <span>{(content.likeCount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {content.title}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{(content.viewCount || 0).toLocaleString()} 조회</span>
                          <div className="flex items-center gap-1 text-red-500">
                            <Heart className="w-4 h-4 fill-current" />
                            <span className="font-medium">{(content.likeCount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* 페이지 인디케이터 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`페이지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

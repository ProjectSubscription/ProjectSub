import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, ThumbsUp, CornerDownRight, MessageCircle } from 'lucide-react';
import { createReviewComment, getReviewComments } from '@/app/lib/api';

// Recursive Comment Item Component
function CommentItem({ comment, onReply, depth = 0, currentUser, onNavigate }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplyClick = () => {
    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      onNavigate('login');
      return;
    }
    setIsReplying(!isReplying);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    onReply(replyText, comment.id);
    setIsReplying(false);
    setReplyText('');
  };

  return (
    <div className={`mt-3 ${depth > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">{comment.nickname || 'User'}</span>
            <span className="text-xs text-gray-500">
              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
          <button 
            onClick={handleReplyClick}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            답글
          </button>
        </div>
        <p className="text-sm text-gray-700">{comment.comment}</p>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <form onSubmit={handleReplySubmit} className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <CornerDownRight className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="답글을 입력하세요..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              autoFocus
            />
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setIsReplying(false)}
              className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              등록
            </button>
          </div>
        </form>
      )}

      {/* Recursive Children */}
      {comment.children && comment.children.length > 0 && (
        <div className="space-y-3 mt-3">
          {comment.children.map((child) => (
            <CommentItem 
              key={child.id} 
              comment={child} 
              onReply={onReply} 
              depth={depth + 1}
              currentUser={currentUser}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Review Item Component to handle individual review comments
function ReviewItem({ review, currentUser, onNavigate }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (review.id) {
      fetchComments();
    }
  }, [review.id]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      // Check if review.id is a real ID (number) or mock ID (string)
      if (typeof review.id === 'number') {
        const commentsData = await getReviewComments(review.id);
        setComments(commentsData || []);
      } else {
        // Mock comments for mock reviews
        setComments([]);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (commentText, parentId = null) => {
    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      onNavigate('login');
      return;
    }

    if (!commentText.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      // reviewId는 URL path variable로 전달됨
      // memberId는 백엔드 세션(@AuthenticationPrincipal)에서 가져오므로 body에 포함하지 않음
      // body에는 comment와 parentId만 전달
      await createReviewComment(review.id, {
        comment: commentText.trim(),
        parentId: parentId
      });
      
      if (!parentId) {
        setNewComment('');
      }
      // 댓글 목록 새로고침
      await fetchComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert(error.message || '댓글 등록에 실패했습니다.');
    }
  };

  const handleMainCommentSubmit = (e) => {
    e.preventDefault();
    handleSubmitComment(newComment);
  };

  const handleInputClick = () => {
    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      onNavigate('login');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
            {review.nickname ? review.nickname[0] : (review.userName ? review.userName[0] : '?')}
          </div>
          <div>
            <p className="font-medium text-gray-900">{review.nickname || review.userName || 'Unknown User'}</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'fill-current text-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
        </span>
      </div>
      <p className="text-gray-700 mb-4">{review.comment}</p>
      
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <button className="flex items-center gap-1 hover:text-blue-600">
          <ThumbsUp className="w-4 h-4" />
          <span>도움됨</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-4">
        {/* Comment List */}
        {comments.length > 0 && (
          <div className="space-y-3 mb-4">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onReply={(text, parentId) => handleSubmitComment(text, parentId)} 
                currentUser={currentUser}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}

        {/* Main Comment Input */}
        <form onSubmit={handleMainCommentSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <CornerDownRight className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onClick={handleInputClick}
              placeholder={currentUser ? "댓글을 입력하세요..." : "로그인이 필요한 서비스입니다."}
              readOnly={!currentUser}
              className={`w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${!currentUser ? 'bg-gray-100 cursor-pointer' : 'bg-gray-50 focus:bg-white'}`}
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || !currentUser}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            등록
          </button>
        </form>
      </div>
    </div>
  );
}

export function ReviewSection({ reviews, hasAccess, showReviewForm, onToggleReviewForm, onSubmitReview, rating, onRatingChange, review, onReviewChange, currentUser, onNavigate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          리뷰 ({reviews.length})
        </h3>
        {hasAccess && (
          <button
            onClick={onToggleReviewForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            리뷰 작성
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={onSubmitReview} className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평점
            </label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onRatingChange(i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      i < rating
                        ? 'fill-current text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              리뷰 내용
            </label>
            <textarea
              value={review}
              onChange={(e) => onReviewChange(e.target.value)}
              placeholder="이 콘텐츠에 대한 의견을 남겨주세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onToggleReviewForm}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              등록
            </button>
          </div>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <ReviewItem 
            key={rev.id} 
            review={rev} 
            currentUser={currentUser}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

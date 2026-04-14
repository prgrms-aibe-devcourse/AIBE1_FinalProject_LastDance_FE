// src/components/community/CommunityPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  Plus,
  Search,
  Filter,
  MessageCircle,
  Heart,
  Bookmark,
  Users,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  FileText,
  Clock,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  Megaphone,
  Handshake,
  ScrollText,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { usePostStore } from "../../store/community/postStore";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import { Post } from "../../types/community/community";

const CommunityPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  // useLocation은 계속 사용되므로 남겨둡니다. (예: navigate 함수 등)
  const location = useLocation();

  // 페이지 기억 기능 제거: 이 useEffect 훅을 삭제합니다.
  /*
  useEffect(() => {
    if (!location.pathname.startsWith("/community")) {
      localStorage.removeItem("communityCurrentPage");
    }
  }, [location.pathname]);
  */

  const {
    posts,
    loadPosts,
    deletePost,
    toggleLike,
    toggleBookmark,
    hasMore,
    currentPage: serverPage,
    totalPages: serverTotalPages,
  } = usePostStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "likes" | "comments">(
    "latest"
  );
  const [filterBy, setFilterBy] = useState<"all" | "bookmarked" | "liked">(
    "all"
  );
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const postsPerPage = 15;

  // 초기 로드 및 카테고리 변경 시
  useEffect(() => {
    const fetchInitialPosts = async () => {
      setIsLoading(true);
      try {
        await loadPosts(0, postsPerPage, selectedCategory, false);
      } catch (error) {
        toast.error("게시글을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialPosts();
  }, [selectedCategory, loadPosts]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await loadPosts(serverPage + 1, postsPerPage, selectedCategory, true);
    } catch (error) {
      toast.error("게시글을 더 불러오는 데 실패했습니다.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const totalLikes = useMemo(() => {
    return posts.reduce((sum, post) => sum + (post.likeCount || 0), 0);
  }, [posts]);

  const handleToggleLike = async (postId: string) => {
    if (!user) {
      alert("로그인 후 좋아요를 누를 수 있습니다.");
      navigate("/login");
      return;
    }
    await toggleLike(postId);
  };

  const handleToggleBookmark = async (postId: string) => {
    if (!user) {
      alert("로그인 후 북마크할 수 있습니다.");
      navigate("/login");
      return;
    }
    await toggleBookmark(postId);
  };

  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const categories = [
    { id: "all", name: "전체", icon: Filter, color: "text-orange-600" },
    {
      id: "FIND_MATE",
      name: "메이트구하기",
      icon: Megaphone,
      color: "text-orange-600",
    },
    {
      id: "LIFE_TIPS",
      name: "생활팁",
      icon: GraduationCap,
      color: "text-orange-600",
    },
    {
      id: "FREE_BOARD",
      name: "자유게시판",
      icon: MessageSquare,
      color: "text-orange-600",
    },
    //질문답변
    {
      id: "QNA",
      name: "질문답변",
      icon: Handshake,
      color: "text-orange-600",
    },
  ];

  const processedPosts = useMemo(() => {
    let tempPosts = [...posts];

    if (searchQuery) {
      tempPosts = tempPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // API에서 이미 필터링되지만, 클라이언트 사이드 검색/필터와 조합을 위해 유지
    if (selectedCategory !== "all") {
      tempPosts = tempPosts.filter(
        (post) => post.category === selectedCategory
      );
    }

    if (filterBy === "bookmarked") {
      tempPosts = tempPosts.filter((post) => post.userBookmarked);
    } else if (filterBy === "liked") {
      tempPosts = tempPosts.filter((post) => post.userLiked);
    }

    tempPosts.sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return (b.likeCount || 0) - (a.likeCount || 0);
        case "comments":
          return (b.commentCount || 0) - (a.commentCount || 0);
        case "latest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return tempPosts;
  }, [posts, searchQuery, selectedCategory, filterBy, sortBy]);

  const handlePostEdit = (post: Post) => {
    setEditingPost(post);
    setIsCreateModalOpen(true);
  };

  const handlePostDelete = async (postId: string) => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }
    try {
      await deletePost(postId);
      toast.success("게시글이 성공적으로 삭제되었습니다!");
    } catch (error) {
      console.error(`[게시글 삭제 실패] PostId: ${postId}`, error);
    }
  };

  const handlePostClick = (post: Post) => {
    navigate(`/community/${post.postId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="게시글을 검색해보세요..."
              value={tempSearchQuery}
              onChange={(e) => setTempSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:outline-none focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="ml-2 px-6 py-3 bg-accent-500 text-white rounded-2xl font-medium hover:bg-accent-600 transition-colors shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>검색</span>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary-100 text-primary-700 border-2 border-primary-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <category.icon
                className={`w-4 h-4 ${
                  selectedCategory === category.id
                    ? category.color
                    : "text-gray-500"
                }`}
              />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1">
            {[
              { key: "latest", label: "최신순", icon: Clock },
              { key: "likes", label: "좋아요순", icon: ThumbsUp },
              { key: "comments", label: "댓글순", icon: MessageCircle },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setSortBy(option.key as any);
                }}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === option.key
                    ? "bg-white text-accent-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFilterBy(filterBy === "bookmarked" ? "all" : "bookmarked");
              }}
              className={`p-2 rounded-lg transition-colors ${
                filterBy === "bookmarked"
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Bookmark
                className={`w-5 h-5 ${
                  filterBy === "bookmarked" ? "fill-current" : ""
                }`}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFilterBy(filterBy === "liked" ? "all" : "liked");
              }}
              className={`p-2 rounded-lg transition-colors ${
                filterBy === "liked"
                  ? "bg-orange-100 text-orange-700 border border-orange-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${
                  filterBy === "liked" ? "fill-current" : ""
                }`}
              />
            </motion.button>
          </div>
        </div>

        <motion.button
          className="flex items-center space-x-2 px-6 py-3 bg-accent-500 text-white rounded-2xl font-medium hover:bg-accent-600 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingPost(null);
            setIsCreateModalOpen(true);
          }}
        >
          <Plus className="w-5 h-5" />
          <span>글 작성</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 min-h-[300px]"
      >
        {isLoading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">게시글을 불러오는 중입니다...</p>
          </div>
        ) : processedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200 w-full">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              게시글이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== "all" || filterBy !== "all"
                ? "검색 조건에 맞는 게시글을 찾을 수 없습니다."
                : "첫 번째 게시글을 작성해보세요!"}
            </p>
          </div>
        ) : (
          <div className="w-full space-y-4">
            {processedPosts.map((post, index) => (
              <motion.div
                key={post.postId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % postsPerPage) * 0.05 }}
              >
                <PostCard
                  post={post}
                  onClick={() => handlePostClick(post)}
                  onEdit={handlePostEdit}
                  onDelete={handlePostDelete}
                  onToggleLike={handleToggleLike}
                  onToggleBookmark={handleToggleBookmark}
                />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && hasMore && (
          <div className="flex justify-center pt-8 pb-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center space-x-2 px-8 py-3 bg-white border-2 border-primary-200 text-primary-700 rounded-2xl font-semibold hover:bg-primary-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {isLoadingMore ? (
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <span>{isLoadingMore ? "불러오는 중..." : "게시글 더 보기"}</span>
            </motion.button>
          </div>
        )}
      </motion.div>
      {isCreateModalOpen && (
        <CreatePostModal
          post={editingPost}
          onClose={async () => {
            setIsCreateModalOpen(false);
            setEditingPost(null);
            await loadPosts();
          }}
        />
      )}
    </div>
  );
};

export default CommunityPage;

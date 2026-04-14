export interface Post {
  postId: string;
  title: string;
  content: string;
  category: string; // 백엔드 PostCategory의 Enum ID (예: "LIFE_TIPS")
  categoryName: string; // ✅ 추가: 백엔드 PostCategory의 한글 이름 (예: "생활팁")
  likeCount: number;
  reportCount: number; // 백엔드 DTO에 있다면 유지
  createdAt: string;
  updatedAt?: string;
  authorId: string; // 게시글 작성자의 UUID
  authorNickname: string; // 게시글 작성자의 닉네임
  commentCount: number;
  comments?: Comment[]; // 댓글 목록 (게시글 상세 조회 시 제공될 수 있음)
  userLiked: boolean; // 현재 사용자가 이 게시글에 '좋아요'를 눌렀는지 여부
  userBookmarked: boolean; // 현재 사용자가 이 게시글을 '북마크'했는지 여부
  likedBy?: string[];
  bookmarkedBy?: string[];
  authorProfileImageUrl?: string; // ✅ 추가: 게시글 작성자의 프로필 이미지 URL (Optional)
  deleted: boolean; // ✅ 추가: 신고로 인한 삭제 여부
}

export interface PaginatedResponse<T> {
  content: T[];
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface PostDetailProps {
  post: Post;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCommentAdded: () => void; // 이 줄을 추가합니다.
}

import { apiClient } from "../../utils/api";
import { Post, PaginatedResponse } from "../../types/community/community"; // Post, PaginatedResponse 타입 임포트

//전체 게시글 목록 가져오기
export const fetchAllPosts = async (
  page: number = 0,
  size: number = 10,
  category?: string
): Promise<PaginatedResponse<Post>> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (category && category !== "all") {
    params.append("category", category);
  }

  const response = await apiClient.get(`/api/v2/community?${params.toString()}`);
  return response.data.data;
};

// 게시글 상세 가져오기
export const fetchPostById = async (postId: string): Promise<Post> => {
  const response = await apiClient.get(`/api/v2/community/${postId}`);
  return response.data.data;
};

// 게시글 작성
export const createPost = async (data: {
  title: string;
  content: string;
  category: string;
  authorId: string; // 추가
  authorNickname: string; // 추가
  authorProfileImageUrl?: string; // 추가 (optional일 경우)
}): Promise<Post> => {
  const response = await apiClient.post("/api/v2/community", data);
  return response.data.data;
};

// 게시글 수정
export const updatePost = async (
  postId: string,
  data: Partial<{
    // Partial을 사용하여 모든 필드를 선택적으로 만듭니다.
    title: string;
    content: string;
    category: string;
  }>
): Promise<Post> => {
  const response = await apiClient.patch(`/api/v2/community/${postId}`, data);
  return response.data.data;
};

// 게시글 삭제
export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/api/v2/community/${postId}`);
};

// 게시글 좋아요/좋아요 취소
export const togglePostLike = async (postId: string): Promise<boolean> => {
  const response = await apiClient.post(`/api/v2/community/${postId}/likes`);
  return response.data.data; // 좋아요 상태(true: 좋아요, false: 좋아요 취소)를 반환합니다.
};

// 게시글 북마크/북마크 취소
export const togglePostBookmark = async (postId: string): Promise<boolean> => {
  const response = await apiClient.post(
    `/api/v2/community/${postId}/bookmarks`
  );
  return response.data.data;
};

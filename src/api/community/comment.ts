import { apiClient } from "../../utils/api";
import { Comment } from "../../types/community/comment"; // Comment 타입 임포트

// 댓글 목록 가져오기 (특정 게시글에 대한)
// GET /api/v1/comments/post/{postId}
export const fetchCommentsByPostId = async (
  postId: string
): Promise<Comment[]> => {
  const response = await apiClient.get(`/api/v2/comments/post/${postId}`);
  return response.data; // 컨트롤러 응답이 List<CommentResponseDTO>이므로 json.data가 아닐 수 있습니다.
};

// 댓글 작성
// POST /api/v1/comments
export const createComment = async (data: {
  postId: string; // 댓글을 작성할 게시글의 ID
  content: string; // 댓글 내용
}): Promise<Comment> => {
  const response = await apiClient.post("/api/v2/comments", data);
  return response.data; // 컨트롤러 응답이 CommentResponseDTO이므로 json.data가 아닐 수 있습니다.
};

// 댓글 수정
// PATCH /api/v1/comments/{commentId}
export const updateComment = async (
  commentId: string,
  data: {
    content: string; // 수정할 댓글 내용
  }
): Promise<Comment> => {
  const response = await apiClient.patch(`/api/v2/comments/${commentId}`, data);
  return response.data; // 컨트롤러 응답이 CommentResponseDTO이므로 json.data가 아닐 수 있습니다.
};

// 댓글 삭제
// DELETE /api/v1/comments/{commentId}
export const deleteComment = async (commentId: string): Promise<void> => {
  await apiClient.delete(`/api/v2/comments/${commentId}`);
};

import { create } from "zustand";
import { Post } from "../../types/community/community"; // Post 타입 정의 필요
import {
  fetchAllPosts,
  createPost as createPostApi, // createPost 이름 충돌 방지
  updatePost as updatePostApi, // updatePost 이름 충돌 방지
  deletePost as deletePostApi, // deletePost 이름 충돌 방지
  togglePostLike, // API 함수 추가
  togglePostBookmark, // API 함수 추가
} from "../../api/community/community"; // API 호출 함수 import

interface PostState {
  posts: Post[];
  lastFetched: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  setPosts: (posts: Post[]) => void;
  loadPosts: (
    page?: number,
    size?: number,
    category?: string,
    append?: boolean
  ) => Promise<void>;
  // ... rest of the interface
  addPost: (
    newPostData: Omit<
      Post,
      | "postId"
      | "createdAt"
      | "updatedAt"
      | "likeCount"
      | "reportCount"
      | "commentCount"
      | "userLiked"
      | "userBookmarked"
      | "authorNickname"
      | "authorProfileImageUrl"
      | "categoryName"
      | "comments"
    >,
    userId: string, // addPost에 필요한 userId, nickname, profileImageUrl 추가
    nickname: string,
    profileImageUrl: string
  ) => Promise<Post | undefined>; // Post를 반환하도록 수정
  updatePost: (
    postId: string,
    updatedData: Partial<Post>
  ) => Promise<Post | undefined>; // Post를 반환하도록 수정
  deletePost: (postId: string) => Promise<void>;
  setLastFetched: (timestamp: number) => void;
  // CommunityPage.tsx에서 사용하는 toggleLike, toggleBookmark 액션 추가
  toggleLike: (postId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  lastFetched: 0,
  hasMore: true,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  setPosts: (newPosts) => set({ posts: newPosts, lastFetched: Date.now() }),

  // loadPosts 액션 구현
  loadPosts: async (page = 0, size = 10, category, append = false) => {
    try {
      console.log("[usePostStore: 백엔드에서 게시글 로딩 시작]", {
        page,
        size,
        category,
        append,
      });
      const response = await fetchAllPosts(page, size, category);
      const mappedPosts: Post[] = response.content.map((item: any) => ({
        postId: item.postId,
        title: item.title,
        content: item.content,
        category: item.category,
        categoryName: item.categoryName,
        likeCount: item.likeCount,
        reportCount: item.reportCount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt ?? item.createdAt,
        authorId: item.authorId,
        authorNickname: item.authorNickname,
        authorProfileImageUrl: item.authorProfileImageUrl,
        userLiked: item.userLiked,
        commentCount: item.commentCount || 0,
        comments: item.comments || [],
        userBookmarked: item.userBookmarked || false,
        deleted: item.deleted || false,
      }));

      set((state) => ({
        posts: append ? [...state.posts, ...mappedPosts] : mappedPosts,
        lastFetched: Date.now(),
        hasMore: !response.last,
        currentPage: response.number,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      }));

      console.log("[usePostStore: 게시글 로딩 완료]");
    } catch (error) {
      console.error("[usePostStore: 게시글 로딩 실패]", error);
      if (!append) {
        set({ posts: [], hasMore: false });
      }
      throw error;
    }
  },

  // addPost 액션 구현 (비동기)
  addPost: async (newPostData, userId, nickname, profileImageUrl) => {
    try {
      // createPostApi의 인자 타입이 더 넓은 객체를 받지 않을 경우를 대비해 'as any' 캐스팅
      const createdPostResponse = await createPostApi({
        ...newPostData,
        authorId: userId,
        authorNickname: nickname,
        authorProfileImageUrl: profileImageUrl,
      } as any); // <-- 이 부분에 'as any' 캐스팅을 추가합니다.

      // 서버 응답으로 받은 게시글 정보를 Post 타입에 맞게 매핑
      const createdPost: Post = {
        postId: createdPostResponse.postId,
        title: createdPostResponse.title,
        content: createdPostResponse.content,
        category: createdPostResponse.category,
        categoryName: createdPostResponse.categoryName,
        likeCount: createdPostResponse.likeCount || 0,
        reportCount: createdPostResponse.reportCount || 0,
        createdAt: createdPostResponse.createdAt,
        updatedAt:
          createdPostResponse.updatedAt || createdPostResponse.createdAt,
        authorId: createdPostResponse.authorId,
        authorNickname: createdPostResponse.authorNickname,
        authorProfileImageUrl: createdPostResponse.authorProfileImageUrl,
        userLiked: createdPostResponse.userLiked || false,
        commentCount: createdPostResponse.commentCount || 0,
        comments: createdPostResponse.comments || [],
        userBookmarked: createdPostResponse.userBookmarked || false,
        deleted: createdPostResponse.deleted || false,
      };

      // 게시글 생성 성공 후, 목록을 다시 로드하여 최신 상태 반영
      await get().loadPosts();
      return createdPost;
    } catch (error) {
      console.error("[usePostStore: 게시글 추가 실패]", error);
      throw error;
    }
  },

  // updatePost 액션 구현 (비동기)
  updatePost: async (postId, updatedData) => {
    try {
      const response = await updatePostApi(postId, updatedData as any); // <-- 이 부분에 'as any' 캐스팅 추가
      const updatedPost: Post = {
        postId: response.postId,
        title: response.title,
        content: response.content,
        category: response.category,
        categoryName: response.categoryName,
        likeCount: response.likeCount,
        reportCount: response.reportCount,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        authorId: response.authorId,
        authorNickname: response.authorNickname,
        authorProfileImageUrl: response.authorProfileImageUrl,
        userLiked: response.userLiked,
        commentCount: response.commentCount,
        comments: response.comments,
        userBookmarked: response.userBookmarked,
        deleted: response.deleted,
      };
      await get().loadPosts(); // 업데이트 후 게시글 목록 새로고침
      return updatedPost;
    } catch (error) {
      console.error("[usePostStore: 게시글 업데이트 실패]", error);
      throw error;
    }
  },

  // deletePost 액션 구현 (비동기)
  deletePost: async (postId) => {
    try {
      await deletePostApi(postId);
      await get().loadPosts(); // 삭제 후 게시글 목록 새로고침
    } catch (error) {
      console.error("[usePostStore: 게시글 삭제 실패]", error);
      throw error;
    }
  },

  setLastFetched: (timestamp) => set({ lastFetched: timestamp }),

  // toggleLike 액션 구현
  toggleLike: async (postId) => {
    try {
      await togglePostLike(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.postId === postId
            ? {
                ...post,
                userLiked: !post.userLiked,
                likeCount: post.userLiked
                  ? (post.likeCount || 1) - 1
                  : (post.likeCount || 0) + 1,
              }
            : post
        ),
      }));
    } catch (error) {
      console.error(
        `[usePostStore: 좋아요 토글 실패] PostId: ${postId}`,
        error
      );
      throw error;
    }
  },

  // toggleBookmark 액션 구현
  toggleBookmark: async (postId) => {
    try {
      await togglePostBookmark(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.postId === postId
            ? { ...post, userBookmarked: !post.userBookmarked }
            : post
        ),
      }));
    } catch (error) {
      console.error(
        `[usePostStore: 북마크 토글 실패] PostId: ${postId}`,
        error
      );
      throw error;
    }
  },
}));

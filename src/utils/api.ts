import axios from "axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { eventEmitter } from "./eventEmitter"; // 추가

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // 개발환경: 빈 문자열이면 프록시 사용 (상대경로)
  if (import.meta.env.DEV && !envUrl) {
    return ""; // /api/v1/auth/me 형태로 요청
  }

  // 운영환경: 절대 URL 사용
  return envUrl || "52.78.132.28:8080";
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // 쿠키로 JWT 토큰 받으려면 필수
  headers: {
    "Content-Type": "application/json",
  },
});

// 401 에러 처리 상태
let isHandling401 = false;
let authErrorShown = false;

// 401 에러 처리 함수
const handleUnauthorized = () => {
  console.log("인증 만료 감지, 로그아웃 처리");

  // 한번만 알림 표시
  if (!authErrorShown) {
    authErrorShown = true;

    // 토스트 알림 표시
    toast.error("로그인이 필요합니다. 다시 로그인해주세요.", {
      duration: 1000,
      id: "auth-error", // 중복 방지
    });

    // 인증 상태 초기화 (로컬 스토리지 초기화)
    localStorage.removeItem("auth-storage");
    localStorage.removeItem("app-storage-v4");
    // 추가적으로 다른 모든 auth 관련 스토리지도 확인하여 제거
    Object.keys(localStorage).forEach((key) => {
      if (key.includes("auth") || key.includes("app-storage")) {
        localStorage.removeItem(key);
      }
    });

    // 1초 후 로그인 페이지로 이동 (이벤트 발생)
    setTimeout(() => {
      authErrorShown = false;
      eventEmitter.emit('unauthorized'); // 변경
    }, 1000);
  }
};

// 특수 상황 체크 함수
const shouldSkipUnauthorizedHandling = (url: string, method: string) => {
  const { isProcessingAccountDeletion } = useAuthStore.getState();
  const currentPath = window.location.pathname;

  // 인증 관련 페이지
  const isAuthPage =
    currentPath.includes("/login") ||
    currentPath.includes("/oauth2") ||
    currentPath.includes("/auth/callback");

  // 계정삭제 API
  const isAccountDeletion =
    url?.includes("/api/v2/users/me") && method === "delete";

  const isMainRoot = currentPath === "/";

  return (
    isAuthPage || isAccountDeletion || isProcessingAccountDeletion || isMainRoot
  );
};

// Refresh Token 처리 함수
const handleRefreshToken = async (originalRequest: any) => {
  try {
    // 한번만 refresh 시도
    await apiClient.post("/api/v2/auth/refresh");
    isHandling401 = false;
    // 성공하면 원래 요청 재시도
    return apiClient(originalRequest);
  } catch (refreshError) {
    isHandling401 = false;
    // Refresh 실패 시 로그아웃 처리
    handleUnauthorized();
    throw refreshError;
  }
};

// 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method;

    console.log("API 오류 발생: ", status, error.response?.data);

    if (status === 401 && !originalRequest._isRetry) {
      // 특수 상황에서는 401 에러를 그대로 반환
      if (shouldSkipUnauthorizedHandling(url, method)) {
        return Promise.reject(error);
      }

      // 이미 401 처리 중이면 중복 처리 방지
      if (isHandling401) {
        return Promise.reject(error);
      }

      isHandling401 = true;
      originalRequest._isRetry = true;

      // Refresh Token 시도
      return handleRefreshToken(originalRequest);
    }

    return Promise.reject(error);
  }
);

export const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const copyToClipboard = async (
  text: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true, message: "복사되었습니다!" };
  } catch (err) {
    console.error("복사 실패:", err);
    return { success: false, message: "복사에 실패했습니다." };
  }
};

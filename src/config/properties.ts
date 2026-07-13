const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const MAIN_PAGE_IMAGE_URL = trimTrailingSlash(
  import.meta.env.VITE_MAIN_PAGE_IMAGE_URL ||
    "/images/mainpageimage/"
);

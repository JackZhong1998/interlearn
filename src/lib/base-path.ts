export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBase(href: string) {
  if (!href || href.startsWith("http") || href.startsWith("data:") || href.startsWith("blob:")) {
    return href;
  }
  const path = href.startsWith("/") ? href : `/${href}`;
  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) return path;
  return `${BASE_PATH}${path}`;
}

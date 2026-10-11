import { apiRequest, type ApiResult } from "./api";
import type { Page, UserSummary } from "./types";

/** How many search matches to request for the add-collaborator popup. */
export const USER_SEARCH_PAGE_SIZE = 8;

/**
 * Search users by a single term matched against both `username` and `email`
 * (`GET /users`). The API requires at least one of the two params and returns
 * users matching either, so one input covers both fields. Browser-safe (no
 * `next/headers`); the caller's cookies are sent so the API can authorize.
 */
export function searchUsers(
  term: string,
  options: { size?: number; signal?: AbortSignal } = {},
): Promise<ApiResult<Page<UserSummary>>> {
  const params = new URLSearchParams();
  params.set("username", term);
  params.set("email", term);
  params.set("page", "0");
  params.set("size", String(options.size ?? USER_SEARCH_PAGE_SIZE));
  params.set("sort", "username,asc");

  return apiRequest<Page<UserSummary>>(`/users?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
    signal: options.signal,
  });
}

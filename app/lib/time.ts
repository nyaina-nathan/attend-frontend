import { cacheLife } from "next/cache";

/**
 * Current year, computed once and cached. Cache Components rejects an
 * uncached `new Date()` during prerendering, so this keeps the footer static.
 */
export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

/**
 * This function strips out `{/<placeholder>}`-like string in GitHub urls.
 *
 * @param url string
 */
export function stripGhUrlParams(url: string): string {
  return url.replace(/\{\/[a-z0-9]+\}/g, '');
}



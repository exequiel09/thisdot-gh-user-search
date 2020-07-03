import trim from 'lodash-es/trim';

/**
 * This function strips out `{/<placeholder>}`-like string in GitHub urls.
 *
 * @param url string
 */
export function stripGhUrlParams(url: string): string {
  return url.replace(/\{\/[a-z0-9\_]+\}/g, '');
}

/**
 * This function parses the `Link` response header from GitHub API for the possible total stars count
 *
 * @param link string | null
 */
export function parseLinkHeaderForCount(link: string | null): number {
  if (link === null) {
    return 0;
  }

  const [, lastSegment] = link.split(',');
  const [lastUrl, ] = trim(lastSegment).split(';');
  const parsedLastUrl = new URL(trim(lastUrl, '<>'));

  return +(parsedLastUrl.searchParams.get('page') ?? '0');
}



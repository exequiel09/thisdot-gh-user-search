export function stripGhUrlParams(url: string): string {
  return url.replace(/\{\/[a-z0-9]+\}/g, '');
}



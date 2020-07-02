import { parseLinkHeaderForCount, stripGhUrlParams } from './utils';

describe('Utils', () => {

  it('should strip GH url placeholder "{/<placeholder>}"', () => {
    const url1 = 'https://api.github.com/users/hardkoded/gists{/gist_id}';
    const url2 = 'https://api.github.com/users/hardkoded/starred{/owner}{/repo}';

    expect(stripGhUrlParams(url1)).toBe('https://api.github.com/users/hardkoded/gists');
    expect(stripGhUrlParams(url2)).toBe('https://api.github.com/users/hardkoded/starred');
  });

  it('should return the value of page parameter of the last URL in the string', () => {
    const link1 = '<https://api.github.com/user/28230318/starred?withCache%24=false&per_page=1&page=2>; rel="next", <https://api.github.com/user/28230318/starred?withCache%24=false&per_page=1&page=8>; rel="last"';

    expect(parseLinkHeaderForCount(link1)).toBe(8);
  });

});



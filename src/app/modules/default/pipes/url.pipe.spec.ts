import { UrlPipe } from './url.pipe';

describe('UrlPipe', () => {
  let pipe: UrlPipe;

  beforeEach(() => {
    pipe = new UrlPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should add "https://" when the url pass don\'t have one', () => {
    const url = 'www.example.com';

    expect(pipe.transform(url)).toBe(`https://${url}`);
  });

  it('should return the url as-is if the url contains "http://" or "https://"', () => {
    const url1 = 'http://www.example.com';
    const url2 = 'https://www.example.com';

    expect(pipe.transform(url1)).toBe(url1);
    expect(pipe.transform(url2)).toBe(url2);
  });

});



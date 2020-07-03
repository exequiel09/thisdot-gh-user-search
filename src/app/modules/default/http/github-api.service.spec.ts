import { createHttpFactory, HttpMethod, SpectatorHttp } from '@ngneat/spectator';

import { environment } from '@thisdot-gh-user-search/environment';

import { DUMMY_USERS_SEARCH_RESULTS, DUMMY_USER_RESULT } from '../testing';
import { GithubApiService } from './github-api.service';

describe('GithubApiService', () => {
  let spectator: SpectatorHttp<GithubApiService>;

  const createHttp = createHttpFactory(GithubApiService);

  beforeEach(() => spectator = createHttp());

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  it('should try to call search users endpoint', (done) => {
    const q = 'test';
    const page = 1;
    const limit = 20;

    spectator.service.getUsers({ q, page, limit }).subscribe(result => {
      expect(result.total_count).toEqual(DUMMY_USERS_SEARCH_RESULTS.total_count);
      expect(result.incomplete_results).toEqual(DUMMY_USERS_SEARCH_RESULTS.incomplete_results);
      expect(result.items.length).toEqual(DUMMY_USERS_SEARCH_RESULTS.items.length);

      done();
    });

    const req = spectator.expectOne(`${environment.api.gitHubSearch}/users?q=${q}&page=${page}&per_page=${limit}`, HttpMethod.GET);

    req.flush(DUMMY_USERS_SEARCH_RESULTS);
  });

  it('should try to call the user endpoint', (done) => {
    const url = 'https://api.github.com/users/test';

    spectator.service.getUser(url).subscribe(result => {
      expect(result.id).toEqual(DUMMY_USER_RESULT.id);
      expect(result.name).toEqual(DUMMY_USER_RESULT.name);
      done();
    });

    // the additional query parameters in the url are added due to @ngneat/cashew package so we need to manually
    // add it here or the test fails
    const req = spectator.expectOne(`${url}?cache$=true&withCache$=false&ttl$=40000`, HttpMethod.GET);

    req.flush(DUMMY_USER_RESULT);
  });
});




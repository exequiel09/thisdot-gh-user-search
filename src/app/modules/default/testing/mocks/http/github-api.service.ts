import { Observable, of } from 'rxjs';

import { GitHubApiQueryParams, GitHubSearchResults, GitHubUser, GitHubUserSearchResults } from '../../../models/github-api.model';
import { DUMMY_STARRED_RESULT, DUMMY_USERS_SEARCH_RESULTS, DUMMY_USER_RESULT } from '../../dummy-data';

export class MockGithubApiService {

  getUsers(_queryParams: GitHubApiQueryParams): Observable<GitHubUserSearchResults> {
    return of(DUMMY_USERS_SEARCH_RESULTS);
  }

  getUser(_url: string): Observable<GitHubUser> {
    return of(DUMMY_USER_RESULT);
  }

  // tslint:disable-next-line: no-any
  getPreformattedPaginatedData(_url: string): Observable<GitHubSearchResults<Record<string, any>>> {
    return of({
      incomplete_results: false,
      total_count: 1,
      items: [
        ...DUMMY_STARRED_RESULT,
      ],
    });
  }

}



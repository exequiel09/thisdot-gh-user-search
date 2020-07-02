import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { withCache } from '@ngneat/cashew';
import trim from 'lodash-es/trim';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@thisdot-gh-user-search/environment';

import { GitHubApiQueryParams, GitHubSearchResults, GitHubUser, GitHubUserSearchResults } from '../models/github-api.model';

@Injectable({
  providedIn: 'root'
})
export class GithubApiService {

  constructor(private readonly _httpClient: HttpClient) { }

  getUsers(queryParams: GitHubApiQueryParams): Observable<GitHubUserSearchResults> {
    let params = new HttpParams();
    params = params.append('q', queryParams.q);
    params = params.append('page', queryParams.page.toString());
    params = params.append('per_page', queryParams.limit.toString());

    return this._httpClient.get<GitHubUserSearchResults>(`${environment.api.gitHubSearch}/users`, { params });
  }

  getUser(url: string): Observable<GitHubUser> {
    return this._httpClient.get<GitHubUser>(url, withCache({
      withCache$: false,
      ttl$: 40000,
    }));
  }

  getPreformattedPaginatedData(url: string): Observable<GitHubSearchResults> {
    const params = withCache({
      withCache$: false,
      ttl$: 40000,
      per_page: 1,
    });

    return this._httpClient.get(url, { ...params, observe: 'response' }).pipe(
      map(response => {
        // parse link http header to get the possible total number of entities requested.
        // the example of use case is starred count is not provided directly in the users endpoint so we
        // cleverly get the total count by requesting specified end point and limiting the results to 1.
        let totalCount = 0;
        const link = response.headers.get('link');

        if (link !== null) {
          const [, lastSegment] = (response.headers.get('link') as string).split(',');
          const [lastUrl, ] = trim(lastSegment).split(';');
          const parsedLastUrl = new URL(trim(lastUrl, '<>'));

          totalCount = +(parsedLastUrl.searchParams.get('page') ?? '0');
        }

        return {
          incomplete_results: false,
          total_count: totalCount,
          items: [...(response.body as Record<string, string>[])],
        };
      })
    );
  }

}



import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { withCache } from '@ngneat/cashew';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@thisdot-gh-user-search/environment';

import { parseLinkHeaderForCount } from '../utils';
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
        const totalCount = parseLinkHeaderForCount(response.headers.get('link'));

        return {
          incomplete_results: false,
          total_count: totalCount,
          items: [...(response.body as Record<string, string>[])],
        };
      })
    );
  }

}



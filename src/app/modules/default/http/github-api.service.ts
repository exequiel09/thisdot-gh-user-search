import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import trim from 'lodash-es/trim';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

    // TODO: move this in a configuration file
    return this._httpClient.get<GitHubUserSearchResults>('https://api.github.com/search/users', { params });
  }

  getUser(url: string): Observable<GitHubUser> {
    return this._httpClient.get<GitHubUser>(url);
  }

  getPreformattedPaginatedData(url: string, queryParams: Partial<GitHubApiQueryParams> = {}): Observable<GitHubSearchResults> {
    // assemble the necessary http query parameters for the request
    let params = new HttpParams();
    Object.entries(queryParams).forEach(item => params = params.append(item[0], item[1] as string));

    return this._httpClient.get(url, { params, observe: 'response' }).pipe(
      map(response => {
        // parse link http header to get the possible total number of entities requested.
        // the example of use case is starred count is not provided directly in the users endpoint so we
        // cleverly get the total count by requesting specified end point and limiting the results to 1.
        const [, lastSegment] = (response.headers.get('link') as string).split(',');
        const [lastUrl, ] = trim(lastSegment).split(';');
        const parsedLastUrl = new URL(trim(lastUrl, '<>'));

        return {
          incomplete_results: false,
          total_count: +(parsedLastUrl.searchParams.get('page') ?? '1'),
          items: [...(response.body as Record<string, string>[])],
        };
      })
    );
  }

}



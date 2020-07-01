import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { GitHubUserSearchResults } from '../models/github-users.model';

export interface GitHubUserQueryParams {
  page: number;
  limit: number;
  q: string;
}

@Injectable({
  providedIn: 'root'
})
export class GithubApiService {

  constructor(private readonly _httpClient: HttpClient) { }

  getUsers(queryParams: GitHubUserQueryParams): Observable<GitHubUserSearchResults> {
    let params = new HttpParams();
    params = params.append('q', queryParams.q);
    params = params.append('page', queryParams.page.toString());
    params = params.append('per_page', queryParams.limit.toString());

    return this._httpClient.get<GitHubUserSearchResults>('https://api.github.com/search/users', { params });
  }

}



import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { ClrDatagridStateInterface } from '@clr/angular';
import isEqual from 'lodash-es/isEqual';
import { Observable, of, Subject } from 'rxjs';
import { auditTime, catchError, distinctUntilChanged, filter, pluck, switchMap } from 'rxjs/operators';

export interface SearchResultItem {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  score: number;
}

export interface SearchResults {
  total_count: number;
  incomplete_results: boolean;
  items: SearchResultItem[];
}

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexComponent implements OnInit {
  user$: Observable<SearchResults>;
  refreshDataGrid$: Observable<ClrDatagridStateInterface>;

  private readonly _refreshDataGrid$ = new Subject<ClrDatagridStateInterface>();

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _httpClient: HttpClient,
    private readonly _router: Router
  ) {
    this.refreshDataGrid$ = this._refreshDataGrid$.asObservable();

    this.refreshDataGrid$
      .pipe(
        auditTime(500),

        distinctUntilChanged<ClrDatagridStateInterface>(isEqual),

        pluck('filters')
      )
      .subscribe(filters => {
        if (typeof filters !== 'undefined' && filters.length > 0) {
          this._router.navigate(['/'], {
            queryParams: {
              username: filters[0].value,
            },
          });
        }
      })
      ;

    this.user$ = this._activatedRoute.queryParams.pipe(
      filter(queryParams => Object.keys(queryParams).length > 0 && typeof queryParams.username !== 'undefined'),

      switchMap(queryParams => {
        return this._httpClient.get<SearchResults>(`https://api.github.com/search/users?q=${queryParams.username}`).pipe(
          catchError(() => of<SearchResults>({
            total_count: 0,
            incomplete_results: false,
            items: [],
          }))
        );
      })
    );
  }

  ngOnInit(): void { }

  refreshDataGrid(state: ClrDatagridStateInterface): void {
    this._refreshDataGrid$.next(state);
  }

}



import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { ClrDatagridStateInterface } from '@clr/angular';
import isEqual from 'lodash-es/isEqual';
import { Observable, of, Subject } from 'rxjs';
import { auditTime, catchError, distinctUntilChanged, filter, map, pluck, shareReplay, switchMap, tap } from 'rxjs/operators';

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
  page = 1;
  perPage = 20;
  user$: Observable<SearchResultItem[]>;
  totalItem$: Observable<number>;
  refreshDataGrid$: Observable<ClrDatagridStateInterface>;

  private readonly _response$: Observable<SearchResults>;
  private readonly _refreshDataGrid$ = new Subject<ClrDatagridStateInterface>();

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _httpClient: HttpClient,
    private readonly _router: Router
  ) {
    this.refreshDataGrid$ = this._refreshDataGrid$.asObservable();

    this.refreshDataGrid$
      .pipe(
        auditTime(500),

        distinctUntilChanged<ClrDatagridStateInterface>(isEqual),

        map(dataGridState => {
          const queryParams: Record<string, string | number> = {};

          if (typeof dataGridState.filters !== 'undefined' && dataGridState.filters.length > 0) {
            queryParams.username = dataGridState.filters[0].value;
          }

          if (typeof dataGridState.page !== 'undefined') {
            queryParams.page = dataGridState.page.current as number;
            queryParams.limit = dataGridState.page.size as number;
          }

          return queryParams;
        }),

        tap(queryParams => {
          this.page = (queryParams.page as number) ?? 1;
          this.perPage = (queryParams.limit as number) ?? 20;

          this._cdr.markForCheck();
        }),

        filter(queryParams => Object.keys(queryParams).length > 0)
      )
      .subscribe(queryParams => {
        this._router.navigate(['/'], {
          queryParams,
        });
      })
      ;

    this._response$ = this._activatedRoute.queryParams.pipe(
      filter(queryParams => Object.keys(queryParams).length > 0 && typeof queryParams.username !== 'undefined'),

      switchMap(queryParams => {
        let params = new HttpParams();
        params = params.append('q', queryParams.username);
        params = params.append('page', queryParams.page);
        params = params.append('per_page', queryParams.limit);

        return this._httpClient.get<SearchResults>('https://api.github.com/search/users', { params }).pipe(
          catchError(() => of<SearchResults>({
            total_count: 0,
            incomplete_results: false,
            items: [],
          }))
        );
      }),

      shareReplay({
        bufferSize: 1,
        refCount: true,
      })
    );

    this.user$ = this._response$.pipe(pluck('items'));
    this.totalItem$ = this._response$.pipe(pluck('total_count'));
  }

  ngOnInit(): void { }

  refreshDataGrid(state: ClrDatagridStateInterface): void {
    this._refreshDataGrid$.next(state);
  }

}



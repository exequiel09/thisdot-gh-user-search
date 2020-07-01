import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { ClrDatagridStateInterface } from '@clr/angular';
import isEqual from 'lodash-es/isEqual';
import { Observable, of, Subject } from 'rxjs';
import { auditTime, catchError, distinctUntilChanged, filter, map, pluck, shareReplay, switchMap, tap } from 'rxjs/operators';

import { GitHubUserSearchResultItem, GitHubUserSearchResults } from '../../models/github-users.model';

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexComponent implements OnInit {
  page = 1;
  perPage = 20;
  user$: Observable<GitHubUserSearchResultItem[]>;
  totalItem$: Observable<number>;
  refreshDataGrid$: Observable<ClrDatagridStateInterface>;

  private readonly _response$: Observable<GitHubUserSearchResults>;
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

        return this._httpClient.get<GitHubUserSearchResults>('https://api.github.com/search/users', { params }).pipe(
          catchError(() => of<GitHubUserSearchResults>({
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



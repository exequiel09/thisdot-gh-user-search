import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ClrDatagridStateInterface } from '@clr/angular';
import isEqual from 'lodash-es/isEqual';
import { Observable, of, Subject } from 'rxjs';
import {
  auditTime,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  pluck,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';

import { GitHubApiQueryParams, GitHubUserSearchResultItem, GitHubUserSearchResults } from '../../models/github-api.model';
import { GithubApiService } from '../../http/github-api.service';

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexComponent implements OnInit {
  page = 1;
  perPage = 20;
  loading = false;
  user$: Observable<GitHubUserSearchResultItem[]>;
  totalItem$: Observable<number>;
  refreshDataGrid$: Observable<ClrDatagridStateInterface>;

  private readonly _response$: Observable<GitHubUserSearchResults>;
  private readonly _refreshDataGrid$ = new Subject<ClrDatagridStateInterface>();

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _router: Router,
    private readonly _githubApiService: GithubApiService
  ) {
    this.refreshDataGrid$ = this._refreshDataGrid$.asObservable();

    this.refreshDataGrid$
      .pipe(
        auditTime(500),

        distinctUntilChanged<ClrDatagridStateInterface>(isEqual),

        withLatestFrom(this._activatedRoute.queryParams),

        map(([dataGridState, queryParams]) => {
          const newQueryParams: Partial<GitHubApiQueryParams> = {};

          if (typeof dataGridState.filters !== 'undefined' && dataGridState.filters.length > 0) {
            newQueryParams.q = dataGridState.filters[0].value;
          } else if (typeof queryParams.q !== 'undefined') {
            newQueryParams.q = queryParams.q;
          }

          if (typeof dataGridState.page !== 'undefined') {
            newQueryParams.page = dataGridState.page.current as number;
            newQueryParams.limit = dataGridState.page.size as number;
          }

          return newQueryParams;
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
      filter(queryParams => Object.keys(queryParams).length > 0 && typeof queryParams.q !== 'undefined'),

      tap(() => {
        this.loading = true;
        this._cdr.markForCheck();
      }),

      switchMap(queryParams => {
        return this._githubApiService.getUsers(queryParams as GitHubApiQueryParams).pipe(
          catchError(() => of<GitHubUserSearchResults>({
            total_count: 0,
            incomplete_results: false,
            items: [],
          })),

          tap(() => {
            this.loading = false;
            this._cdr.markForCheck();
          }),
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

  trackByUser(user: GitHubUserSearchResultItem): number {
    return user.id;
  }

}



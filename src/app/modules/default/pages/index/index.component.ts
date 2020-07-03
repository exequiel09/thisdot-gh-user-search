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
  skip,
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
        skip(1),

        auditTime(500),

        // use the lodash's isEqual function to check whether the emitted datagrid state is the same as previous
        // emission or not and ignore if it's the same
        distinctUntilChanged<ClrDatagridStateInterface>(isEqual),

        withLatestFrom(this._activatedRoute.queryParams),

        // transform the datagrid state into an object of query params
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

        // perform a side-effect to reflect the new property values for `page` and `perPage` and
        // mark the component for check to check any changes during next CD run since the component's
        // change detection strategy is set to OnPush
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

    // Use the query strings as the source of truth for datagrid state which enables us to request the users
    // on page load when the correct query parameters are in place.
    this._response$ = this._activatedRoute.queryParams.pipe(
      filter(queryParams => {
        return Object.keys(queryParams).length > 0 && typeof queryParams.q !== 'undefined' && queryParams.q.trim() !== '';
      }),

      // show the loading indicator in the datagrid by setting `loading` property to true and
      // mark the component for check to check any changes during next CD run since the component's
      // change detection strategy is set to OnPush
      tap(() => {
        this.loading = true;
        this._cdr.markForCheck();
      }),

      // map an inner observable that fetches users from GitHub Search API
      switchMap(queryParams => {
        const validatedQueryParams = { ...queryParams };

        if (typeof validatedQueryParams.page === 'undefined') {
          validatedQueryParams.page = this.page;
        }

        if (typeof validatedQueryParams.limit === 'undefined') {
          validatedQueryParams.limit = this.perPage;
        }

        return this._githubApiService.getUsers(validatedQueryParams as GitHubApiQueryParams).pipe(
          catchError(() => of<GitHubUserSearchResults>({
            total_count: 0,
            incomplete_results: false,
            items: [],
          })),

          // hide the loading indicator in the datagrid by setting `loading` property to true
          tap(() => {
            this.loading = false;
            this._cdr.markForCheck();
          }),
        );
      }),

      // finally, replay any previously emitted values upon subscription
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



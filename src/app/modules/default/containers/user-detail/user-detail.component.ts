import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { forkJoin, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { retryBackoff, RetryBackoffConfig } from 'backoff-rxjs';

import { GitHubUser, GitHubUserSearchResultItem } from '../../models/github-api.model';
import { GithubApiService } from '../../http/github-api.service';
import { stripGhUrlParams } from '../../utils';

@Component({
  selector: 'tdgh-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnDestroy, OnInit {
  loading = true;
  info$: Observable<GitHubUser>;
  errored$: Observable<boolean>;

  @Input() user!: GitHubUserSearchResultItem;

  private readonly _errored$ = new Subject<boolean>();
  private readonly _info$ = new Subject<GitHubUser>();
  private readonly _unsubscribe$ = new Subject<undefined>();

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _githubApiService: GithubApiService
  ) {
    this.errored$ = this._errored$.asObservable();
    this.info$ = this._info$.asObservable();

    merge(this.info$, this.errored$)
      .pipe(
        tap(() => {
          this.loading = false;
          this._cdr.markForCheck();
        }),

        takeUntil(this._unsubscribe$)
      )
      .subscribe()
      ;
  }

  ngOnDestroy(): void {
    // push a notification value to terminate existing subscribers and complete the subject immediately
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngOnInit(): void {
    const backoffConfig: RetryBackoffConfig = {
      initialInterval: 60,
      maxRetries: 12,
      shouldRetry: (error: HttpErrorResponse) => {
        if (error.status === 403 && error.statusText.trim().toLowerCase() === 'rate limit exceeded') {
          return false;
        }

        return true;
      }
    };

    const user$ = this._githubApiService.getUser(this.user.url).pipe(
      retryBackoff(backoffConfig)
    );

    const starred$ = this._githubApiService.getPreformattedPaginatedData(stripGhUrlParams(this.user.starred_url)).pipe(
      retryBackoff(backoffConfig)
    );

    forkJoin([user$, starred$])
      .pipe(
        map(([user, stars]) => {
          return {
            ...user,
            stars: stars.total_count,
          };
        }),

        catchError(() => of(null)),

        takeUntil(this._unsubscribe$)
      )
      .subscribe(info => {
        if (info === null) {
          this._errored$.next(true);
        } else {
          this._info$.next(info);
        }
      })
      ;
  }

}



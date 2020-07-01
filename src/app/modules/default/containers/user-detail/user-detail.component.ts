import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { forkJoin, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { GitHubUser, GitHubUserSearchResultItem } from '../../models/github-api.model';
import { GithubApiService } from '../../http/github-api.service';
import { stripGhUrlParams } from '../../utils';

@Component({
  selector: 'tdgh-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnInit {
  loading = true;
  info$: Observable<GitHubUser>;

  @Input() user!: GitHubUserSearchResultItem;

  private readonly _info$ = new Subject<GitHubUser>();

  constructor(
    private readonly _cdr: ChangeDetectorRef,
    private readonly _githubApiService: GithubApiService
  ) {
    this.info$ = this._info$.asObservable().pipe(
      tap(() => {
        this.loading = false;
        this._cdr.markForCheck();
      })
    );
  }

  ngOnInit(): void {
    const user$ = this._githubApiService.getUser(this.user.url);
    const starred$ = this._githubApiService.getPreformattedPaginatedData(stripGhUrlParams(this.user.starred_url), { per_page: 1 });

    forkJoin([user$, starred$])
      .pipe(
        map(([user, stars]) => {
          return {
            ...user,
            stars: stars.total_count,
          };
        })
      )
      .subscribe(info => this._info$.next(info))
      ;
  }

}



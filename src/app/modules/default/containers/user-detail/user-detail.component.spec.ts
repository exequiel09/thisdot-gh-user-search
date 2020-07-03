import { NO_ERRORS_SCHEMA } from '@angular/core';

import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { take } from 'rxjs/operators';

import { GithubApiService } from '../../http/github-api.service';
import { DUMMY_USERS_SEARCH_RESULTS, MockGithubApiService } from '../../testing';
import { stripGhUrlParams } from '../../utils';
import { DefaultValuePipe } from '../../pipes/default-value.pipe';
import { UserDetailComponent } from './user-detail.component';

describe('UserDetailComponent', () => {
  let spectator: Spectator<UserDetailComponent>;
  const createComponent = createComponentFactory({
    component: UserDetailComponent,
    detectChanges: false,
    schemas: [
      NO_ERRORS_SCHEMA,
    ],
    declarations: [
      DefaultValuePipe,
    ],
    componentProviders: [
      { provide: GithubApiService, useClass: MockGithubApiService },
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should call getUser and getPreformattedPaginatedData when change detection runs', (done) => {
    const apiService = spectator.inject(GithubApiService, true);
    const getUserSpy = spyOn(apiService, 'getUser').and.callThrough();
    const getPreformattedPaginatedDataSpy = spyOn(apiService, 'getPreformattedPaginatedData').and.callThrough();

    spectator.component.user = DUMMY_USERS_SEARCH_RESULTS.items[0];
    spectator.detectChanges();

    spectator.component.info$
      .pipe(
        take(1)
      )
      .subscribe(data => {
        expect(data.url).toBe(spectator.component.user.url);
        expect(data.stars).toBe(1);
        done();
      })
      ;

    expect(getUserSpy).toHaveBeenCalledWith(spectator.component.user.url);
    expect(getPreformattedPaginatedDataSpy).toHaveBeenCalledWith(stripGhUrlParams(spectator.component.user.starred_url));
  });
});



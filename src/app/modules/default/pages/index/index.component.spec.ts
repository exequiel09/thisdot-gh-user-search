import { NO_ERRORS_SCHEMA } from '@angular/core';

import { createRoutingFactory, SpectatorRouting } from '@ngneat/spectator';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

import { GithubApiService } from '../../http/github-api.service';
import { GitHubUserSearchResultItem } from '../../models/github-api.model';
import { DUMMY_USERS_SEARCH_RESULTS, MockGithubApiService } from '../../testing';
import { IndexComponent } from './index.component';

describe('IndexComponent', () => {
  let spectator: SpectatorRouting<IndexComponent>;
  const createComponent = createRoutingFactory({
    component: IndexComponent,
    schemas: [
      NO_ERRORS_SCHEMA,
    ],
    componentProviders: [
      { provide: GithubApiService, useClass: MockGithubApiService },
    ],
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should react to queryParam changes', (done) => {
    const ob$ = [
      spectator.component.user$.pipe(take(1)),
      spectator.component.totalItem$.pipe(take(1)),
    ];

    forkJoin(ob$).subscribe(([users, totalItems]) => {
      expect((users as GitHubUserSearchResultItem[])[0].id).toBe(DUMMY_USERS_SEARCH_RESULTS.items[0].id);
      expect(totalItems).toBe(DUMMY_USERS_SEARCH_RESULTS.total_count);

      done();
    });

    spectator.triggerNavigation({
      queryParams: {
        q: 'test',
        page: 1,
        limit: 20,
      },
    });
  });

});



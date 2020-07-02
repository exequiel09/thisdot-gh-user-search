import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'tdgh-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  searchQuery$: Observable<string>;

  private readonly _searchQuery$ = new Subject<string>();

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _router: Router
  ) {
    this.searchQuery$ = this._searchQuery$.asObservable();

    this._searchQuery$
      .pipe(
        debounceTime(300),

        distinctUntilChanged(),

        filter(q => q.trim() !== ''),

        withLatestFrom(this._activatedRoute.queryParams)
      )
      .subscribe(([q, currentQueryParams]) => {
        this._router.navigate(['/'], {
          queryParams: {
            ...currentQueryParams,
            q,
          }
        });
      })
      ;
  }

  onSearch(evt: KeyboardEvent): void {
    this._searchQuery$.next((evt.target as HTMLInputElement).value);
  }

}



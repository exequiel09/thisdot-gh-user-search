import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClarityModule } from '@clr/angular';

import { UrlPipe } from './pipes/url.pipe';
import { IndexComponent } from './pages/index/index.component';
import { UserDetailComponent } from './containers/user-detail/user-detail.component';
import { DefaultValuePipe } from './pipes/default-value.pipe';

@NgModule({
  imports: [
    CommonModule,

    ClarityModule,
  ],
  declarations: [
    IndexComponent,

    UserDetailComponent,

    UrlPipe,

    DefaultValuePipe,
  ],
})
export class DefaultModule { }



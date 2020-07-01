import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClarityModule } from '@clr/angular';

import { IndexComponent } from './pages/index/index.component';

@NgModule({
  imports: [
    CommonModule,

    ClarityModule,
  ],
  declarations: [
    IndexComponent
  ],
})
export class DefaultModule { }



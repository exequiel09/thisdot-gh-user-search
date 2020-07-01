import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexComponent implements OnInit {
  users: Record<string, string>[] = [];

  constructor() { }

  ngOnInit(): void { }

  refreshDataGrid(): void { }

}

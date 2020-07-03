import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'defaultValue'
})
export class DefaultValuePipe implements PipeTransform {

  // tslint:disable-next-line: no-any
  transform(value: any, defaultValue = 'N/A'): string {
    if (!!value) {
      return value;
    }

    return defaultValue;
  }

}



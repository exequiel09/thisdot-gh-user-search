import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'url'
})
export class UrlPipe implements PipeTransform {

  // check whether the given string already have `http://` or `https://` prepended on it
  // if it has, return the string as-is; else return a new string with `https://` prepended on it
  transform(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `https://${url}`;
  }

}



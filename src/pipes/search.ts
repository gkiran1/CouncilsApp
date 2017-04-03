import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'search',
  pure: true
})
@Injectable()
export class Search {
  transform(list: any[], searchTerm: string, property: string): any[] {
    if (searchTerm) {
      searchTerm = searchTerm.toUpperCase();
      return list.filter(item => {
        if (property === 'council') {
          return item.council.toUpperCase().indexOf(searchTerm) !== -1;
        } else if (property === 'username') {
          let username = item.firstname+' '+item.lastname;
          return username.toUpperCase().indexOf(searchTerm) !== -1;
        }
      });
    } else {
      return list;
    }
  }
}
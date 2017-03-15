import { Injectable, Pipe } from '@angular/core';
 
@Pipe({
  name: 'search',
  pure: true
})
@Injectable()
export class Search {
  transform(list: any[], searchTerm: string): any[] {
     if (searchTerm) {
        searchTerm = searchTerm.toUpperCase();
        return list.filter(item => {
          return item.firstname.toUpperCase().indexOf(searchTerm) !== -1;  
        });
      } else {
        return list;
      }
  }
}
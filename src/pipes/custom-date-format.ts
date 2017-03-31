import { Injectable, Pipe } from '@angular/core';
import * as moment from 'moment';
@Pipe({
  name: 'customdateformat',
  pure: true
})
@Injectable()
export class CustomDateFormat {
  transform(value, args) {
    if(!moment(value).isValid()) return value; // checking for invalid dates
    value = moment(value).calendar(); // apply calendar format initially
    if(moment(value,'MM/DD/YYYY',true).isValid()) return moment(value).format('LL'); // apply full date format
    return value.replace(/ AM$/,'am').replace(/ PM$/,'pm');
  }
}
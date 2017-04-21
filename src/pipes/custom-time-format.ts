import { Injectable, Pipe } from '@angular/core';
import * as moment from 'moment';
@Pipe({
    name: 'customtimeformat',
    pure: true
})
@Injectable()
export class CustomTimeFormat {
    transform(value, args) {
        if (!moment(value).isValid()) return value; // checking for invalid dates
        if (moment(value).diff(moment(), 'days') === 0) return moment(value).fromNow();
        value = moment(value).calendar(); // apply calendar format initially
        if (moment(value, 'MM/DD/YYYY', true).isValid()) return moment(value).format('LL'); // apply full date format
        return value.replace(/ AM$/, 'am').replace(/ PM$/, 'pm');
    }
}
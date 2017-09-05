import { Injectable, Pipe } from '@angular/core';

@Pipe({
    name: 'typingsexclude',
    pure: false
})
@Injectable()
export class TypingsExclude {
    transform(value, key) {
        if (!value) return value;
        return value.filter(obj => {
            return obj.userid !== key;
        })
    }
}
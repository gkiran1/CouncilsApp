import { Injectable, Pipe } from '@angular/core';

@Pipe({
    name: 'addtagcolor',
    pure: false
})
@Injectable()
export class AddTagColor {
    transform(value, args) {
        let tags = value && value.match(/@\w*/g);
        if (!tags) return value;
        tags.forEach(tag => {
            value = value.replace(tag, `<span class="tag-color">${tag}</span>`)
        })
        return value;
    }
}
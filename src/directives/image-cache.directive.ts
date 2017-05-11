
import { Directive, ElementRef } from '@angular/core';

declare var ImgCache: any;

@Directive({
  selector: '[image-cache]'
})
export class ImageCacheDirective {
  constructor (
    private el: ElementRef
  ) {
    // init
  }
  
  ngOnInit() {
    this.el.nativeElement.crossOrigin = "Anonymous"; // CORS enabling

    ImgCache.isCached(this.el.nativeElement.src, (path: string, success: any) => {

      if (success) {
        // already cached

        ImgCache.useCachedFile(this.el.nativeElement);
      } else {
        // not there, need to cache the image

        ImgCache.cacheFile(this.el.nativeElement.src, () => {

          // ImgCache.useCachedFile(el.nativeElement);
        });
      }
    });
  }
}
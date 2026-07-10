import { Directive, ElementRef, AfterViewInit, OnDestroy, inject, input } from '@angular/core';

@Directive({
  selector: '[appMasonryItem]',
  standalone: true
})
export class MasonryItemDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private resizeObserver?: ResizeObserver;

  rowHeight = input(8);
  rowGap = input(28);

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.setSpan());
    this.resizeObserver.observe(this.el.nativeElement);
    this.setSpan();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private setSpan(): void {
    const height = this.el.nativeElement.getBoundingClientRect().height;
    const unit = this.rowHeight() + this.rowGap();
    const rows = Math.ceil((height + this.rowGap()) / unit);
    this.el.nativeElement.style.gridRowEnd = `span ${rows}`;
  }
}
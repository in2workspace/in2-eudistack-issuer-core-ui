import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstElement',
  standalone: true
})
export class FirstElementPipe implements PipeTransform {
  public transform(value: unknown): any {
    if (Array.isArray(value)) {
      return value.length ? value[0] : null;
    }
    if (value && typeof value === 'object') {
      const firstKey = Object.keys(value)[0];
      return (value as Record<string, any>)[firstKey];
    }
    return null;
  }
}

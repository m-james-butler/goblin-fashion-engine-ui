import { Pipe, PipeTransform } from '@angular/core';

import { formatEnumLabel } from '../utils/enum-label.util';

@Pipe({
  name: 'enumLabel',
  standalone: true,
})
export class EnumLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatEnumLabel(value);
  }
}

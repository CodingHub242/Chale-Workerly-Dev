import { Pipe, PipeTransform } from '@angular/core';
import { Temp } from '../models/temp.model';
import { Shift } from '../models/shift.model';

interface TempWithShifts extends Temp {
  shifts: Shift[];
}

@Pipe({
  name: 'filterByStatus',
  standalone: true
})
export class FilterByStatusPipe implements PipeTransform {
  transform(temps: TempWithShifts[], status: string): TempWithShifts[] {
    if (!temps) return [];
    return temps.filter(temp => 
      temp.shifts.some(shift => shift.status === status)
    );
  }
}

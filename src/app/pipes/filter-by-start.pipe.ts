import { Pipe, PipeTransform } from '@angular/core';
import { Temp } from '../models/temp.model';
import { Shift } from '../models/shift.model';

interface TempWithShifts extends Temp {
  shifts: Shift[];
}

@Pipe({
  name: 'filterByTime',
  standalone: true
})
export class FilterByTimePipe implements PipeTransform {
  transform(temps: TempWithShifts[], status: string = new Date().toISOString().split('T')[0] ): TempWithShifts[] {
    if (!temps) return [];
    return temps.filter(temp => 
      temp.shifts.some(shift => shift.startTime.toISOString().split('T')[0] === status)
    );
  }
}

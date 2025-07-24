import { Shift } from './shift.model';

export interface Timesheet {
    id: number;
    shifts: Shift[];
    totalHours: number;
    totalPay: number;
    submittedDate: Date;
    approved: boolean;
}
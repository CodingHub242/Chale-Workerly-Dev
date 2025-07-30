import { Shift } from './shift.model';

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface TimesheetEntry {
    date: string;
    startTime: string;
    endTime: string;
    breakDuration: number;
    notes: string;
}

export interface Timesheet {
    id: number;
    tempId: number;
    shifts: Shift[];
    entries: TimesheetEntry[];
    totalHours: number;
    totalPay: number;
    submittedDate: Date;
    status: TimesheetStatus;
    approvedBy?: number;
    approvedDate?: Date;
    rejectionReason?: string;
    period: {
        startDate: string;
        endDate: string;
    };
}
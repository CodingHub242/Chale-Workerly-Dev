import { Client } from './client.model';
import { Timesheet } from './timesheet.model';

export interface Invoice {
    id: number;
    client: Client;
    timesheets: Timesheet[];
    totalAmount: number;
    issueDate: Date;
    dueDate: Date;
    paid: boolean;
}
import { Job } from './job.model';
import { Temp } from './temp.model';
import { Client } from './client.model';

export interface Shift {
    id: number;
    job: Job;
    temps: Temp[];
    client: Client;
    startTime: Date;
    endTime: Date;
    notes: string;
    status: 'pending' | 'checked-in' | 'started' | 'completed';
    checkedInAt?: Date;
}
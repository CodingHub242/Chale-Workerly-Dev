import { Job } from './job.model';
import { Temp } from './temp.model';
import { Client } from './client.model';

export interface Shift {
    id: number;
    job: Job;
    temp?: Temp;
    client: Client;
    startTime: Date;
    endTime: Date;
    notes: string;
    status: 'pending' | 'checked-in' | 'started' | 'completed';
}
import { Client } from './client.model';

export interface Job {
    id: number;
    title: string;
    description: string;
    client: Client;
    startDate: Date;
    endDate: Date;
    workhours: string;
    experience: number[];
    status: 'Assigning In Progress' | 'Assigned' | 'Completed' | 'Cancelled' | 'InActive' | 'Declined';
    attachments: File[];
    payRate: number;
}
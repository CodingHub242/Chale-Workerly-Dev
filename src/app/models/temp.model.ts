export interface Temp {
    id: number;
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    experience: number; // in years
    basePay: number; // per hour
    skills: string[];
    status: 'active' | 'inactive' | 'on-leave';
    approvalStatus?: 'pending' | 'approved' | 'declined';
    tempStatus?: 'pending' | 'accepted' | 'declined';
    profilePictureUrl?: string;
    pivot?: any;

    tempId?:any;
}

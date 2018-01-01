export interface UserEvent {
    id?: string;
    name: string;
    description: string;
    price: number;
    startDate: Date;
    startTime: Date;
    endDate: Date;
    endTime: Date;
    address?: string;
    addressID: string;
    latitude?: number;
    longitude?: number;
    website?: string;
    phone?: string;
    host: string;
    categories: string[];
    categoryString: string;
}
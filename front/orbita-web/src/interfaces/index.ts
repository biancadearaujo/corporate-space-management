export interface SubVenue {
    id: string;
    name: string;
    capacity: number;
    maximumMonths: number;
    openingTime: string;
    closingTime: string;
}

export interface OpeningHours {
    dayOfWeek: string;
    openingTime: string;
    closingTime: string;
}

export interface Venue {
    venueId: string;
    name: string;
    capacity: string | number;
    size?: string | number;
    image?: string;
    minimumHoursToCancel?: number;
    parking?: boolean;
    accessibilityId?: string;
    venueType?: 'AUDITORIUM' | 'COWORKING' | 'MEETING_ROOM' | null;
    divisible?: boolean;
    maximumMonths?: number;
    openingTime?: string;
    closingTime?: string;
    subVenues?: SubVenue[];
    openingHours?: OpeningHours[];
}

export interface VenueApiResponse {
    content: Venue[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export type Appointment = {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
};

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { Locale, SUPPORTED_LOCALES } from '@shared/types';
import { LocaleService } from '@app/services/locale.service';

const mockLocaleService = new LocaleService();

function registerHelpers() {
    Handlebars.registerHelper('t', function (this: any, key: string, options: Handlebars.HelperOptions) {
        const rootMeta = options.data?.root?.__meta as { locale: Locale } | undefined;
        const meta = (this?.__meta || rootMeta) as { locale: Locale } | undefined;
        const locale = meta?.locale || 'tr';

        let translation = mockLocaleService.getTranslation(locale as Locale, key);
        if (options?.hash) {
            for (const [param, value] of Object.entries(options.hash)) {
                translation = translation.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), String(value ?? ''));
            }
        }
        return translation;
    });

    Handlebars.registerHelper('ifRTL', function (this: any, options: Handlebars.HelperOptions) {
        const rootMeta = options.data?.root?.__meta as { direction: string } | undefined;
        const meta = (this.__meta || rootMeta) as { direction: string } | undefined;
        if (meta?.direction === 'rtl') {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper('formatDate', function (date: string | Date) {
        if (!date) return '';
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = d.toLocaleDateString('en-GB', { month: 'short' });
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    });

    Handlebars.registerHelper('formatCurrency', function (amount: number, currency: string) {
        if (amount === undefined || amount === null) return '';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency || 'TRY',
        }).format(amount);
    });

    Handlebars.registerHelper('ifEquals', function (this: any, arg1: any, arg2: any, options: Handlebars.HelperOptions) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });
    Handlebars.registerHelper('equalsIgnoreCase', function (arg1: unknown, arg2: unknown) {
        if (arg1 === undefined || arg1 === null || arg2 === undefined || arg2 === null) {
            return false;
        }
        return String(arg1).trim().toLowerCase() === String(arg2).trim().toLowerCase();
    });

    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('ne', (a, b) => a !== b);
    Handlebars.registerHelper('lt', (a, b) => a < b);
    Handlebars.registerHelper('gt', (a, b) => a > b);
    Handlebars.registerHelper('le', (a, b) => a <= b);
    Handlebars.registerHelper('ge', (a, b) => a >= b);

    Handlebars.registerHelper('add', (a: number, b: number) => a + b);

    Handlebars.registerHelper('or', function (...args: any[]) {
        const values = args.slice(0, -1);
        for (const value of values) {
            if (value !== undefined && value !== null && value !== '') return value;
        }
        return '';
    });

    Handlebars.registerHelper('concat', function (...args: any[]) {
        const values = args.slice(0, -1);
        return values.map(v => (v === undefined || v === null ? '' : String(v))).join('');
    });

    Handlebars.registerHelper('now', function () {
        return new Date();
    });

    Handlebars.registerHelper('safe', function (value: any) {
        return value || '';
    });
}

function registerPartials() {
    const partialsDir = path.resolve(process.cwd(), 'templates', 'partials');
    if (fs.existsSync(partialsDir)) {
        const files = fs.readdirSync(partialsDir).filter(f => f.endsWith('.hbs'));
        for (const file of files) {
            const name = path.basename(file, '.hbs');
            const content = fs.readFileSync(path.join(partialsDir, file), 'utf-8');
            Handlebars.registerPartial(name, content);
        }
    }
}

const commonData = {
    currentYear: new Date().getFullYear(),
};

function parseLocales(raw?: string): Locale[] {
    if (!raw) {
        return [...SUPPORTED_LOCALES];
    }

    const values = raw.split(',').map(v => v.trim()).filter(Boolean);
    const valid = values.filter((v): v is Locale => SUPPORTED_LOCALES.includes(v as Locale));

    if (valid.length === 0) {
        console.warn(`No valid locales found in PREVIEW_LOCALES="${raw}", falling back to all supported locales.`);
        return [...SUPPORTED_LOCALES];
    }

    return Array.from(new Set(valid));
}

const mockDataMap: Record<string, any> = {
    'welcome': {
        ...commonData,
        customerName: 'Ahmet Yılmaz',
        loginUrl: 'https://calibretour.com/login',
    },
    'password-reset': {
        ...commonData,
        customerName: 'Ahmet Yılmaz',
        resetUrl: 'https://calibretour.com/reset-password?token=123456',
    },
    'hotel-reservation': {
        ...commonData,
        customerName: 'Mehmet Demir',
        hotelName: 'Antalya Resort & Spa',
        hotelCity: 'Antalya',
        confirmationNumber: 'CT-987654',
        pinCode: '1234',
        checkInDate: '2025-07-15',
        checkInTime: '14:00',
        checkOutDate: '2025-07-22',
        checkOutTime: '12:00',
        reservationSummary: [
            { count: 1, name: 'Standard Double Room' }
        ],
        rooms: [
            {
                roomLabel: 'Room 1',
                roomTypeName: 'Standard Double Room',
                guestName: 'Mehmet Demir',
                mealPlan: 'All Inclusive',
                boardType: 'Full'
            }
        ],
        hotelLocation: 'Lara Beach, Antalya, Turkey',
        hotelPhone: '+90 242 123 45 67',
        hotelEmail: 'info@antalyaresort.com',
        cancellationPolicy: 'Free cancellation until 48 hours before check-in.',
        cancellationDetails: [
            'Cancellation before 2025-07-13: Free',
            'Late cancellation: 1 night penalty'
        ],
        freeCancellationUntil: '2025-07-07',
        freeCancellationTime: '23:59',
        priceItems: [
            { description: 'Accommodation (7 nights)', amount: 14000 }
        ],
        nightCount: 7,
        accommodationFee: 14000,
        vatAmount: 2520,
        totalAmount: 16520,
        currency: 'TRY',
        paymentDate: '2025-07-10',
        paymentStatus: 'Paid',
        cardBrand: 'Mastercard',
        cardLast4: '3234',
        cardHolder: 'Mehmet Demir',
        specialNote: 'Late check-in requested.',
        modifyUrl: 'https://calibretour.com/my-bookings/987654',
        timezone: 'CEST',
        safeLinkUrl: 'https://calibretour.com/security'
    },
    'flight-ticket': {
        ...commonData,
        customerName: 'Zeynep Kaya',
        pnrCode: 'RS0000000115',
        issueDate: '13 October 2025',
        modificationDate: '13 October 2025',
        createdBy: 'CALIBRE TOUR',
        flightNumber: 'IZ 73',
        airlineName: 'ARKIA AIRLINES',
        airlineLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Arkia_Logo_2017.png',
        departureDate: '20 October 2025',
        departureTime: '10:00',
        departureAirportCode: 'TLV',
        departureCity: 'Ben Gurion Airport',
        arrivalDate: '20 October 2025',
        arrivalTime: '11:30',
        arrivalAirportCode: 'RHO',
        arrivalCity: 'Rodos International Airport',
        luggageAllowance: '20 kg',
        handBaggage: '8 kg',
        terminal: '-',
        seatClass: 'ECONOMY',
        flightDuration: '90 dk',
        returnFlight: {
            flightNumber: 'IZ 70',
            airlineName: 'ARKIA AIRLINES',
            airlineLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Arkia_Logo_2017.png',
            departureDate: '27 October 2025',
            departureTime: '08:00',
            departureAirportCode: 'RHO',
            departureCity: 'Rodos International Airport',
            arrivalDate: '27 October 2025',
            arrivalTime: '09:30',
            arrivalAirportCode: 'TLV',
            arrivalCity: 'Ben Gurion Airport',
            luggageAllowance: '20 kg',
            handBaggage: '8 kg',
            terminal: '-',
            seatClass: 'ECONOMY',
            flightDuration: '90 dk'
        },
        passengers: [
            {
                title: 'Mr.',
                firstName: 'DENIZ',
                lastName: 'KEMAHLIOGLU',
                birthDate: '22 Aralik 1999',
                nationality: 'Turkey'
            }
        ],
        ticketFee: 1444.8,
        vatAmount: 96,
        totalAmount: 1514.08,
        currency: 'USD',
        paymentDate: '26 Jul 2025',
        paymentStatus: 'Paid',
        cardBrand: 'Mastercard',
        cardLast4: '3234',
        cardHolder: 'Guest Name',
        ticketUrl: 'https://calibretour.com/tickets/RS0000000115',
        manageBookingUrl: '#'
    },
    'flight-details': {
        ...commonData,
        customerName: 'Zeynep Kaya',
        pnrCode: 'PNR789',
        flights: [
            {
                airlineName: 'Turkish Airlines',
                flightNumber: 'TK1234',
                originCity: 'Istanbul',
                originCode: 'IST',
                originAirportName: 'Istanbul Airport',
                destinationCity: 'New York',
                destinationCode: 'JFK',
                destinationAirportName: 'John F. Kennedy International Airport',
                departureDate: '2025-08-10',
                departureTime: '10:30',
                arrivalDate: '2025-08-10',
                arrivalTime: '14:30',
                duration: '11h 00m',
                cabinClass: 'Economy'
            }
        ],
        passengers: [
            {
                passengerType: 'Adult',
                firstName: 'Zeynep',
                lastName: 'Kaya',
                birthDate: '1991-04-19',
                nationality: 'Turkey',
                ticketNumber: '023123456789'
            },
            {
                passengerType: 'Child',
                firstName: 'Mert',
                lastName: 'Kaya',
                birthDate: '2016-09-08',
                nationality: 'Turkey',
                ticketNumber: '023123456790'
            }
        ],
        priceItems: [
            { label: 'Ticket Fee', amount: 12400 },
            { label: 'VAT', amount: 100 }
        ],
        totalAmount: 12500,
        currency: 'TRY',
        paymentDate: '2025-08-01',
        paymentStatus: 'Paid',
        cardType: 'Mastercard',
        cardLastDigits: '3234',
        cardHolderName: 'Zeynep Kaya',
        manageBookingUrl: 'https://calibretour.com/my-bookings/PNR789'
    },
    'reservation-confirmation': {
        ...commonData,
        customerName: 'Can Öztürk',
        reservationNumber: 'B-12345',
        bookingId: 'B-12345',
        reservationDate: '2025-01-20',
        bookingDate: '2025-01-20',
        status: 'Confirmed',
        checkInDate: '2025-02-10',
        checkInTime: '14:00',
        checkOutDate: '2025-02-14',
        checkOutTime: '12:00',
        totalAmount: 5000,
        currency: 'TRY',
        priceItems: [
            { label: 'Museum Pass', amount: 1000 },
            { label: 'Guided City Tour', amount: 4000 }
        ],
        items: [
            { name: 'Museum Pass', price: 1000 },
            { name: 'Guided City Tour', price: 4000 }
        ],
        paymentDate: '2025-01-19',
        paymentStatus: 'Paid',
        cardBrand: 'Mastercard',
        cardLast4: '4242',
        cardHolder: 'Can Öztürk',
        reservationUrl: 'https://calibretour.com/my-bookings/B-12345'
    },
    'package-reservation': {
        ...commonData,
        reservationNumber: 'RS0000000094',
        status: 'Beklemede',
        passengerCount: 9,
        reservationDate: '12.07.2025',
        flights: [
            {
                date: '02.08.2025',
                flightNumber: 'IZ 75',
                departure: 'TLV - 10:30',
                arrival: 'RHO - 12:00',
                airline: 'ARKIA AIRLINES',
                duration: '1h 30m',
                baggage: '20 KG',
                cabinBaggage: '8 KG'
            },
            {
                date: '09.08.2025',
                flightNumber: 'IZ 76',
                departure: 'RHO - 13:30',
                arrival: 'TLV - 15:00',
                airline: 'ARKIA AIRLINES',
                duration: '1h 30m',
                baggage: '20 KG',
                cabinBaggage: '8 KG'
            }
        ],
        hotel: {
            name: 'GREEN NATURE DIAMOND HOTEL',
            dates: '02.08.2025 - 09.08.2025',
            code: '250802TLVRH002007'
        },
        rooms: [
            {
                label: 'Oda 1',
                type: 'STANDARD ROOM SEA VIEW',
                accommodation: 'İKİ YETİŞKİN',
                guests: [
                    { name: 'ADAM ABED', gender: 'Male', birthDate: '18.06.2007', nationality: 'Israel', passport: '36221407', expire: '01.01.2027' },
                    { name: 'TAREQ ABED', gender: 'Male', birthDate: '20.05.1979', nationality: 'Israel', passport: '35523210', expire: '01.01.2027' }
                ],
                contact: 'sisilia@4seasons.co.il | 972522976719'
            },
            {
                label: 'Oda 2',
                type: 'STANDARD ROOM LAND VIEW',
                accommodation: 'İKİ YETİŞKİN',
                guests: [
                    { name: 'TASNIM ZOABI', gender: 'Female', birthDate: '07.08.1995', nationality: 'Israel', passport: '40341904', expire: '01.01.2027' },
                    { name: 'DAHER ZOABI', gender: 'Male', birthDate: '25.03.1952', nationality: 'Israel', passport: '32120873', expire: '01.01.2027' }
                ],
                contact: 'sisilia@4seasons.co.il | 972522976719'
            },
            {
                label: 'Oda 3',
                type: 'STANDARD ROOM LAND VIEW',
                accommodation: 'İKİ YETİŞKİN + BEBEK',
                guests: [
                    { name: 'SAWSAN ZOUBI', gender: 'Male', birthDate: '27.02.1960', nationality: 'Israel', passport: '40341963', expire: '01.01.2027' },
                    { name: 'RANIN ZUABIABED', gender: 'Male', birthDate: '29.10.1980', nationality: 'Israel', passport: '31928651', expire: '01.01.2027' }
                ]
            }
        ],
        totalAmount: 1514.08,
        currency: 'USD',
        paymentDate: '26 Jul 2025',
        paymentStatus: 'Paid',
        cardBrand: 'Mastercard',
        cardLast4: '3234',
        cardHolder: 'Guest Name'
    },
    'transfer-reservation': {
        ...commonData,
        customerName: 'DENIZ KEMAHLIOGLU',
        transferType: 'Airport Pick-up',
        pickupLocation: 'Calibre Tour',
        dropoffLocation: 'Travel',
        vehicleType: 'VIP Minibus',
        duration: '20 min',
        passengerCount: 1,
        date: '2025-07-26',
        passengers: [
            { name: 'DENIZ', surname: 'KEMAHLIOGLU', birthDate: '22 Aralık 1999', nationality: 'Turkey' }
        ],
        priceItems: [
            { label: 'Base Price', amount: 1300.00 },
            { label: 'VAT (8%)', amount: 96.00 },
            { label: 'Service Fee', amount: 118.08 }
        ],
        totalAmount: 1514.08,
        currency: 'USD',
        paymentDate: '26 Jul 2025',
        paymentStatus: 'Paid',
        cardBrand: 'Mastercard',
        cardLast4: '3234',
        cardHolder: 'Guest Name'
    },
    'flight-confirmation-mail-7': {
        ...commonData,
        customerName: 'Kaya Özdemir',
        arrivalCity: 'Londra',
        confirmationNumber: '908-294-365-17',
        pnrCode: 'LHR-PNR-123',
        departureDate: 'Tuesday, 15 July 2025',
        departureTime: '23:30',
        arrivalDate: 'Thursday, 17 July 2025',
        arrivalTime: '12:00',
        originCity: 'Istanbul',
        originAirport: 'Istanbul Airport (IST)',
        destinationCity: 'Londra',
        destinationAirport: 'London Heathrow (LHR)',
        passengerName: 'Name',
        passengerSurname: 'Surname',
        passengerType: 'Adult',
        airlineCompany: 'Airplane Company',
        flightNumber: 'Flight NO',
        seatClass: 'Class',
        flightTime: 'Flight Time',
        luggageInfo: 'Luggage Info',
        ticketNumber: 'XXXXX',
        contactEmail: 'Email property',
        cancellationPolicy: 'LOREM IPSUM\n\nCancelations and refunds not permitted. Only taxes are refunded.',
        ticketFee: 1444.8,
        vatAmount: 96,
        totalAmount: 1514.08,
        currency: 'USD',
        paymentDate: '26 Jul 2025',
        cardType: 'mastercard',
        cardLastDigits: '3234',
        paymentStatus: 'Paid',
        learnMoreUrl: 'https://calibretour.com/help',
        modifyUrl: 'https://calibretour.com/modify/LHR-PNR-123'
    },
    'reservation-confirmation-common': {
        ...commonData,
        customerName: 'John Doe',
        confirmationNumber: 'CONF123'
    },
    'package-confirmation-8': {
        ...commonData,
        confirmationNumber: '908-294-365-17',
        bookingId: 'BK-123456',
        reservationDate: '2025-05-20',
        pnr: 'LHR-PNR-123',
        customerName: 'LOREM IPSUM',
        hotelName: 'Hilton Garden Inn Bordeaux Centre',
        hotelAddress: 'Bordeaux, France',
        hotelRating: '9.2',
        hotelRatingText: 'Wonderful',
        hotelStarCount: 4,
        hotelImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
        checkInDate: '2025-07-15',
        checkOutDate: '2025-07-17',
        departureDate: '2025-07-15',
        returnDate: '2025-07-17',
        departureCity: 'Istanbul',
        arrivalCity: 'Bordeaux',
        departureAirport: 'IST',
        arrivalAirport: 'BOD',
        departureTime: '23:30',
        arrivalTime: '12:00',
        airlineName: 'Turkish Airlines',
        airlineLogoUrl: 'https://www.gstatic.com/flights/airline_logos/70px/TK.png',
        cabinClass: 'Economy',
        duration: '3h 50m',
        stopCount: 'Nonstop',
        roomType: 'Standard Room',
        nightCount: 2,
        roomCount: 1,
        amenities: ['Free WiFi', 'Pool', 'Breakfast included'],
        passengers: [
            { firstName: 'LOREM', lastName: 'IPSUM', type: 'Adult', birthDate: '01.01.1990', identityNo: '12345678901', pnr: 'LHR-PNR-123', ticketNumber: 'TK-123456789' }
        ],
        priceItems: [
            { label: 'Ticket Fee', amount: 1444.8 },
            { label: 'Accommodation Fee', amount: 1444.8 },
            { label: 'Transfer Fee', amount: 1444.8 },
            { label: 'Service Fee', amount: 1444.8 }
        ],
        vatAmount: 96,
        totalAmount: 1514.08,
        currency: 'USD',
        paymentDate: '2025-05-20',
        cardType: 'Visa',
        cardLastDigits: '1234',
        modifyUrl: '#',
        flightNotes: [
            { title: 'Check-in', content: 'Online check-in opens 24h before departure.' },
            { title: 'Visa', content: 'Please check visa requirements for your destination.' }
        ],
        journey: {
            duration: '122',
            pickupTime: 'Fri, 31 Oct · 12:00',
            pickupLocation: 'Milas-Bodrum Airport (BJV), Ekinanbarı, Milas-Bodrum Yolu, 48200 Milas/Muğla, Türkiye',
            dropoffTime: 'Fri, 31 Oct · 14:02',
            dropoffLocation: 'Motto Premium Hotel, TR, Siteler, Kemal Seyfettin Elgin Blv. :59/1, 48700 Marmaris/Muğla, Türkiye',
            vehicleType: 'People carrier · 5 seats · 5 suitcase',
            provider: 'Powered by OZGUR TRANSFER'
        }
    },
    'package-confirmation-8-1': {
        ...commonData,
        bookingId: 'BK-789-012',
        reservationDate: '2025-05-20',
        confirmationNumber: '908-294-365-17',
        pnr: 'LHR-PNR-123',
        customerName: 'LOREM IPSUM',
        hotelName: 'Lorem Ipsum Hotel',
        hotelAddress: 'Malaga, Spain',
        checkInDate: '2025-07-15',
        checkOutDate: '2025-07-17',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        departureDate: '2025-07-15',
        returnDate: '2025-07-17',
        departureCity: 'Istanbul',
        arrivalCity: 'Malaga',
        departureAirport: 'IST',
        arrivalAirport: 'AGP',
        departureTime: '23:30',
        arrivalTime: '12:00',
        airlineName: 'Pegasus',
        airlineLogoUrl: 'https://www.gstatic.com/flights/airline_logos/70px/PC.png',
        cabinClass: 'Economy',
        duration: '3h 30m',
        luggageAllowance: '20kg',
        roomType: 'Superior Double',
        nightCount: 2,
        mealPlan: 'Bed & Breakfast',
        passengers: [
            { firstName: 'LOREM', lastName: 'IPSUM', type: 'Adult', birthDate: '01.01.1990', identityNo: '12345678901', pnr: 'LHR-PNR-123', ticketNumber: 'PC-987654321' }
        ],
        priceItems: [
            { label: 'Ticket Fee', amount: 1444.8 },
            { label: 'Accommodation Fee', amount: 1444.8 }
        ],
        vatAmount: 96,
        totalAmount: 1514.08,
        currency: 'USD',
        paymentDate: '2025-05-20',
        cardType: 'Mastercard',
        cardLastDigits: '5678',
        modifyUrl: '#',
        flightNotes: [
            { title: 'Luggage', content: '20kg checked luggage included in your fare.' },
            { title: 'Terminal', content: 'Please arrive at the terminal 3 hours before departure.' }
        ],
        journey: {
            duration: '122',
            pickupTime: 'Fri, 31 Oct · 12:00',
            pickupLocation: 'Milas-Bodrum Airport (BJV), Ekinanbarı, Milas-Bodrum Yolu, 48200 Milas/Muğla, Türkiye',
            dropoffTime: 'Fri, 31 Oct · 14:02',
            dropoffLocation: 'Motto Premium Hotel, TR, Siteler, Kemal Seyfettin Elgin Blv. :59/1, 48700 Marmaris/Muğla, Türkiye',
            vehicleType: 'People carrier · 5 seats · 5 suitcase',
            provider: 'Powered by OZGUR TRANSFER'
        }
    }
};

mockDataMap['1-person-package-confirmation-8'] = {
    ...mockDataMap['package-confirmation-8'],
    confirmationNumber: '111-222-333',
    customerName: 'John Doe',
    arrivalCity: 'Paris',
    hotelName: 'Hotel de Paris',
    hotelRating: '4.5',
    hotelImageUrl: 'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=400&q=80',
    passengers: [
        { firstName: 'John', lastName: 'Doe', type: 'Adult', birthDate: '10.10.1985', identityNo: '98765432109', pnr: 'FR-PNR-001', ticketNumber: 'AF-001' }
    ]
};

mockDataMap['4-person-package-confirmation-8'] = {
    ...mockDataMap['package-confirmation-8-1'],
    bookingId: 'BK-444-555',
    confirmationNumber: '444-555-666',
    pnr: 'PAR-PNR-789',
    customerName: 'Jane Smith',
    arrivalCity: 'London',
    hotelName: 'The Landmark London',
    roomCount: 2,
    roomType: 'Family Suite',
    passengers: [
        { firstName: 'Jane', lastName: 'Smith', type: 'Adult', birthDate: '05.05.1982', identityNo: '55544433322', pnr: 'BA-PNR-101', ticketNumber: 'BA-101' },
        { firstName: 'Bob', lastName: 'Smith', type: 'Adult', birthDate: '12.12.1980', identityNo: '11122233344', pnr: 'BA-PNR-101', ticketNumber: 'BA-102' },
        { firstName: 'Alice', lastName: 'Smith', type: 'Child', birthDate: '15.08.2015', identityNo: '99988877766', pnr: 'BA-PNR-101', ticketNumber: 'BA-103' },
        { firstName: 'Charlie', lastName: 'Smith', type: 'Infant', birthDate: '20.02.2024', identityNo: '00011122233', pnr: 'BA-PNR-101', ticketNumber: 'BA-104' }
    ]
};

mockDataMap['flight-confirmation'] = {
    ...commonData,
    pnrCode: 'RS0000000115',
    issueDate: '2025-02-07',
    modificationDate: '2025-02-08',
    createdBy: 'Admin',
    flights: [
        {
            type: 'Departure',
            date: '2025-10-20',
            flightCode: 'IZ 73',
            airlineName: 'ARKIA AIRLINES',
            originCity: 'Tel Aviv',
            originCode: 'TLV',
            destinationCity: 'Rhodes',
            destinationCode: 'RHO',
            departureTime: '10:00',
            arrivalTime: '11:30',
            duration: '90 dk',
            terminal: '3',
            baggageAllowance: '20 kg',
            handBaggage: '8 kg',
            seatClass: 'ECONOMY'
        },
        {
            type: 'Return',
            date: '2025-10-27',
            flightCode: 'IZ 74',
            airlineName: 'ARKIA AIRLINES',
            originCity: 'Rhodes',
            originCode: 'RHO',
            destinationCity: 'Tel Aviv',
            destinationCode: 'TLV',
            departureTime: '14:00',
            arrivalTime: '15:30',
            duration: '90 dk',
            terminal: '1',
            baggageAllowance: '20 kg',
            handBaggage: '8 kg',
            seatClass: 'ECONOMY'
        }
    ],
    passengers: [
        {
            title: 'Mr.',
            firstName: 'Deniz',
            lastName: 'Kemahlıoğlu',
            birthDate: '2000-01-01',
            nationality: 'TÜRKİYE'
        }
    ],
    ticketFee: 1250.00,
    vatAmount: 225.00,
    serviceFee: 50.00,
    totalAmount: 1514.08,
    currency: 'USD',
    ticketUrl: 'https://calibretour.com/tickets/RS0000000115',
    paymentDate: '2025-07-26',
    cardBrand: 'Mastercard',
    cardLast4: '3234',
    paidStatus: 'Paid'
};

mockDataMap['hotel-confirmation'] = {
    ...commonData,
    confirmNumber: 'CT-987654',
    pinCode: '1234',
    customerName: 'Mehmet Demir',
    hotelName: 'Antalya Resort & Spa',
    checkInDate: '2025-07-15',
    checkInTime: '14:00',
    checkOutDate: '2025-07-22',
    checkOutTime: '12:00',
    roomCount: 1,
    roomType: 'Standard Double Room',
    rooms: [
        {
            type: 'Standard Double Room',
            guestName: 'Mehmet Demir',
            mealPlan: 'All Inclusive',
            pensionType: 'Full'
        }
    ],
    hotelAddress: 'Lara Beach, Antalya, Turkey',
    hotelPhone: '+90 242 123 45 67',
    hotelEmail: 'info@antalyaresort.com',
    cancelPolicy: 'Free cancellation until 48 hours before check-in.',
    cancelFees: [
        { condition: 'Cancellation before 2025-07-13', fee: 'Free' },
        { condition: 'Late cancellation', fee: '1 night penalty' }
    ],
    nightCount: 7,
    accommodationFee: 14000.00,
    vatAmount: 2520.00,
    totalAmount: 16520.00,
    currency: 'TRY',
    paymentMessage: 'You\'ve scheduled a payment for this booking, and we\'ll charge your card automatically.',
    paymentDate: '2025-07-10',
    cardBrand: 'Mastercard',
    cardLast4: '3234',
    cardHolderName: 'Mehmet Demir',
    paidStatus: '',
    payNowUrl: 'https://calibretour.com/pay/CT-987654',
    updateCardUrl: 'https://calibretour.com/card/CT-987654',
    safeLinkUrl: 'https://calibretour.com/security',
    modifyUrl: 'https://calibretour.com/my-bookings/987654',
    specialNote: 'Late check-in requested.'
};

async function generate() {
    registerHelpers();
    registerPartials();

    const templatesDir = path.resolve(process.cwd(), 'templates');
    const previewDir = path.resolve(templatesDir, 'preview');

    if (!fs.existsSync(previewDir)) {
        fs.mkdirSync(previewDir, { recursive: true });
    }

    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.hbs'));
    const locales = parseLocales(process.env.PREVIEW_LOCALES);
    const defaultLocale = locales[0];
    const failures: { template: string; locale: Locale; message: string }[] = [];

    for (const file of files) {
        const name = path.basename(file, '.hbs');
        const templatePath = path.join(templatesDir, file);
        const content = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(content);
        const data = mockDataMap[name] || { ...commonData };

        for (const locale of locales) {
            const __meta = { ...mockLocaleService.getMeta(locale), logoUrl: '../assets/logo.png' };
            const __i18n = mockLocaleService.getTranslations(locale);
            const outputPath = path.join(previewDir, `${name}.${locale}.html`);

            try {
                const rendered = template({
                    ...data,
                    __meta,
                    __i18n
                });

                fs.writeFileSync(outputPath, rendered);
                console.log(`Generated: ${outputPath}`);

                // Backward compatibility for existing consumers expecting unsuffixed filenames.
                if (locale === defaultLocale) {
                    const legacyPath = path.join(previewDir, `${name}.html`);
                    fs.writeFileSync(legacyPath, rendered);
                }
            } catch (error: any) {
                failures.push({
                    template: name,
                    locale,
                    message: error?.message || String(error)
                });
                console.error(`Error generating ${name} (${locale}):`, error?.message || error);
            }
        }
    }

    if (failures.length > 0) {
        console.error(`\nPreview generation completed with ${failures.length} error(s).`);
        for (const failure of failures) {
            console.error(`- ${failure.template} (${failure.locale}): ${failure.message}`);
        }
        throw new Error('Preview generation failed for one or more templates.');
    }

    console.log(`\nPreview generation completed successfully for ${files.length} templates x ${locales.length} locales.`);
}

generate().catch(console.error);

import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { Locale } from '@shared/types';
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
        priceItems: [
            { description: 'Accommodation (7 nights)', amount: 14000 }
        ],
        vatAmount: 2520,
        totalAmount: 16520,
        currency: 'TRY',
        specialNote: 'Late check-in requested.',
        modifyUrl: 'https://calibretour.com/my-bookings/987654',
        timezone: 'GMT+3'
    },
    'flight-ticket': {
        ...commonData,
        customerName: 'Zeynep Kaya',
        flightNumber: 'TK1234',
        origin: 'IST',
        destination: 'JFK',
        departureDate: '2025-08-10',
        departureTime: '10:30',
        arrivalDate: '2025-08-10',
        arrivalTime: '14:30',
        seatNumber: '12A',
        gate: 'B12',
        pnrCode: 'PNR789',
        totalAmount: 12500,
        currency: 'TRY',
        isInternational: true,
        cabinClass: 'Economy'
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
                destinationCity: 'New York',
                destinationCode: 'JFK',
                departureDate: '2025-08-10',
                departureTime: '10:30',
                arrivalDate: '2025-08-10',
                arrivalTime: '14:30',
                duration: '11h 00m',
                cabinClass: 'Economy'
            }
        ],
        passengers: [
            { firstName: 'Zeynep', lastName: 'Kaya', ticketNumber: '023123456789' }
        ],
        totalAmount: 12500,
        currency: 'TRY'
    },
    'reservation-confirmation': {
        ...commonData,
        customerName: 'Can Öztürk',
        bookingId: 'B-12345',
        bookingDate: '2025-01-20',
        totalAmount: 5000,
        currency: 'TRY',
        items: [
            { name: 'Museum Pass', price: 1000 },
            { name: 'Guided City Tour', price: 4000 }
        ]
    },
    'package-reservation': {
        ...commonData,
        customerName: 'Selin Yıldız',
        packageId: 'PKG-777',
        packageName: 'Cappadocia Magic Package',
        bookingDate: '2025-05-01',
        hotelName: 'Cave Hotel Göreme',
        flightNumber: 'TK2000',
        totalAmount: 25000,
        currency: 'TRY',
        items: [
            { name: 'Accommodation', price: 15000 },
            { name: 'Flights', price: 5000 },
            { name: 'Balloon Tour', price: 5000 }
        ]
    },
    'transfer-reservation': {
        ...commonData,
        customerName: 'Emre Aydın',
        transferType: 'Airport Pick-up',
        pickupLocation: 'Antalya Airport (AYT)',
        dropoffLocation: 'Titanic Deluxe Lara',
        pickupDate: '2025-07-15',
        pickupTime: '15:30',
        vehicleType: 'VIP Minibus',
        passengerCount: 4,
        totalAmount: 850,
        currency: 'TRY'
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
    const locale = 'tr';
    const __meta = { ...mockLocaleService.getMeta(locale as Locale), logoUrl: '../logo.png' };
    const __i18n = mockLocaleService.getTranslations(locale as Locale);

    for (const file of files) {
        const name = path.basename(file, '.hbs');
        const templatePath = path.join(templatesDir, file);
        const outputPath = path.join(previewDir, `${name}.html`);

        const content = fs.readFileSync(templatePath, 'utf-8');
        const template = Handlebars.compile(content);

        const data = mockDataMap[name] || { ...commonData };
        try {
            const rendered = template({
                ...data,
                __meta,
                __i18n
            });

            fs.writeFileSync(outputPath, rendered);
            console.log(`Generated: ${outputPath}`);
        } catch (error: any) {
            console.error(`Error generating ${name}:`, error.message);
        }
    }
}

generate().catch(console.error);

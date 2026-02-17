import * as dotenv from 'dotenv';
import { MailService } from '../apps/api/src/services/mail.service';
import { TemplateService } from '../apps/api/src/services/template.service';
import { LocaleService } from '../apps/api/src/services/locale.service';
import { Locale, SUPPORTED_LOCALES, TEMPLATE_KEYS, TemplateKey } from '@shared/types';

dotenv.config();

const commonData = {
    currentYear: new Date().getFullYear(),
};

function parseLocales(raw?: string): Locale[] {
    if (!raw) {
        return ['en'];
    }

    const values = raw.split(',').map(v => v.trim()).filter(Boolean);
    const valid = values.filter((v): v is Locale => SUPPORTED_LOCALES.includes(v as Locale));

    if (valid.length === 0) {
        console.warn(`No valid locales found in SEND_LOCALES="${raw}", falling back to "en".`);
        return ['en'];
    }

    return Array.from(new Set(valid));
}

function parseTemplates(raw?: string): TemplateKey[] {
    if (!raw) {
        return [...TEMPLATE_KEYS];
    }

    const values = raw.split(',').map(v => v.trim()).filter(Boolean);
    const valid = values.filter((v): v is TemplateKey => TEMPLATE_KEYS.includes(v as TemplateKey));

    if (valid.length === 0) {
        console.warn(`No valid templates found in SEND_TEMPLATES="${raw}", falling back to all templates.`);
        return [...TEMPLATE_KEYS];
    }

    return Array.from(new Set(valid));
}

const mockDataMap: Record<string, any> = {
    'welcome': {
        ...commonData,
        customerName: 'Ahmet Yılmaz',
        loginUrl: 'https://calibretour.com/login',
        accountUrl: 'https://calibretour.com/my-account'
    },
    'password-reset': {
        ...commonData,
        customerName: 'Ahmet Yılmaz',
        resetUrl: 'https://calibretour.com/reset-password?token=123456',
        expiryHours: 24
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
            { count: 1, name: 'Standard Double Room' },
            { count: 1, name: 'Family Suite' }
        ],
        rooms: [
            {
                roomLabel: 'Room 1',
                roomTypeName: 'Standard Double Room',
                guestName: 'Mehmet Demir',
                mealPlan: 'All Inclusive',
                boardType: 'Full'
            },
            {
                roomLabel: 'Room 2',
                roomTypeName: 'Family Suite',
                guestName: 'Ayşe Demir',
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
            { description: 'Accommodation (7 nights)', amount: 14000 },
            { description: 'Family Suite Upgrade', amount: 5000 }
        ],
        nightCount: 7,
        accommodationFee: 19000,
        vatAmount: 3420,
        totalAmount: 22420,
        currency: 'TRY',
        paymentDate: new Date().toISOString(),
        cardBrand: 'Mastercard',
        cardLast4: '4242',
        cardHolder: 'Mehmet Demir',
        paymentStatus: 'Paid',
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
                nationality: 'Turkey',
                ticketNumber: 'TK-123456789'
            },
            {
                title: 'Mrs.',
                firstName: 'ZEYNEP',
                lastName: 'KAYA',
                birthDate: '15 Ocak 1995',
                nationality: 'Turkey',
                ticketNumber: 'TK-123456790'
            }
        ],
        ticketFee: 2889.6,
        vatAmount: 192,
        totalAmount: 3081.6,
        currency: 'USD',
        paymentDate: '26 Jul 2025',
        cardBrand: 'Mastercard',
        cardLast4: '3234',
        cardHolder: 'Guest Name',
        paymentStatus: 'Paid',
        ticketUrl: 'https://calibretour.com/tickets/RS0000000115',
        manageBookingUrl: '#'
    },
    'flight-details': {
        ...commonData,
        customerName: 'Zeynep Kaya',
        pnrCode: 'PNR789',
        departureCity: 'Istanbul',
        departureAirport: 'Istanbul Airport',
        arrivalCity: 'New York',
        arrivalAirport: 'John F. Kennedy International Airport',
        airlineName: 'Turkish Airlines',
        flightNo: 'TK1234',
        duration: '11h 00m',
        cabinClass: 'Economy',
        departureCode: 'IST',
        arrivalCode: 'JFK',
        passengers: [
            { firstName: 'Zeynep', lastName: 'Kaya', ticketNumber: '023123456789', type: 'Adult' },
            { firstName: 'Ahmet', lastName: 'Kaya', ticketNumber: '023123456790', type: 'Adult' }
        ],
        flights: [
            {
                departureTime: '10:30',
                departureDate: '2025-08-10',
                originCity: 'Istanbul',
                originCode: 'IST',
                originAirportName: 'Istanbul Airport',
                arrivalTime: '14:30',
                arrivalDate: '2025-08-10',
                destinationCity: 'New York',
                destinationCode: 'JFK',
                destinationAirportName: 'John F. Kennedy International Airport',
                airlineName: 'Turkish Airlines',
                flightNumber: 'TK1234',
                duration: '11h 00m',
                terminal: '1',
                luggageAllowance: '2x23kg',
                handBaggage: '8kg'
            },
            {
                departureTime: '20:30',
                departureDate: '2025-08-17',
                originCity: 'New York',
                originCode: 'JFK',
                originAirportName: 'John F. Kennedy International Airport',
                arrivalTime: '12:30',
                arrivalDate: '2025-08-18',
                destinationCity: 'Istanbul',
                destinationCode: 'IST',
                destinationAirportName: 'Istanbul Airport',
                airlineName: 'Turkish Airlines',
                flightNumber: 'TK1235',
                duration: '10h 00m',
                terminal: '4',
                luggageAllowance: '2x23kg',
                handBaggage: '8kg'
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
        reservationDate: '2025-01-20',
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
        status: 'Confirmed',
        passengerCount: 4,
        reservationDate: '12.07.2025',
        city: 'Rhodes',
        startDate: '02.08.2025',
        endDate: '09.08.2025',
        duration: '7 Days',
        destination: 'Rhodes',
        totalAmount: 6000,
        currency: 'USD',
        paymentDate: '26 Jul 2025',
        paymentStatus: 'Paid',
        cardBrand: 'Mastercard',
        cardLast4: '3234',
        cardHolder: 'Guest Name',
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
            code: '250802TLVRH002007',
            rating: '5 Star'
        },
        transfers: [
            {
                direction: 'Departure',
                route: 'RHO -> MRM',
                vehicleType: 'SIC & FERRY',
                duration: '60 dk',
                pickupDate: '2025-08-02',
                pickupTime: '12:30',
                pickupLocation: 'Rhodes Port',
                dropoffLocation: 'Marmaris Port',
                passengerCount: 4
            },
            {
                direction: 'Return',
                route: 'MRM -> RHO',
                vehicleType: 'SIC & FERRY',
                duration: '60 dk',
                pickupDate: '2025-08-09',
                pickupTime: '13:30',
                pickupLocation: 'Marmaris Port',
                dropoffLocation: 'Rhodes Port',
                passengerCount: 4
            }
        ],
        rooms: [
            {
                label: 'Room 1',
                type: 'STANDARD DOUBLE ROOM',
                boardType: 'ALL INCLUSIVE',
                accommodation: '2 Adults',
                guests: [
                    { name: 'ADAM ABED', gender: 'Male', birthDate: '18.06.2007', nationality: 'Israel', passport: '36221407', expire: '01.01.2027' },
                    { name: 'TAREQ ABED', gender: 'Male', birthDate: '20.05.1979', nationality: 'Israel', passport: '35523210', expire: '01.01.2027' }
                ],
                contact: 'sisilia@4seasons.co.il | 972522976719'
            },
            {
                label: 'Room 2',
                type: 'FAMILY SUITE',
                boardType: 'ALL INCLUSIVE',
                accommodation: '2 Adults',
                guests: [
                    { name: 'SARA ABED', gender: 'Female', birthDate: '10.05.1985', nationality: 'Israel', passport: '36221408', expire: '01.01.2027' },
                    { name: 'LAYLA ABED', type: 'Child', gender: 'Female', birthDate: '15.08.2010', nationality: 'Israel', passport: '35523211', expire: '01.01.2027' }
                ],
                contact: 'sisilia@4seasons.co.il | 972522976719'
            }
        ],
        priceItems: [
            { label: 'Package Fee', amount: 5600 },
            { label: 'Taxes', amount: 400 }
        ],
        vatAmount: 400,
        confirmationCode: 'CONF-PACK-001'
    },
    'transfer-reservation': {
        ...commonData,
        customerName: 'DENIZ KEMAHLIOGLU',
        transferType: 'Airport Pick-up',
        pickupLocation: 'Antalya Airport (AYT)',
        dropoffLocation: 'Antalya Resort & Spa',
        vehicleType: 'VIP Minibus',
        duration: '45 min',
        passengerCount: 3,
        date: '2025-07-26',
        time: '14:30',
        meetingPoint: 'Airport Exit Gate',
        transfers: [
            {
                direction: 'Departure',
                pickupLocation: 'Antalya Airport (AYT)',
                dropoffLocation: 'Antalya Resort & Spa',
                vehicleType: 'VIP Minibus',
                duration: '45 min',
                pickupDate: '2025-07-26',
                pickupTime: '14:30',
                meetingPoint: 'Airport Exit Gate',
                passengerCount: 3
            },
            {
                direction: 'Return',
                pickupLocation: 'Antalya Resort & Spa',
                dropoffLocation: 'Antalya Airport (AYT)',
                vehicleType: 'VIP Minibus',
                duration: '40 min',
                pickupDate: '2025-08-02',
                pickupTime: '10:00',
                meetingPoint: 'Hotel Lobby',
                passengerCount: 3
            }
        ],
        flightNumber: 'TK1234',
        passengers: [
            { name: 'DENIZ', surname: 'KEMAHLIOGLU', birthDate: '22.12.1999', nationality: 'Turkey' },
            { name: 'ZEYNEP', surname: 'KAYA', birthDate: '15.01.1995', nationality: 'Turkey' },
            { name: 'AHMET', surname: 'YILMAZ', birthDate: '01.01.1990', nationality: 'Turkey' }
        ],
        priceItems: [
            { label: 'Base Price', amount: 50.00 },
            { label: 'VAT (18%)', amount: 9.00 },
            { label: 'Service Fee', amount: 5.00 }
        ],
        totalAmount: 64.00,
        currency: 'EUR',
        paymentDate: '26 Jul 2025',
        paymentStatus: 'Paid',
        cardBrand: 'Visa',
        cardLast4: '1234',
        cardHolder: 'Deniz Kemahlioglu',
        notes: 'Driver will wait at the exit gate with a name sign.'
    }
};

async function sendAllTemplates() {
    const localeService = new LocaleService();
    const mailService = new MailService();
    const templateService = new TemplateService(localeService);

    const targetEmail = process.env.TEST_TARGET_EMAIL || 'ken760@gmail.com';
    const forceLive = process.env.SEND_LIVE === '1' || process.env.SEND_LIVE === 'true';
    const requestedDryRun = process.env.SEND_DRY_RUN === '1' || process.env.SEND_DRY_RUN === 'true';
    const dryRun = !forceLive || requestedDryRun;
    const templates = parseTemplates(process.env.SEND_TEMPLATES);
    const locales = parseLocales(process.env.SEND_LOCALES);
    const tasks = locales.flatMap(locale => templates.map(template => ({ template, locale })));

    console.log(`Starting to process ${tasks.length} template task(s). target=${targetEmail} dryRun=${dryRun}`);
    if (!forceLive) {
        console.log('Safe mode: real SMTP send is disabled by default. Set SEND_LIVE=1 for live sending.');
    }
    let successCount = 0;
    let failCount = 0;

    for (const task of tasks) {
        const { template, locale } = task;
        const data = mockDataMap[template];

        if (!templateService.hasTemplate(template)) {
            console.error(`Template file not found for key: ${template}`);
            failCount++;
            continue;
        }

        if (!data) {
            console.error(`Mock data not found for template: ${template}`);
            failCount++;
            continue;
        }

        console.log(`Processing ${template} in ${locale}...`);

        try {
            const html = await templateService.render(template, locale, data);
            if (dryRun) {
                console.log(`🧪 Dry run: rendered ${template} (${locale}), htmlLength=${html.length}`);
            } else {
                await mailService.send({
                    to: [targetEmail],
                    subject: `[TEST] ${template} - ${locale.toUpperCase()} - Full Data`,
                    html,
                });
                console.log(`✅ Sent ${template} (${locale})`);
            }
            successCount++;
        } catch (error: any) {
            console.error(`❌ Failed to send ${template} (${locale}):`, error.message);
            failCount++;
        }
    }

    console.log(`All sending tasks completed. Success: ${successCount}, Failed: ${failCount}`);

    if (failCount > 0) {
        throw new Error(`Sending completed with ${failCount} failure(s).`);
    }
}

sendAllTemplates().catch(console.error);

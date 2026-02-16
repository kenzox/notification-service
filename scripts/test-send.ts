import * as dotenv from 'dotenv';
import { MailService } from '../apps/api/src/services/mail.service';
import { TemplateService } from '../apps/api/src/services/template.service';
import { LocaleService } from '../apps/api/src/services/locale.service';

dotenv.config();

async function sendTest() {
    const localeService = new LocaleService();
    const mailService = new MailService();
    const templateService = new TemplateService(localeService);

    const targetEmail = 'ken760@gmail.com';
    const templates = ['flight-ticket', 'hotel-reservation'];

    const mockDataMap: Record<string, any> = {
        'hotel-reservation': {
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
            paymentDate: new Date().toISOString(),
            paymentStatus: 'ÖDENDİ',
            cardBrand: 'Mastercard',
            cardLast4: '4242',
            cardHolder: 'Mehmet Demir',
            specialNote: 'Late check-in requested.',
            modifyUrl: 'https://calibretour.com/my-bookings/987654',
            timezone: 'CEST',
            safeLinkUrl: 'https://calibretour.com/security',
        },
        'flight-ticket': {
            customerName: 'Zeynep Kaya',
            pnrCode: 'PNR789',
            issueDate: new Date().toISOString(),
            modificationDate: new Date().toISOString(),
            createdBy: 'Admin',
            flights: [
                {
                    type: 'Gidiş',
                    date: '2025-08-10',
                    flightCode: 'TK1234',
                    airlineName: 'Turkish Airlines',
                    originCity: 'İstanbul',
                    destinationCity: 'New York',
                    originCode: 'IST',
                    destinationCode: 'JFK',
                    departureTime: '10:30',
                    arrivalTime: '14:30',
                    duration: '11s 00dk',
                    terminal: 'Int.',
                    baggageAllowance: '30kg',
                    handBaggage: '8kg',
                    seatClass: 'Ekonomi'
                },
                {
                    type: 'Dönüş',
                    date: '2025-08-20',
                    flightCode: 'TK1235',
                    airlineName: 'Turkish Airlines',
                    originCity: 'New York',
                    destinationCity: 'İstanbul',
                    originCode: 'JFK',
                    destinationCode: 'IST',
                    departureTime: '18:00',
                    arrivalTime: '10:00',
                    duration: '10s 00dk',
                    terminal: '4',
                    baggageAllowance: '30kg',
                    handBaggage: '8kg',
                    seatClass: 'Ekonomi'
                }
            ],
            passengers: [
                {
                    title: 'Bayan',
                    firstName: 'Zeynep',
                    lastName: 'Kaya',
                    birthDate: '1990-05-15',
                    nationality: 'TR'
                }
            ],
            ticketFee: 11000,
            vatAmount: 1200,
            serviceFee: 300,
            totalAmount: 12500,
            currency: 'TRY',
            paymentDate: new Date().toISOString(),
            paymentStatus: 'ÖDENDİ',
            cardBrand: 'Mastercard',
            cardLast4: '4242',
            cardHolder: 'Zeynep Kaya',
            ticketUrl: 'https://calibretour.com/tickets/PNR789'
        },
    };

    for (const key of templates) {
        console.log(`Sending ${key} to ${targetEmail}...`);
        const html = await templateService.render(key, 'tr', mockDataMap[key]);
        await mailService.send({
            to: [targetEmail],
            subject: `Test - ${key} - All Fields Filled`,
            html,
        });
        console.log(`Sent ${key}`);
    }
}

sendTest().catch(console.error);

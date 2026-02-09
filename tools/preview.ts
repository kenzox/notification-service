import * as fs from 'fs';
import * as path from 'path';
import { TemplateService } from '../apps/api/src/services/template.service';
import { LocaleService } from '../apps/api/src/services/locale.service';

async function generatePreview() {
    const localeService = new LocaleService();
    const templateService = new TemplateService(localeService);

    // Data matching the image
    const data = {
        customerName: 'Person 1',
        hotelCity: 'Malaga',
        hotelName: 'Hotel Malaga Centro',
        confirmationNumber: '908-294-365-19',
        pinCode: '8692',
        checkInDate: '2025-07-15',
        checkInTime: '14:00',
        checkOutDate: '2025-07-17',
        checkOutTime: '12:00',
        reservationSummary: [
            { count: 1, name: 'Deluxe Double Room' },
            { count: 1, name: 'Double Room' }
        ],
        rooms: [
            {
                guestName: 'Person 1',
                roomLabel: 'Room 1',
                roomTypeName: 'Deluxe Double Room with Balcony',
                mealPlan: 'Breakfast included',
                boardType: 'Full Board'
            },
            {
                guestName: 'Person 2',
                roomLabel: 'Room 2',
                roomTypeName: 'Double Room',
                mealPlan: 'No meals included',
                boardType: 'Room Only'
            }
        ],
        hotelLocation: 'Calle Beatas Numero 20, 4º D, Malaga Centro, 29008 Málaga, Spain',
        hotelPhone: '+347447191162',
        hotelEmail: 'property@example.com',
        freeCancellationDate: '2025-07-07 23:59',
        timezone: 'CEST',
        cancellationPolicy: 'You may cancel free of charge until 7 days before arrival. You will be charged the total price of the reservation if you cancel in the 7 days before arrival. If you don\'t show up, the no-show fee will be the same as the cancellation fee.',
        cancellationDetails: [
            'until 07 Jul 2025 23:59: $ 0',
            'from 08 Jul 2025 00:00: $ 1514.08'
        ],
        priceItems: [
            { description: '1 Deluxe Double Room with Balcony', amount: 722.4 },
            { description: '1 Double Room', amount: 722.4 },
            { description: 'VAT', amount: 69.28 }
        ],
        vatAmount: 69.28,
        totalAmount: 1514.08,
        currency: 'USD',
        paymentDate: '2025-07-06',
        cardLastFour: '3234',
        paymentStatus: 'scheduled',
        specialNote: 'Lorem Ipsum...',
        modifyUrl: '#',
        currentYear: new Date().getFullYear()
    };

    console.log('Starting template rendering...');
    const html = await templateService.render('hotel-reservation', 'en', data);
    console.log('Template rendered successfully.');

    const outputPath = path.resolve(process.cwd(), 'preview.html');
    fs.writeFileSync(outputPath, html);
    console.log(`Preview generated: ${outputPath}`);
}

generatePreview().catch(console.error);

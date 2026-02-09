import * as fs from 'fs';
import * as path from 'path';
import { TemplateService } from '../apps/api/src/services/template.service';
import { LocaleService } from '../apps/api/src/services/locale.service';

async function generateFlightPreview() {
    const localeService = new LocaleService();
    const templateService = new TemplateService(localeService);

    const mockData = {
        title: 'Flight Confirmation',
        confirmationNumber: '822-194-275-01',
        pinCode: '4312',
        currentYear: new Date().getFullYear(),
        departureCity: 'Paris',
        arrivalCity: 'Istanbul',
        departureAirportCode: 'ORY',
        departureAirportName: 'Orly Airport',
        arrivalAirportCode: 'SAW',
        arrivalAirportName: 'Sabiha Gokcen Airport',
        departureTime: '11:50am',
        arrivalTime: '05:20pm',
        airlineName: 'Pegasus Airlines',
        airlineIconUrl: 'https://seeklogo.com/images/P/pegasus-airlines-logo-D1E1E1E1E1-seeklogo.com.png',
        flightNo: 'PC1134',
        cabinClass: 'Economy',
        duration: '3h 30m',
        stopInfo: 'Non-stop',
        nonRefundableDate: new Date('2025-02-07'),
        protectionAmount: '$28.00',
        tripAmount: '$312.21',
        streetAddress: '123 Main St, London',
        cardNumberMasked: '**** **** **** 1234',
        cardExpiry: '12/2026',
        cardCvvMasked: '***',
        billingStreetAddress: '123 Main St, London',
        billingCountry: 'United Kingdom',
        billingZipCode: 'SW1A 1AA',
        billingCity: 'London',
        billingEmail: 'customer@example.com',
        billingCountryCode: '+44',
        billingMobileNumber: '7911 123456',
        bookAndPayUrl: 'https://example.com/pay',
        payLaterUrl: 'https://example.com/later',
        payWithCommissionUrl: 'https://example.com/commission',
        specialNoteTitle: 'Special Note For Delay',
        specialNoteText: 'Please notify if late',
        selectedDate: '07/15/2025'
    };

    console.log('Starting template rendering...');
    const html = await templateService.render('flight-details', 'en', mockData);
    console.log('Template rendered successfully.');

    const outputPath = path.resolve(process.cwd(), 'preview-flight.html');
    console.log(`Attempting to write file to: ${outputPath}`);
    fs.writeFileSync(outputPath, html);
    console.log(`Preview generated successfully at: ${outputPath}`);
}

generateFlightPreview().catch(console.error);


import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugSend() {
    console.log('--- Email Debug Script ---');
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
    console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
    console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
    console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE}`);
    console.log(`SMTP_FROM: ${process.env.SMTP_FROM}`);
    console.log('--------------------------');

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: true, // Enable debug output
        logger: true  // Log to console
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection verified!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: 'ke760@gmail.com',
            subject: 'Debug Email Test',
            html: '<p>This is a debug email to verify delivery.</p>'
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

debugSend();

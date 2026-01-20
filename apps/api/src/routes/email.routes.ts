import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { EmailController } from '../controllers/email.controller';

const emailRouter = Router();
const emailController = new EmailController();

// All email routes require authentication
emailRouter.use(authMiddleware);

// Email endpoints
emailRouter.post('/reservation-confirmation', emailController.sendReservationConfirmation);
emailRouter.post('/flight-ticket', emailController.sendFlightTicket);
emailRouter.post('/hotel-reservation', emailController.sendHotelReservation);
emailRouter.post('/package-reservation', emailController.sendPackageReservation);
emailRouter.post('/transfer-reservation', emailController.sendTransferReservation);
emailRouter.post('/welcome', emailController.sendWelcome);
emailRouter.post('/password-reset', emailController.sendPasswordReset);

export { emailRouter };

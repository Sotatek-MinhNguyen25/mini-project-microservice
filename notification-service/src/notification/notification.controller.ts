// import { Controller, Post, Body } from '@nestjs/common';
// import { NotificationService } from './notification.service';

// @Controller('notifications')
// export class NotificationController {
//   constructor(private readonly notificationService: NotificationService) {}

//   @Post('welcome')
//   async sendWelcome(@Body() body: { email: string; username: string }) {
//     await this.notificationService.sendWelcomeEmail(body.email, body.username);
//     return { message: 'Welcome email sent' };
//   }

//   @Post('password-reset')
//   async sendPasswordReset(@Body() body: { email: string; resetToken: string }) {
//     await this.notificationService.sendPasswordResetEmail(body.email, body.resetToken);
//     return { message: 'Password reset email sent' };
//   }
// }

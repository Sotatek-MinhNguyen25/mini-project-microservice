import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAILTRAP_HOST,
  port: parseInt(process.env.MAILTRAP_PORT ?? '2525', 10),
  secure: process.env.MAILTRAP_SECURE === 'true',
  user: process.env.MAILTRAP_USER,
  pass: process.env.MAILTRAP_PASS,
  from: process.env.MAILTRAP_FROM,
}));

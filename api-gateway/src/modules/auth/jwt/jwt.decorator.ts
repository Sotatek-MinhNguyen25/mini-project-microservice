import { SetMetadata } from '@nestjs/common';
import { JWT_CONSTANTS } from '../../../constants/app.constants';

export const IS_PUBLIC_KEY = JWT_CONSTANTS.IS_PUBLIC_KEY;
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

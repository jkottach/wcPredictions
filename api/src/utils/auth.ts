import jwt from 'jsonwebtoken';
import { getJwtExpiresIn, getJwtSecret } from '../config/jwtSecret';

export const generateToken = (userId: string, email: string, role: string = 'user'): string => {
  return jwt.sign({ userId, email, role }, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  } as jwt.SignOptions);
};

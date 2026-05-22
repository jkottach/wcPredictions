import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateToken = (userId: string, email: string, role: string = 'user'): string => {
  return jwt.sign({ userId, email, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

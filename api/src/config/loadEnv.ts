import path from 'path';
import dotenv from 'dotenv';

/** Load `.env` from the api package root before other modules read `process.env`. */
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

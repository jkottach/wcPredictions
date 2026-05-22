import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import type { MatchDocument, TeamDocument, UserDocument } from '../db/types';

const USERS_COLLECTION = 'users';
const TEAMS_COLLECTION = 'teams';
const MATCHES_COLLECTION = 'matches';

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (database) return database;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || 'velicham_fifa26';

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);

  await ensureIndexes(database);
  console.log(`✓ MongoDB connected (${dbName})`);
  return database;
}

async function ensureIndexes(db: Db): Promise<void> {
  const users = db.collection<UserDocument>(USERS_COLLECTION);
  const teams = db.collection<TeamDocument>(TEAMS_COLLECTION);
  const matches = db.collection<MatchDocument>(MATCHES_COLLECTION);

  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ totalPoints: -1 });
  await users.createIndex({ 'predictions.matchId': 1 });

  await teams.createIndex({ teamId: 1 }, { unique: true });

  await matches.createIndex({ matchTime: 1 });
  await matches.createIndex({ status: 1 });
  await matches.createIndex({ sequence: 1 });
}

export function getDb(): Db {
  if (!database) {
    throw new Error('MongoDB not connected. Call connectMongo() first.');
  }
  return database;
}

export function getUsersCollection(): Collection<UserDocument> {
  return getDb().collection<UserDocument>(USERS_COLLECTION);
}

export function getTeamsCollection(): Collection<TeamDocument> {
  return getDb().collection<TeamDocument>(TEAMS_COLLECTION);
}

export function getMatchesCollection(): Collection<MatchDocument> {
  return getDb().collection<MatchDocument>(MATCHES_COLLECTION);
}

export async function disconnectMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}

export function toObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

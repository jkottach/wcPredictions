/**
 * One-time migration: move user docs from legacy `app` collection into `users`.
 * Teams in `app` with docType team are moved to `teams` collection.
 *
 * Run: npx tsx scripts/migrateAppToUsers.ts
 */
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { connectMongo, disconnectMongo, getTeamsCollection, getUsersCollection } from '../src/lib/mongodb';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || 'velicham_fifa26';

  await connectMongo();
  const client = new MongoClient(uri);
  await client.connect();
  const legacy = client.db(dbName).collection('app');

  const legacyDocs = await legacy.find({}).toArray();
  let usersMoved = 0;
  let teamsMoved = 0;

  for (const doc of legacyDocs) {
    if (doc.docType === 'user') {
      const { docType: _dt, ...userFields } = doc;
      const existing = await getUsersCollection().findOne({ email: userFields.email });
      if (!existing) {
        await getUsersCollection().insertOne(userFields as never);
        usersMoved++;
      }
    } else if (doc.docType === 'team') {
      const { docType: _dt, ...teamFields } = doc;
      const existing = await getTeamsCollection().findOne({ teamId: teamFields.teamId });
      if (!existing) {
        await getTeamsCollection().insertOne(teamFields as never);
        teamsMoved++;
      }
    }
  }

  console.log(`Migrated ${usersMoved} users → "users", ${teamsMoved} teams → "teams"`);
  console.log('Legacy "app" collection was not deleted — remove manually after verifying.');
  await client.close();
  await disconnectMongo();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

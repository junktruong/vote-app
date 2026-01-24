import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

declare global {
  var __mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
  var __mongooseIndexesEnsured: boolean | undefined;
}

global.__mongooseConn ||= { conn: null, promise: null };
global.__mongooseIndexesEnsured ||= false;

async function ensureIndexes(conn: typeof mongoose) {
  if (global.__mongooseIndexesEnsured) return;
  global.__mongooseIndexesEnsured = true;

  const connection = conn.connection;
  if (!connection.db) {
    await connection.asPromise();
  }
  const db = connection.db;
  if (!db) {
    global.__mongooseIndexesEnsured = false;
    throw new Error("Database connection not ready for index creation");
  }

  // Fix legacy non-partial unique index that blocks inserts when username is null/missing.
  const users = db.collection("users");
  const indexes = await users.indexes();
  const usernameIdx = indexes.find((idx) => idx.name === "username_1");
  const isPartialUsernameIdx = Boolean(usernameIdx?.partialFilterExpression);
  if (usernameIdx && !isPartialUsernameIdx) {
    await users.dropIndex("username_1");
  }

  await users.createIndex(
    { username: 1 },
    { name: "username_1", unique: true, partialFilterExpression: { username: { $type: "string" } } }
  );
  await users.createIndex({ deviceId: 1 }, { name: "deviceId_1", unique: true });

  // Ensure the vote uniqueness constraint is present even when autoIndex is disabled.
  const votes = db.collection("votes");
  await votes.createIndex(
    { pollId: 1, voterUserId: 1, candidateUserId: 1 },
    { name: "pollId_1_voterUserId_1_candidateUserId_1", unique: true }
  );
}

export async function dbConnect() {
  if (global.__mongooseConn.conn) return global.__mongooseConn.conn;

  if (!global.__mongooseConn.promise) {
    global.__mongooseConn.promise = mongoose.connect(MONGODB_URI, {
      dbName: "voteapp",
      autoIndex: false,
    });
  }
  global.__mongooseConn.conn = await global.__mongooseConn.promise;
  await ensureIndexes(global.__mongooseConn.conn);
  return global.__mongooseConn.conn;
}

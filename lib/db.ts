import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

global.__mongooseConn ||= { conn: null, promise: null };

export async function dbConnect() {
  if (global.__mongooseConn.conn) return global.__mongooseConn.conn;

  if (!global.__mongooseConn.promise) {
    global.__mongooseConn.promise = mongoose.connect(MONGODB_URI, {
      dbName: "voteapp",
    });
  }
  global.__mongooseConn.conn = await global.__mongooseConn.promise;
  return global.__mongooseConn.conn;
}

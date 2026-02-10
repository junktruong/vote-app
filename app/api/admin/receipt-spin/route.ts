import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

const MIN_NUMBER = 1;
const MAX_NUMBER = 996;

function pickRandom(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeReceiptNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number.NaN;
  if (!Number.isInteger(n) || n < MIN_NUMBER || n > MAX_NUMBER) return null;
  return n;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const payload = await req.json().catch(() => ({}));
  const pollId = String(payload?.pollId || "").trim();

  const poll =
    (pollId && (await Poll.findById(pollId))) ||
    (await Poll.findOne({ showOnResults: true }).sort({ createdAt: -1 })) ||
    (await Poll.findOne({ isActive: true }).sort({ createdAt: -1 })) ||
    (await Poll.findOne({}).sort({ createdAt: -1 }));

  if (!poll) return NextResponse.json({ error: "Chưa có poll." }, { status: 400 });

  const existingReceiptNumber = normalizeReceiptNumber(poll.receiptSpinNumber);
  if (poll.receiptSpinState === "REVEALED" && existingReceiptNumber === null) {
    poll.receiptSpinState = "IDLE";
    poll.receiptSpinRevealedAt = null;
  }

  if (poll.receiptSpinState === "REVEALED" || existingReceiptNumber !== null) {
    return NextResponse.json({ error: "Đã quay số chứng từ cho poll này." }, { status: 400 });
  }

  await Poll.updateMany({ showOnResults: true }, { $set: { showOnResults: false } });
  poll.showOnResults = true;
  poll.viewMode = "RECEIPT_SPIN";

  const number = pickRandom(MIN_NUMBER, MAX_NUMBER);

  poll.receiptSpinState = "REVEALED";
  poll.receiptSpinNumber = number;
  poll.receiptSpinRevealedAt = new Date();

  await poll.save();

  return NextResponse.json({ ok: true, receiptSpinNumber: number });
}

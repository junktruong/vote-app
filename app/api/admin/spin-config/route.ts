import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

const TOTAL_NUMBERS = 90;

function parseNumbers(input: string) {
  if (!input) return [];
  const raw = input.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  const nums = raw.map((v) => Number(v)).filter((n) => Number.isFinite(n));
  return Array.from(new Set(nums)).filter((n) => n >= 1 && n <= TOTAL_NUMBERS);
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

  const special = parseNumbers(String(payload?.special || ""));
  const first = parseNumbers(String(payload?.first || ""));
  const second = parseNumbers(String(payload?.second || ""));

  if (special.length !== 1) {
    return NextResponse.json({ error: "Giải đặc biệt phải đúng 1 số." }, { status: 400 });
  }
  if (first.length !== 1) {
    return NextResponse.json({ error: "Giải nhất phải đúng 1 số." }, { status: 400 });
  }
  if (second.length !== 2) {
    return NextResponse.json({ error: "Giải nhì phải đúng 2 số." }, { status: 400 });
  }

  const configured = [special[0], first[0], ...second];
  if (new Set(configured).size !== configured.length) {
    return NextResponse.json({ error: "Số cấu hình đặc biệt/nhất/nhì không được trùng nhau." }, { status: 400 });
  }

  poll.spinConfigSpecial = special[0];
  poll.spinConfigFirst = first[0];
  poll.spinConfigSecond = second;
  poll.spinConfigThird = [];
  poll.spinSecondIndex = 0;
  poll.spinThirdIndex = 0;
  poll.spinEncourageCount = 0;
  poll.spinThirdLimit = 3;
  poll.spinEncourageLimit = 5;
  poll.spinDrawnNumbers = [];
  poll.spinHistory = [];
  poll.spinLatestNumber = null;
  poll.spinLatestPrize = null;
  poll.spinState = "IDLE";
  poll.spinRevealedAt = null;
  await poll.save();

  return NextResponse.json({ ok: true });
}

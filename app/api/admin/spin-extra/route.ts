import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

const BASE_THIRD_LIMIT = 3;
const BASE_ENCOURAGE_LIMIT = 5;
const FIXED_LUCKY_PRIZE_COUNT = 4; // 1 đặc biệt + 1 nhất + 2 nhì

function normalizeLimit(value: unknown, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const payload = await req.json().catch(() => ({}));
  const pollId = String(payload?.pollId || "").trim();
  const prize = String(payload?.prize || "").trim();
  const poll =
    (pollId && (await Poll.findById(pollId))) ||
    (await Poll.findOne({ showOnResults: true }).sort({ createdAt: -1 })) ||
    (await Poll.findOne({ isActive: true }).sort({ createdAt: -1 })) ||
    (await Poll.findOne({}).sort({ createdAt: -1 }));

  if (!poll) return NextResponse.json({ error: "Chưa có poll." }, { status: 400 });

  const currentThirdLimit = normalizeLimit(poll.spinThirdLimit, BASE_THIRD_LIMIT);
  const currentEncourageLimit = normalizeLimit(poll.spinEncourageLimit, BASE_ENCOURAGE_LIMIT);

  if (prize === "third") {
    poll.spinThirdLimit = currentThirdLimit + 1;
  } else if (prize === "encourage") {
    poll.spinEncourageLimit = currentEncourageLimit + 1;
  } else {
    return NextResponse.json({ error: "Loại giải cộng thêm không hợp lệ." }, { status: 400 });
  }

  await poll.save();

  const thirdLimit = normalizeLimit(poll.spinThirdLimit, BASE_THIRD_LIMIT);
  const encourageLimit = normalizeLimit(poll.spinEncourageLimit, BASE_ENCOURAGE_LIMIT);

  return NextResponse.json({
    ok: true,
    spinThirdLimit: thirdLimit,
    spinEncourageLimit: encourageLimit,
    spinTotalPrizeCount: FIXED_LUCKY_PRIZE_COUNT + thirdLimit + encourageLimit,
  });
}

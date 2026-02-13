import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import { isAdmin } from "@/lib/auth";

const TOTAL_NUMBERS = 90;

function pickRandom(available: number[]) {
  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
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

  await Poll.updateMany({ showOnResults: true }, { $set: { showOnResults: false } });
  poll.showOnResults = true;

  const drawn = new Set<number>(poll.spinDrawnNumbers || []);
  const configSpecial = poll.spinConfigSpecial ?? null;
  const configFirst = poll.spinConfigFirst ?? null;
  const configSecond = Array.isArray(poll.spinConfigSecond) ? poll.spinConfigSecond : [];
  const encourageLimit = Number.isFinite(Number(poll.spinEncourageLimit))
    ? Math.max(0, Number(poll.spinEncourageLimit))
    : 5;
  const thirdLimit = Number.isFinite(Number(poll.spinThirdLimit))
    ? Math.max(0, Number(poll.spinThirdLimit))
    : 3;
  const reservedConfigured = new Set<number>(
    [configSpecial, configFirst, ...configSecond].filter((value): value is number => {
      return Number.isInteger(value) && value >= 1 && value <= TOTAL_NUMBERS;
    })
  );

  const getAvailableRandomNumbers = () => {
    const available: number[] = [];
    for (let i = 1; i <= TOTAL_NUMBERS; i += 1) {
      if (!drawn.has(i) && !reservedConfigured.has(i)) available.push(i);
    }
    return available;
  };

  let number: number | null = null;
  let prizeLabel = "";

  if (prize === "encourage") {
    if ((poll.spinEncourageCount || 0) >= encourageLimit) {
      return NextResponse.json({ error: `Đã đủ ${encourageLimit} giải khuyến khích.` }, { status: 400 });
    }
    const available = getAvailableRandomNumbers();
    if (available.length === 0) return NextResponse.json({ error: "Hết số khả dụng." }, { status: 400 });
    number = pickRandom(available);
    poll.spinEncourageCount = (poll.spinEncourageCount || 0) + 1;
    prizeLabel = "Khuyến khích";
  } else if (prize === "third") {
    const thirdCount = poll.spinThirdIndex || 0;
    if (thirdCount >= thirdLimit) return NextResponse.json({ error: `Đã đủ ${thirdLimit} giải ba.` }, { status: 400 });
    const available = getAvailableRandomNumbers();
    if (available.length === 0) return NextResponse.json({ error: "Hết số khả dụng." }, { status: 400 });
    number = pickRandom(available);
    poll.spinThirdIndex = thirdCount + 1;
    prizeLabel = "Giải ba";
  } else if (prize === "second") {
    const idx = poll.spinSecondIndex || 0;
    if (idx >= configSecond.length) return NextResponse.json({ error: "Đã đủ giải nhì." }, { status: 400 });
    number = Number(configSecond[idx]);
    poll.spinSecondIndex = idx + 1;
    prizeLabel = "Giải nhì";
  } else if (prize === "first") {
    if (!Number.isFinite(Number(configFirst))) return NextResponse.json({ error: "Chưa cấu hình giải nhất." }, { status: 400 });
    number = Number(configFirst);
    prizeLabel = "Giải nhất";
  } else if (prize === "special") {
    if (!Number.isFinite(Number(configSpecial))) return NextResponse.json({ error: "Chưa cấu hình giải đặc biệt." }, { status: 400 });
    number = Number(configSpecial);
    prizeLabel = "Đặc biệt";
  } else {
    return NextResponse.json({ error: "Giải không hợp lệ." }, { status: 400 });
  }

  if (!number || number < 1 || number > TOTAL_NUMBERS) {
    return NextResponse.json({ error: "Số không hợp lệ." }, { status: 400 });
  }
  if (drawn.has(number)) {
    return NextResponse.json({ error: "Số đã được quay." }, { status: 400 });
  }

  drawn.add(number);
  poll.spinDrawnNumbers = Array.from(drawn);
  poll.spinState = "REVEALED";
  poll.spinLatestNumber = number;
  poll.spinLatestPrize = prizeLabel;
  poll.spinWinnerName = `Số ${String(number).padStart(2, "0")}`;
  poll.spinRevealedAt = new Date();
  poll.spinHistory = [
    { prize: prizeLabel, number, time: new Date() },
    ...(poll.spinHistory || []),
  ];

  await poll.save();

  return NextResponse.json({
    ok: true,
    spinLatestNumber: poll.spinLatestNumber,
    spinLatestPrize: poll.spinLatestPrize,
  });
}

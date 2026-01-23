import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Poll from "@/models/Poll";
import Vote from "@/models/Vote";
import { isAdmin } from "@/lib/auth";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const pollId = params.id;
  const { title, maxVotes, showOnResults, isActive, revealWinner } = await req.json();

  if (showOnResults === true) {
    await Poll.updateMany({ showOnResults: true }, { $set: { showOnResults: false } });
  }
  if (isActive === true) {
    await Poll.updateMany({ isActive: true }, { $set: { isActive: false, endedAt: new Date() } });
  }

  const update: Record<string, any> = {};
  if (typeof title === "string" && title.trim()) update.title = title.trim();
  if (Number.isFinite(Number(maxVotes))) update.maxVotes = Math.max(1, Number(maxVotes));
  if (typeof showOnResults === "boolean") update.showOnResults = showOnResults;
  if (typeof isActive === "boolean") {
    update.isActive = isActive;
    update.endedAt = isActive ? null : new Date();
  }
  if (typeof revealWinner === "boolean") update.revealWinner = revealWinner;

  const poll = await Poll.findByIdAndUpdate(pollId, update, { new: true });
  if (!poll) return NextResponse.json({ error: "Không tìm thấy poll." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    poll: {
      id: String(poll._id),
      title: poll.title,
      isActive: poll.isActive,
      revealWinner: poll.revealWinner,
      showOnResults: poll.showOnResults,
      maxVotes: poll.maxVotes ?? 3,
    },
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Chưa đăng nhập admin." }, { status: 401 });
  await dbConnect();

  const pollId = params.id;
  await Vote.deleteMany({ pollId });
  const poll = await Poll.findByIdAndDelete(pollId);
  if (!poll) return NextResponse.json({ error: "Không tìm thấy poll." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

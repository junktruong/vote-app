import { NextResponse } from "next/server";

import { closePoll, createPoll, getPoll } from "@/lib/polls";

type CreatePayload = {
  title: string;
  description: string;
  candidates: string[];
  adminPassword?: string;
};

type ClosePayload = {
  reveal?: boolean;
  adminPassword?: string;
};

const requireAdmin = (adminPassword?: string) => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing ADMIN_PASSWORD environment variable." },
        { status: 500 },
      ),
    };
  }

  if (!adminPassword || adminPassword !== expected) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      ),
    };
  }

  return { ok: true };
};

export const GET = async () => {
  return NextResponse.json({ poll: getPoll() });
};

export const POST = async (request: Request) => {
  const payload = (await request.json()) as CreatePayload;
  const auth = requireAdmin(payload.adminPassword);
  if (!auth.ok) {
    return auth.response;
  }

  const title = payload.title?.trim();
  const description = payload.description?.trim();
  const candidates = (payload.candidates ?? [])
    .map((candidate) => candidate.trim())
    .filter(Boolean);

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (candidates.length < 2) {
    return NextResponse.json(
      { error: "At least two candidates are required." },
      { status: 400 },
    );
  }

  const poll = createPoll({
    title,
    description: description ?? "",
    candidates,
    status: "open",
    reveal: false,
  });

  return NextResponse.json({ poll }, { status: 201 });
};

export const PATCH = async (request: Request) => {
  const payload = (await request.json()) as ClosePayload;
  const auth = requireAdmin(payload.adminPassword);
  if (!auth.ok) {
    return auth.response;
  }

  const poll = closePoll(Boolean(payload.reveal));
  if (!poll) {
    return NextResponse.json(
      { error: "No active poll to close." },
      { status: 404 },
    );
  }

  return NextResponse.json({ poll });
};

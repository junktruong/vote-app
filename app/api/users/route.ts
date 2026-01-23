import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type User = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  deviceId: string;
  createdAt: string;
};

type Store = {
  users: User[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

const readStore = async (): Promise<Store> => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data) as Store;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return { users: [] };
    }
    throw error;
  }
};

const writeStore = async (store: Store) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2));
};

const jsonError = (message: string, status = 400) => {
  return NextResponse.json({ ok: false, message }, { status });
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: "register" | "login";
    displayName?: string;
    username?: string;
    avatarUrl?: string;
    deviceId?: string;
  };

  if (!body.action) {
    return jsonError("Thiếu action.");
  }

  const store = await readStore();
  const deviceId = body.deviceId?.trim();
  const username = body.username?.trim().toLowerCase();

  if (!deviceId) {
    return jsonError("Thiếu deviceId.");
  }

  if (body.action === "register") {
    const displayName = body.displayName?.trim();
    const avatarUrl = body.avatarUrl?.trim();

    if (!displayName || !username || !avatarUrl) {
      return jsonError("Thiếu thông tin đăng ký.");
    }

    const deviceExists = store.users.some((user) => user.deviceId === deviceId);
    if (deviceExists) {
      return jsonError("Thiết bị này đã có tài khoản.");
    }

    const usernameExists = store.users.some(
      (user) => user.username === username,
    );
    if (usernameExists) {
      return jsonError("Tên đăng nhập đã tồn tại.");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      displayName,
      username,
      avatarUrl,
      deviceId,
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);
    await writeStore(store);

    return NextResponse.json({ ok: true, user: newUser });
  }

  if (body.action === "login") {
    if (!username) {
      return jsonError("Thiếu tên đăng nhập.");
    }

    const matchedUser = store.users.find(
      (user) => user.username === username && user.deviceId === deviceId,
    );

    if (!matchedUser) {
      return jsonError(
        "Không tìm thấy tài khoản phù hợp với thiết bị này.",
        401,
      );
    }

    return NextResponse.json({ ok: true, user: matchedUser });
  }

  return jsonError("Action không hợp lệ.");
}

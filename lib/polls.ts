export type PollStatus = "open" | "closed";

export type Poll = {
  title: string;
  description: string;
  candidates: string[];
  status: PollStatus;
  reveal: boolean;
  createdAt: string;
  closedAt?: string;
};

type PollStore = {
  current: Poll | null;
};

declare global {
  // eslint-disable-next-line no-var
  var pollStore: PollStore | undefined;
}

const store: PollStore = global.pollStore ?? { current: null };

if (!global.pollStore) {
  global.pollStore = store;
}

export const getPoll = (): Poll | null => store.current;

export const createPoll = (
  poll: Omit<Poll, "createdAt" | "closedAt">,
): Poll => {
  const created: Poll = {
    ...poll,
    createdAt: new Date().toISOString(),
  };
  store.current = created;
  return created;
};

export const closePoll = (reveal: boolean): Poll | null => {
  if (!store.current) {
    return null;
  }

  store.current = {
    ...store.current,
    status: "closed",
    reveal,
    closedAt: new Date().toISOString(),
  };

  return store.current;
};

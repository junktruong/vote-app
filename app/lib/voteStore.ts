export type Candidate = {
  id: string;
  name: string;
  image: string;
  votes: number;
};

type RevealStatus = "an" | "hien";

type VoteStore = {
  candidates: Candidate[];
  votingOpen: boolean;
  revealStatus: RevealStatus;
};

const defaultCandidates: Candidate[] = [
  {
    id: "linh",
    name: "Linh",
    image: "/globe.svg",
    votes: 0,
  },
  {
    id: "minh",
    name: "Minh",
    image: "/file.svg",
    votes: 0,
  },
  {
    id: "thao",
    name: "Thảo",
    image: "/window.svg",
    votes: 0,
  },
];

const globalForStore = globalThis as typeof globalThis & {
  __voteStore?: VoteStore;
};

const getStore = () => {
  if (!globalForStore.__voteStore) {
    globalForStore.__voteStore = {
      candidates: defaultCandidates,
      votingOpen: true,
      revealStatus: "an",
    };
  }

  return globalForStore.__voteStore;
};

export const getResults = () => {
  const store = getStore();
  const totalVotes = store.candidates.reduce(
    (total, candidate) => total + candidate.votes,
    0,
  );
  const leader = store.candidates.reduce<Candidate | null>(
    (currentLeader, candidate) => {
      if (!currentLeader || candidate.votes > currentLeader.votes) {
        return candidate;
      }

      return currentLeader;
    },
    null,
  );

  return {
    totalVotes,
    leader,
    revealStatus: store.revealStatus,
    votingOpen: store.votingOpen,
  };
};

export const stopVoting = () => {
  const store = getStore();
  store.votingOpen = false;
};

export const revealResults = () => {
  const store = getStore();
  store.revealStatus = "hien";
};

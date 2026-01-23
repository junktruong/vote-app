export type Candidate = {
  id: string;
  name: string;
  title: string;
  summary: string;
};

export type VoteRecord = {
  userId: string;
  candidateId: string;
  pollId: string;
  votedAt: string;
};

export const CURRENT_POLL_ID = "2024-community-election";

export const candidates: Candidate[] = [
  {
    id: "nguyen-minh-tri",
    name: "Nguyễn Minh Trí",
    title: "Ứng viên số 1",
    summary: "Tập trung phát triển cộng đồng, tăng cường minh bạch và hỗ trợ sinh viên.",
  },
  {
    id: "tran-hoang-ha",
    name: "Trần Hoàng Hà",
    title: "Ứng viên số 2",
    summary: "Ưu tiên cải thiện cơ sở vật chất và tạo thêm cơ hội thực tập.",
  },
  {
    id: "le-thanh-an",
    name: "Lê Thành An",
    title: "Ứng viên số 3",
    summary: "Đẩy mạnh chuyển đổi số, tối ưu trải nghiệm dịch vụ cho hội viên.",
  },
];

type VoteStore = Map<string, VoteRecord>;

type VoteStoreGlobal = {
  voteStore?: VoteStore;
};

const globalForVotes = globalThis as VoteStoreGlobal;

const voteStore: VoteStore = globalForVotes.voteStore ?? new Map();

globalForVotes.voteStore = voteStore;

export const getCandidateById = (id: string) =>
  candidates.find((candidate) => candidate.id === id);

const voteKey = (pollId: string, userId: string) => `${pollId}:${userId}`;

export const getVoteForUser = (pollId: string, userId: string) =>
  voteStore.get(voteKey(pollId, userId));

export const recordVote = (pollId: string, userId: string, candidateId: string) => {
  const existingVote = getVoteForUser(pollId, userId);
  if (existingVote) {
    return { success: false, vote: existingVote } as const;
  }

  const vote: VoteRecord = {
    userId,
    candidateId,
    pollId,
    votedAt: new Date().toISOString(),
  };

  voteStore.set(voteKey(pollId, userId), vote);

  return { success: true, vote } as const;
};

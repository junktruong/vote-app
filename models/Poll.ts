import mongoose, { Schema, models, model } from "mongoose";

const CandidateSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const PollSchema = new Schema(
  {
    title: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
    revealState: {
      type: String,
      enum: ["NOT_STARTED", "COUNTING", "WAITING_REVEAL", "REVEALED"],
      default: "NOT_STARTED",
    },
    countdownStartedAt: { type: Date, default: null },
    countdownDurationSec: { type: Number, default: 180 },
    spinState: { type: String, enum: ["IDLE", "REVEALED"], default: "IDLE" },
    spinWinnerId: { type: String, default: null },
    spinWinnerName: { type: String, default: null },
    spinRevealedAt: { type: Date, default: null },
    spinConfigSpecial: { type: Number, default: null },
    spinConfigFirst: { type: Number, default: null },
    spinConfigSecond: { type: [Number], default: [] },
    spinConfigThird: { type: [Number], default: [] },
    spinDrawnNumbers: { type: [Number], default: [] },
    spinHistory: {
      type: [
        {
          prize: { type: String, required: true },
          number: { type: Number, required: true },
          time: { type: Date, required: true },
        },
      ],
      default: [],
    },
    spinSecondIndex: { type: Number, default: 0 },
    spinThirdIndex: { type: Number, default: 0 },
    spinEncourageCount: { type: Number, default: 0 },
    spinLatestNumber: { type: Number, default: null },
    spinLatestPrize: { type: String, default: null },
    viewMode: { type: String, enum: ["RESULTS", "RECEIPT_SPIN", "SPIN"], default: "RESULTS" },
    receiptSpinState: { type: String, enum: ["IDLE", "REVEALED"], default: "IDLE" },
    receiptSpinNumber: { type: Number, default: null },
    receiptSpinRevealedAt: { type: Date, default: null },
    revealWinner: { type: Boolean, default: false },
    showOnResults: { type: Boolean, default: false },
    maxVotes: { type: Number, default: 3 },
    candidates: { type: [CandidateSchema], required: true },
    votingEndsAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type PollDoc = mongoose.InferSchemaType<typeof PollSchema> & { _id: mongoose.Types.ObjectId };

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).Poll;
}

export default models.Poll || model("Poll", PollSchema);

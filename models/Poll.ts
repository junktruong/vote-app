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
    revealWinner: { type: Boolean, default: false },
    showOnResults: { type: Boolean, default: false },
    maxVotes: { type: Number, default: 3 },
    candidates: { type: [CandidateSchema], required: true },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type PollDoc = mongoose.InferSchemaType<typeof PollSchema> & { _id: mongoose.Types.ObjectId };

export default models.Poll || model("Poll", PollSchema);

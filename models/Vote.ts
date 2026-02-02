import mongoose, { Schema, models, model } from "mongoose";

const VoteSchema = new Schema(
  {
    pollId: { type: Schema.Types.ObjectId, ref: "Poll", required: true },
    voterUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidateId: { type: String, required: true },
  },
  { timestamps: true }
);

// unique: 1 user chỉ vote 1 lần / 1 ứng viên trong poll
VoteSchema.index({ pollId: 1, voterUserId: 1, candidateId: 1 }, { unique: true });

export type VoteDoc = mongoose.InferSchemaType<typeof VoteSchema> & { _id: mongoose.Types.ObjectId };

export default models.Vote || model("Vote", VoteSchema);

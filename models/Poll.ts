import mongoose, { Schema, models, model } from "mongoose";

const PollSchema = new Schema(
  {
    title: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    revealWinner: { type: Boolean, default: false },
    candidateUserIds: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type PollDoc = mongoose.InferSchemaType<typeof PollSchema> & { _id: mongoose.Types.ObjectId };

export default models.Poll || model("Poll", PollSchema);

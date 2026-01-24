import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true, maxlength: 60 },
    username: { type: String, required: true, maxlength: 30 },
    thumb: { type: String, required: true },
    photo: { type: String, required: true },
    deviceId: { type: String, required: true },
  },
  { timestamps: true }
);

// Enforce uniqueness at the index level while ignoring legacy/null values.
UserSchema.index(
  { username: 1 },
  {
    name: "username_1",
    unique: true,
    partialFilterExpression: { username: { $type: "string" } },
  }
);
UserSchema.index({ deviceId: 1 }, { name: "deviceId_1", unique: true });

export type UserDoc = mongoose.InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export default models.User || model("User", UserSchema);

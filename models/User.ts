import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, required: true, maxlength: 60 },
    username: { type: String, required: true, unique: true, maxlength: 30 },
    thumb: { type: String, required: true },
    photo: { type: String, required: true },
    deviceId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export type UserDoc = mongoose.InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export default models.User || model("User", UserSchema);

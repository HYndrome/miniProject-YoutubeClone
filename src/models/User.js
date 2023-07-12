import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, requiredd: true },
  socialOnly: { type: Boolean, default: false },
  avatarUrl: { type: String },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  location: String,
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password"))
    // console.log("Users password: ", this.password);
    this.password = await bcrypt.hash(this.password, 5);
  // console.log("Hashed password: ", this.password);
});

const User = mongoose.model("User", userSchema);
export default User;

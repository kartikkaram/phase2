import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required:true, index:true },
  imageUrl: { type: String },
  role:{type:String, Enum:["teacher"]},
  accessToken: { type: String },
  refreshToken: { type: String },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password =await bcrypt.hash(this.password,10)
  }
  next()
})

userSchema.methods.isPasswordCorrect=async function (Password) {
 return await bcrypt.compare(Password,this.password)
}

userSchema.methods.generateAccessToken=async function (params) {
  // short lived access token
 return  jwt.sign({
   _id: this._id,
   email:this.email,
   username:this.username,
  },
process.env.ACCESS_TOKEN_SECRET,
{expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
)
}
userSchema.methods.generateRefreshToken=async function (params) {
  // short lived access token
 return  jwt.sign({
   _id: this._id
  },
process.env.REFRESH_TOKEN_SECRET,
{expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
)
}

const User = mongoose.model('User', userSchema);
export default User;

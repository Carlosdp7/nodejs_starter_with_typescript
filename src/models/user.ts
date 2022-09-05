import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { RoleDoc } from './role';

interface UserAttrs {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  roleId: RoleDoc;
  isActive?: boolean;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
  hashPassword(password: string): Promise<string>;
  generateAuthToken(id: string): string;
  generatePasswordReset(): { resetPasswordToken: string, resetPasswordExpires: number }
}

export interface UserDoc extends mongoose.Document {
  firstname: string;
  lastname: string;
  email: string;
  username?: string;
  phone?: string;
  password: string;
  roleId: RoleDoc;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  isActive: boolean;
  isDelete: boolean;
  createAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: false
  },
  lastname: {
    type: String,
    required: false
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Role'
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordToken: {
    type: String,
    required: false
  },
  resetPasswordExpires: {
    type: Number,
    required: false
  },
  isActive: {
    type: Boolean,
    required: false,
    default: true
  },
  isDelete: {
    type: Boolean,
    required: false,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.__v;
    }
  }
});

userSchema.statics.generateAuthToken = (id) => {
  const payload = {
    id: id
  }

  const token = jwt.sign(payload, process.env.JWT_SEED!)

  return token
}

userSchema.statics.generatePasswordReset = () => {
  let resetPasswordToken = randomBytes(20).toString('hex');
  let resetPasswordExpires = Date.now() + 3600000; //expires in an hour

  return { resetPasswordToken, resetPasswordExpires }
};

userSchema.statics.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const pass = await bcrypt.hash(password, salt);

  return pass;
};

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const hashed = await User.hashPassword(this.get('password'));
    this.set('password', hashed);
  }

  next()
})

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
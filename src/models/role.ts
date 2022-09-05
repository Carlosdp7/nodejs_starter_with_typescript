import mongoose from 'mongoose';
import { RoleTypes } from '../types/roleTypes';

interface RoleAttrs {
  name: RoleTypes;
}

interface RoleModel extends mongoose.Model<RoleDoc> {
  build(attrs: RoleAttrs): RoleDoc;
}

export interface RoleDoc extends mongoose.Document {
  name: RoleTypes;
  isActive: boolean;
  isDelete: boolean;
  createAt: Date;
  updatedAt: Date;
}

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: Object.values(RoleTypes)
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
      delete ret.__v;
    }
  }
});

roleSchema.statics.build = (attrs: RoleAttrs) => {
  return new Role(attrs);
};

const Role = mongoose.model<RoleDoc, RoleModel>('Role', roleSchema);

export { Role };
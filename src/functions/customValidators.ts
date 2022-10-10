import { CustomValidator } from 'express-validator';
import { Role } from '../models/role';
import { User } from '../models/user';

const isEmailInUse: CustomValidator = value => {
  return User.find({ email: value, isDelete: false, isActive: true }).then(user => {
    if (user.length !== 0) {
      return Promise.reject('Email en uso');
    }
  });
}

const isRoleExist: CustomValidator = value => {
  return Role.findOne({ name: value, isDelete: false }).then(role => {
    if (role) {
      return Promise.reject('Rol existe');
    }
  });
}

export { isRoleExist, isEmailInUse }
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { RoleTypes } from '../types/roleTypes';

export interface UserPayload {
  id: string;
  role: RoleTypes;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHead = req.header('Authorization');

    if (!authHead) {
      res.status(401).send({
        err: "No autorizado"
      })
      return;
    }

    const hasBearer = authHead.includes('Bearer ');

    if (!hasBearer) {
      res.status(401).send({
        err: "No autorizado"
      })
      return;
    }

    const token = authHead.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SEED!) as UserPayload;

    const user = await User.findOne({
      _id: decoded.id,
      isDelete: false,
      isActive: true
    }).populate('roleId');

    if (!user) {
      res.status(401).send({
        err: "No autorizado"
      })
      return;
    }

    req.user = {
      id: user._id,
      role: user.roleId.name
    }
    next()
  } catch (e) {
    res.status(401).send({
      err: 'No autorizado'
    })
  }
}
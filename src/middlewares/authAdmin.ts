import { Request, Response, NextFunction } from 'express';
import { RoleTypes } from '../types/roleTypes';

export const authAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user!.role !== RoleTypes.Admin) {
    res.status(403).send({
      err: 'No autorizado'
    })
    return
  }
  next()
}
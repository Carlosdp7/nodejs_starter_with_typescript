import express from 'express';
import { body, param } from 'express-validator';
import {
  getAllRoles,
  getOneRole,
  createNewRole
} from '../../controllers/role';
import { isRoleExist } from '../../functions/customValidators';
import { auth } from '../../middlewares/auth';
import { authAdmin } from '../../middlewares/authAdmin';
import { validateRequest } from '../../middlewares/validateRequest';
import { RoleTypes } from '../../types/roleTypes';

const router = express.Router();

//GET
router.get('/', getAllRoles);

router.get('/:id', auth, authAdmin, [
  param('id')
    .notEmpty()
    .withMessage('Id es requerido')
    .bail()
    .isMongoId()
    .withMessage('No válido')
], validateRequest, getOneRole);

//POST
router.post('/', auth, authAdmin, [
  body('name')
    .notEmpty()
    .withMessage('Name es requerido')
    .bail()
    .isString()
    .withMessage('No válido')
    .isIn(Object.values(RoleTypes))
    .withMessage('No válido')
    .custom(isRoleExist),
], validateRequest, createNewRole);


export { router as roleRouter }
import express from 'express';
import { body, param } from 'express-validator';
import {
  getAllUsers,
  getAuthenticatedUser,
  getOneUser,
  getRegisteredUsersPerMonth,
  getWeeklyRegistersCount,
  getAllRegisteredUsers,
  adminSignIn,
  signIn,
  signUp,
  logOut,
  createNewUser,
  passwordRecoveryRequest,
  verifyPasswordToken,
  recoverPassword,
  updateAuthorizedUser,
  updateOneUser,
  updateAuthorizedUserPassword,
  deleteOneUser
} from '../../controllers/user';
import { isEmailInUse } from '../../functions/customValidators';
import { auth } from '../../middlewares/auth';
import { authAdmin } from '../../middlewares/authAdmin';
import { validateRequest } from '../../middlewares/validateRequest';

const router = express.Router();

//GET
router.get('/', auth, authAdmin, getAllUsers);

router.get('/me', auth, getAuthenticatedUser);

router.get('/:id', auth, authAdmin, [
  param('id')
    .notEmpty()
    .withMessage('Id es requerido')
    .bail()
    .isMongoId()
    .withMessage('No válido')
], validateRequest, getOneUser);

router.get('/registered-per-month', auth, authAdmin, getRegisteredUsersPerMonth);

router.get('/weekly-registers-count', auth, authAdmin, getWeeklyRegistersCount);

router.get('/tolal-registered', auth, authAdmin, getAllRegisteredUsers);

//POST
router.post('/admin-signin', [
  body('email')
    .notEmpty()
    .withMessage('Email es requerido')
    .bail()
    .isString()
    .isEmail()
    .withMessage('No válido'),
  body('password')
    .notEmpty()
    .withMessage('Password es requerido')
    .bail()
    .isString()
    .withMessage('No válido')
], validateRequest, adminSignIn);

router.post('/signin', [
  body('email')
    .notEmpty()
    .withMessage('Email es requerido')
    .bail()
    .isString()
    .isEmail()
    .withMessage('No válido'),
  body('password')
    .notEmpty()
    .withMessage('Password es requerido')
    .bail()
    .isString()
    .withMessage('No válido')
], validateRequest, signIn);

router.post('/signup', [
  body('firstname')
    .notEmpty()
    .withMessage('Firstname es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('lastname')
    .notEmpty()
    .withMessage('Lastname es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('email')
    .notEmpty()
    .withMessage('Email es requerido')
    .bail()
    .isString()
    .isEmail()
    .withMessage('No válido')
    .custom(isEmailInUse),
  body('phone')
    .notEmpty()
    .withMessage('phone es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('password')
    .notEmpty()
    .withMessage('Password es requerido')
    .bail()
    .isString()
    .withMessage('No válido')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('La contraseña debe de ser entre 4 y 20 caracteres'),
  body('confirmPassword', 'Las contraseñas no coinciden').custom((value, { req }) => (value === req.body.password))
], validateRequest, signUp);

router.post('/logout', auth, logOut);

router.post('/', auth, authAdmin, [
  body('firstname')
    .notEmpty()
    .withMessage('Firstname es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('lastname')
    .notEmpty()
    .withMessage('Lastname es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('email')
    .notEmpty()
    .withMessage('Email es requerido')
    .bail()
    .isString()
    .isEmail()
    .withMessage('No válido')
    .custom(isEmailInUse),
  body('phone')
    .notEmpty()
    .withMessage('phone es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('password')
    .notEmpty()
    .withMessage('Password es requerido')
    .bail()
    .isString()
    .withMessage('No válido')
    .bail()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('La contraseña debe de ser entre 4 y 20 caracteres'),
  body('confirmPassword', 'Las contraseñas no coinciden').custom((value, { req }) => (value === req.body.password)),
  body('isActive')
    .notEmpty()
    .withMessage('isActive es requerido')
    .bail()
    .isBoolean()
    .withMessage('No válido')
], validateRequest, createNewUser);

router.post('/password-recovery-request', [
  body('email')
    .notEmpty()
    .withMessage('Email es requerido')
    .bail()
    .isString()
    .isEmail()
    .withMessage('No válido'),
], validateRequest, passwordRecoveryRequest);

router.post('/verify-password-token/:token', [
  param('token')
    .notEmpty()
    .isString()
], validateRequest, verifyPasswordToken);

router.post('/recover-password/:token', [
  param('token')
    .notEmpty()
    .isString(),
  body('password')
    .notEmpty()
    .withMessage('Password es requerido')
    .bail()
    .isString()
    .withMessage('No válido')
    .bail()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('La contraseña debe de ser entre 4 y 20 caracteres'),
  body('confirmPassword', 'Las contraseñas no coinciden').custom((value, { req }) => (value === req.body.password))
], validateRequest, recoverPassword);

//PUT
router.put('/me', auth, [
  body('email').not().exists(),
  body('password').not().exists(),
  body('roleId').not().exists(),
  body('online').not().exists(),
  body('isActive').not().exists(),
  body('isDelete').not().exists(),
  body('firstname')
    .if(body('firstname').exists())
    .notEmpty()
    .withMessage('Firstname es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('lastname')
    .if(body('lastname').exists())
    .notEmpty()
    .withMessage('Lastname es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('phone')
    .if(body('phone').exists())
    .notEmpty()
    .withMessage('phone es requerido')
    .bail()
    .isString()
    .withMessage('No válido')
], validateRequest, updateAuthorizedUser);

router.put('/:id', auth, authAdmin, [
  param('id')
    .notEmpty()
    .withMessage('id es requerido')
    .bail()
    .isMongoId()
    .withMessage('No válido'),
  body('online').not().exists(),
  body('isDelete').not().exists(),
  body('roleId').not().exists(),
  body('firstname')
    .if(body('firstname').exists())
    .notEmpty()
    .withMessage('Firstname es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('lastname')
    .if(body('lastname').exists())
    .notEmpty()
    .withMessage('Lastname es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('email')
    .if(body('email').exists())
    .notEmpty()
    .withMessage('Email es requerido')
    .bail()
    .isString()
    .isEmail()
    .withMessage('No válido')
    .custom(isEmailInUse),
  body('phone')
    .if(body('phone').exists())
    .notEmpty()
    .withMessage('phone es requerido')
    .bail()
    .isString()
    .withMessage('No válido'),
  body('password')
    .if(body('confirmPassword').exists())
    .notEmpty()
    .withMessage('Password es requerido')
    .bail()
    .isString()
    .withMessage('No válido')
    .bail()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('La contraseña debe de ser entre 4 y 20 caracteres'),
  body('confirmPassword', 'Las contraseñas no coinciden')
    .if(body('password').exists())
    .custom((value, { req }) => (value === req.body.password)),
  body('isActive')
    .if(body('isActive').exists())
    .notEmpty()
    .withMessage('isActive es requerido')
    .bail()
    .isBoolean()
    .withMessage('No válido')
], validateRequest, updateOneUser);

router.put('/change-password', auth, [
  body('newPassword')
    .notEmpty()
    .withMessage('Password es requerido')
    .bail()
    .isString()
    .withMessage('No válido')
    .bail()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('La contraseña debe de ser entre 4 y 20 caracteres'),
  body('confirmNewPassword', 'Las contraseñas no coinciden')
    .notEmpty()
    .withMessage('confirmNewPassword es requerido')
    .custom((value, { req }) => (value === req.body.newPassword)),
  body('currentPassword')
    .notEmpty()
    .withMessage('CurrentPassword es requerido')
    .bail()
    .isString()
    .withMessage('No válido')
    .bail()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('La contraseña debe de ser entre 4 y 20 caracteres')
], validateRequest, updateAuthorizedUserPassword);

//DELETE
router.delete('/:id', auth, authAdmin, [
  param('id')
    .notEmpty()
    .withMessage('id es requerido')
    .bail()
    .isMongoId()
    .withMessage('No válido')
], validateRequest, deleteOneUser);

export { router as userRouter }
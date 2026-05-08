import { body } from 'express-validator'

export const registerValidator = [
  body('email')
    .isEmail()
    .isEmail().normalizeEmail()
    .withMessage('Must be a valid email'),
  body('name')
    .isLength({min: 1})
    .withMessage('A user must have a name'),
  body('role').isIn(['admin', 'user'])
  .withMessage('Role must be either admin or user'),
  body('password')
    .isLength({ min: 8 })
    .isAlphanumeric()
    .trim()
    .withMessage('Password must be at least 8 characters and has characters and text'),
];

export const loginValidator = [
    body('email')
      .isEmail().normalizeEmail()
      .withMessage('Must be a valid email'),
    body('password')
      .isLength({ min: 8 })
      .trim()
    //   .isAlphanumeric()
      .withMessage('Password must be at least 8 characters and has characters and text'),
  ]
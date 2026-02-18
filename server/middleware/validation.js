import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for authentication
 */
export const authValidation = {
  googleLogin: [
    body('credential')
      .notEmpty()
      .withMessage('Google credential is required'),
    validate
  ]
};

/**
 * Validation rules for groups
 */
export const groupValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Group name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Group name must be between 2 and 100 characters'),
    validate
  ],
  
  share: [
    param('groupId')
      .isMongoId()
      .withMessage('Invalid group ID'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format'),
    validate
  ],
  
  getById: [
    param('groupId')
      .isMongoId()
      .withMessage('Invalid group ID'),
    validate
  ]
};

/**
 * Validation rules for players
 */
export const playerValidation = {
  create: [
    param('groupId')
      .isMongoId()
      .withMessage('Invalid group ID'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Player name is required')
      .isLength({ max: 50 })
      .withMessage('Player name must not exceed 50 characters'),
    body('baseSkill')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Base skill must be between 0 and 100'),
    validate
  ],
  
  update: [
    param('groupId')
      .isMongoId()
      .withMessage('Invalid group ID'),
    param('playerId')
      .isMongoId()
      .withMessage('Invalid player ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Player name must not exceed 50 characters'),
    body('baseSkill')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Base skill must be between 0 and 100'),
    validate
  ],
  
  updateStats: [
    param('groupId')
      .isMongoId()
      .withMessage('Invalid group ID'),
    param('playerId')
      .isMongoId()
      .withMessage('Invalid player ID'),
    body('playCount')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Play count must be a non-negative integer'),
    body('winCount')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Win count must be a non-negative integer'),
    body('elo')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('ELO must be a non-negative number'),
    body('gamesPlayed')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Games played must be a non-negative integer'),
    validate
  ],
  
  delete: [
    param('groupId')
      .isMongoId()
      .withMessage('Invalid group ID'),
    param('playerId')
      .isMongoId()
      .withMessage('Invalid player ID'),
    validate
  ],
  
  resetStats: [
    param('groupId')
      .isMongoId()
      .withMessage('Invalid group ID'),
    body('resetType')
      .optional()
      .isIn(['all', 'playCount', 'winCount'])
      .withMessage('Reset type must be: all, playCount, or winCount'),
    validate
  ]
};

/**
 * Validation rules for schedules
 */
export const scheduleValidation = {
  create: [
    param('groupId')
      .isMongoId()
      .withMessage('Invalid group ID'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must not exceed 200 characters'),
    body('start')
      .notEmpty()
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Invalid start date format'),
    body('end')
      .notEmpty()
      .withMessage('End date is required')
      .isISO8601()
      .withMessage('Invalid end date format')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.start)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Location must not exceed 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must not exceed 1000 characters'),
    validate
  ],
  
  getByGroup: [
    param('groupId')
      .isMongoId()
      .withMessage('Invalid group ID'),
    validate
  ],
  
  delete: [
    param('groupId')
      .isMongoId()
      .withMessage('Invalid group ID'),
    param('scheduleId')
      .isMongoId()
      .withMessage('Invalid schedule ID'),
    validate
  ]
};

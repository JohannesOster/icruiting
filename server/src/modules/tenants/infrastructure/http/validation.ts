import {body} from 'express-validator';

export const subsCreateRules = [body('priceId').isString()];

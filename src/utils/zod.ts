import {
  isArray,
  isBoolean,
  isDate,
  isNil,
  isNumber,
  isString,
  trim,
} from 'lodash';
import { ZodType, z } from 'zod';

/* *****************************************************************
 * Zod custom required field
 * ***************************************************************** */

function isEmptyValue(value: unknown): boolean {
  return (
    isNil(value) ||
    (isString(value) && trim(value) === '') ||
    (isNumber(value) && isNaN(value)) ||
    (isBoolean(value) && value === false) ||
    (isArray(value) && value.length === 0) ||
    (isDate(value) && isNaN(value.getTime()))
  );
}

export function zRequired<T extends ZodType>(
  schema: T,
  i18nKey = 'custom.required',
) {
  return schema.superRefine((value, ctx) => {
    if (isEmptyValue(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        params: { i18n: i18nKey },
      });
      return;
    }

    if (isArray(value)) {
      value.forEach((item, index) => {
        if (isEmptyValue(item)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index], // attach to specific array item
            params: { i18n: i18nKey },
          });
        }
      });
    }
  });
}

export const zRequiredNumber = (i18nKey = 'required') =>
  z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    zRequired(z.number(), i18nKey),
  );

export function requiredField(
  ctx: z.RefinementCtx,
  path: string[],
  condition: boolean,
  i18nKey = 'required',
) {
  if (!condition) {
    ctx.addIssue({
      path,
      code: z.ZodIssueCode.custom,

      params: { i18n: i18nKey },
    });
  }
}

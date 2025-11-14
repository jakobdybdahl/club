import { z } from "zod";
import {
  d,
  MONEY_PRECISION,
  MONEY_SCALE,
  QUANTITY_PRECISION,
  QUANTITY_SCALE,
} from "./decimal";

export function zod<
  Schema extends z.ZodSchema<any, any, any>,
  Return extends any,
>(schema: Schema, func: (value: z.output<Schema>) => Return) {
  const result = (input: z.input<Schema>) => {
    const parsed = schema.parse(input);
    return func(parsed);
  };
  result.schema = schema;
  return result;
}

export const coerceBoolean = z
  .enum(["0", "1", "true", "false"])
  .optional()
  .transform((value) =>
    value !== undefined ? value == "true" || value == "1" : undefined
  );

export type Select = {
  include: string[];
  exclude: string[];
};

export const parseSelect = (input: string[]): Partial<Select> => {
  const res: Select = {
    exclude: [],
    include: [],
  };
  input.forEach((v) =>
    v.startsWith("!") ? res.exclude.push(v.substring(1)) : res.include.push(v)
  );
  if (res.exclude.length && res.include.length) {
    res.include = res.include.filter((v) => !res.exclude.includes(v));
    res.exclude = [];
  }
  return res;
};

export const selectSchema = z.object({
  include: z
    .array(z.string().trim())
    .default([])
    .refine((value) => new Set(value).size === value.length, {
      message: "No duplicates allowed",
    }),
  exclude: z
    .array(z.string().trim())
    .default([])
    .refine((value) => new Set(value).size === value.length, {
      message: "No duplicates allowed",
    }),
});

type SelectSchemaInput = z.input<typeof selectSchema>;

export const selectQueryParamSchema = z
  .string()
  .trim()
  .transform((value) => value.split(","))
  .pipe(
    z
      .array(z.string().trim())
      .transform((v) => parseSelect(v))
      .pipe(selectSchema)
  );

export const bignumber = {
  money: () =>
    z
      .string()
      .transform((val) => d(val))
      .refine((val) => val.isFinite())
      .superRefine((val, ctx) => {
        const scale = val.decimalPlaces();
        if (scale === null || scale > MONEY_SCALE) {
          ctx.addIssue({
            code: "custom",
            message: `Invalid scale of number. Scale may not be more than ${MONEY_SCALE}`,
            fatal: true,
          });
        }

        const precision = val.precision();
        if (precision > MONEY_PRECISION) {
          ctx.addIssue({
            code: "custom",
            message: `Invalid precision of number. Precision may not be more than ${MONEY_PRECISION}`,
            fatal: true,
          });
        }
      }),
  quantity: () =>
    z
      .string()
      .transform((val) => d(val))
      .refine((val) => val.isFinite())
      .superRefine((val, ctx) => {
        const scale = val.decimalPlaces();
        if (scale === null || scale > QUANTITY_SCALE) {
          ctx.addIssue({
            code: "custom",
            message: `Invalid scale of number. Scale of quantity may not be more than ${QUANTITY_SCALE}`,
            fatal: true,
          });
        }

        const precision = val.precision();
        if (precision > QUANTITY_PRECISION) {
          ctx.addIssue({
            code: "custom",
            message: `Invalid precision of number. Precision of quantity may not be more than ${QUANTITY_PRECISION}`,
            fatal: true,
          });
        }
      }),
};

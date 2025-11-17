import { BigNumber } from "bignumber.js";

export { BigNumber };

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_HALF_EVEN });

BigNumber.prototype.valueOf = function () {
  throw Error("valueOf called!");
};

export const MONEY_PRECISION = 38;
export const MONEY_SCALE = 12;

export const DUST_THRESHOLD = BigNumber("0.0001");
export const QUANTITY_PRECISION = 18;
export const QUANTITY_SCALE = 4;

type ToBigNumberFn = <T extends BigNumber.Value | null>(
  n: T
) => T extends null ? BigNumber | null : BigNumber;

type _BigNumber = ((n: BigNumber.Value) => BigNumber) & {
  money: ToBigNumberFn;
  quantity: ToBigNumberFn;
};

const decimal: _BigNumber = (n: BigNumber.Value) => BigNumber(n);

decimal.money = (n) =>
  n !== null
    ? BigNumber(n).decimalPlaces(MONEY_SCALE, BigNumber.ROUND_HALF_EVEN)
    : (null as any);

decimal.quantity = (n) =>
  n !== null
    ? BigNumber(n).decimalPlaces(QUANTITY_SCALE, BigNumber.ROUND_HALF_EVEN)
    : (null as any);

export { decimal as d };

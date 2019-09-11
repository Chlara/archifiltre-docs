/**
 * Get a percent value rounded to the right number of decimals
 * @param value - The numerator count
 * @param total - The denominator count
 * @param numbersOfDecimals - The number of displayed decimals
 * @returns {string}
 */
export const percent = (value, total, { numbersOfDecimals = 0 } = {}) =>
  ((value / total) * 100).toFixed(numbersOfDecimals);
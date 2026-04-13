export const formatML = (value: string, fraction = 2) => {
  const number = parseFloat(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  if (number < 1000) {
    return number.toString();
  }

  const roundedNumber = Math.round(number * 100) / 100;
  const [integerPart, fractionalPart] = roundedNumber.toFixed(fraction).split(".");
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return formattedIntegerPart + (fractionalPart ? "." + fractionalPart : "");
};

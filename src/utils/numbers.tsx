export const formatML = (value: string, fraction = 2) => {
  const number = parseFloat(value);

  if (number < 1000) {
    // Применяем округление даже для чисел меньше 1000
    return number.toFixed(fraction);
  }

  const roundedNumber = Math.round(number * 100) / 100;
  const [integerPart, fractionalPart] = roundedNumber.toFixed(fraction).split(".");
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return formattedIntegerPart + (fractionalPart ? "." + fractionalPart : "");
};

import { getCoin } from "@/utils/network";

const coin = getCoin();

export const FormatML = ({ value, fraction = 0 }: any) => {
  const number = parseFloat(value);

  const roundedNumber = Math.round(number * 100) / 100;

  const [integerPart, fractionalPart] = roundedNumber.toFixed(fraction).split(".");

  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <span>
      {formattedIntegerPart} {fractionalPart ? <span className="opacity-40 text-[90%]">.{fractionalPart}</span> : <></>} {coin}
    </span>
  );
};

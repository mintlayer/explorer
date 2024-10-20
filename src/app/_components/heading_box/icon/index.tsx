import Image from "next/image";

type IconProps = {
  src: string;
  alt?: string;
};

export const Icon = ({ src, alt = "" }: IconProps) => {
  return <Image className="max-w-[initial]" src={src} alt={alt} />;
};

import { ReactNode } from "react";

type HeroProps = {
  children?: ReactNode;
  overlap?: boolean;
};

export const Hero = ({ children, overlap = false }: HeroProps) => {
  return <div className={`relative bg-secondary-110 w-full pt-10 md:pt-5 pb-2 ${overlap ? "mb-[-60px] pb-[60px] -z-1" : null}`}>{children}</div>;
};

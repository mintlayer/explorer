"use client";
import { FooterMini } from "./../footer_mini";
import { FooterMax } from "./../footer_max";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();
  return <>{pathname === "/" ? <FooterMax /> : <FooterMini />}</>;
};

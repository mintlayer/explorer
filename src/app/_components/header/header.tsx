"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import logo from "./logo-full-black.svg";
import { Search } from "../search";

import expand_more from "./expand_more.svg";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDisplayName } from "@/utils/network";

type MenuLink = {
  label: string;
  href: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  accent?: string;
};

const NEWS: { title: "string" }[] = [];
const NETS: MenuLink[] = [
  {
    label: "Mainnet",
    href: "https://explorer.mintlayer.org",
  },
  {
    label: "Testnet",
    href: "https://lovelace.explorer.mintlayer.org",
  },
  {
    label: "Zk Thunder Testnet",
    href: "https://explorer.testnet.zkthunder.fi",
    accent: "#a383ff",
  },
];
const MENU_LINKS: MenuLink[] = [
  {
    label: "Website",
    href: "https://www.mintlayer.org/",
    target: "_blank",
  },
  {
    label: "Documentation",
    href: "https://docs.mintlayer.org/",
    target: "_blank",
  },
  {
    label: "Mojito Wallet",
    href: "https://www.mintlayer.org/wallet",
    target: "_blank",
  },
  {
    label: "About Mintlayer",
    href: "https://www.mintlayer.org/about",
    target: "_blank",
  },
];

const mappedMenuLinks = MENU_LINKS.map((link, i) => {
  return (
    <li key={i} className="mb-3 whitespace-nowrap">
      <Link className="group/link relative hover:text-base-dark" href={link.href} target={link.target}>
        {link.label}
        <span
          className="h-0 w-0 bg-transparent absolute -bottom-1 left-0 transform skew-x-[-60deg] group-hover/link:w-0 transition-all ease-in-out duration-300"
          aria-hidden="true"
        ></span>
      </Link>
    </li>
  );
});

const displayName = getDisplayName();

export const Header = () => {
  const pathname = usePathname();
  const header = useRef(null);
  const [scroll, setScroll] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 250) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    });
  }, []);

  return (
    <>
      {NEWS.length > 0 && (
        <div className="bg-white h-8 flex overflow-hidden relative overflow-x-hidden">
          <div className="animate-marquee py-1 whitespace-nowrap">
            {NEWS.map(({ title }, i) => (
              <span key={i} className="mx-4 text-base-gray">
                <b>News</b> {title}
              </span>
            ))}
          </div>

          <div className="absolute top-0 py-1 animate-marquee2 whitespace-nowrap">
            {NEWS.map(({ title }, i) => (
              <span key={i} className="mx-4 text-base-gray">
                <b>News</b> {title}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={`${scroll ? "sticky" : ""} top-0 w-full z-50 bg-secondary-110`}>
        {isMobileMenuOpen && <div className="absolute w-screen h-screen bg-transparent z-99" onClick={() => setIsMobileMenuOpen(false)}></div>}

        {isHome ? (
          <div className="absolute -z-50 w-full bottom-0 overflow-hidden top-0 h-[72px]">
            <div className="absolute top-[-504px] left-[534px] w-[834px] h-[834px] rounded-[100%] blur-[100px] bg-white opacity-50"></div>
            <div className="absolute top-[-334px] left-[-300px] w-[834px] h-[834px] rounded-[100%] blur-[100px] bg-primary-100 opacity-50"></div>
          </div>
        ) : (
          <></>
        )}

        <div className="flex flex-wrap justify-between items-center gap-3 md:gap-12 max-w-6xl mx-auto px-5 pt-3 pb-2 md:pb-3">
          <Link href={"/"} className="order-1 flex items-center w-8 md:w-auto overflow-hidden">
            <Image src={logo} className="w-[149px] h-[30px] max-w-none mr-1" alt="" />
            <span className="ml-1 mt-1 hidden md:block uppercase text-base-dark text-xs tracking-widest"> - explorer</span>
          </Link>

          <div className="order-2 md:order-3 md:-mr-5 group/dropdown">
            <div className="text-black font-bold relative text-[16px] h-[35px] flex items-center last:mr-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <div className="relative pr-2 pt-1 pb-1 pl-4 border-0 cursor-pointer">
                <div className="flex items-center">
                  {displayName} <Image className="ml-2" src={expand_more} alt={""} />
                </div>
              </div>
              <div
                className="absolute top-0 right-0 bg-white mt-12 px-6 pt-4 pb-2 shadow-md invisible z-100 text-base font-medium opacity-0 transition-all ease-in-out duration-100
                  delay-100 translate-y-[-5px] w-[190px] group-hover/dropdown:visible group-hover/dropdown:opacity-100 group-hover/dropdown:transition-none group-hover/dropdown:delay-0
                  group-hover/dropdown:translate-x-0 group-hover/dropdown:translate-y-0"
              >
                <ul>
                  {NETS.map((net, i) => {
                    return (
                      <li key={i} className="mb-3 whitespace-nowrap">
                        <Link className="group/link relative hover:text-base-dark" href={net.href} target={net.target}>
                          {net.label}
                          <span
                            className={`h-0 w-0 bg-transparent absolute -bottom-1 left-0 transform skew-x-[-60deg] group-hover/link:w-0 transition-all ease-in-out duration-300`}
                            aria-hidden="true"
                          ></span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="absolute top-0 right-0 bg-transparent w-[150px] h-[50px]" aria-hidden="true"></div>
            </div>
          </div>

          <div className="order-2 md:order-3 group/dropdown">
            <div className="text-base-gray font-bold relative text-[14px] h-[35px] flex items-center last:mr-0">
              <Link className="hidden md:inline" href={""}>
                Learn
              </Link>

              <button
                className="inline md:hidden z-10 w-10 h-10 relative focus:outline-none bg-transparent"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <div className="block w-5 absolute left-1/2 top-1/2  transform -translate-x-1/2 -translate-y-1/2">
                  <span
                    aria-hidden="true"
                    className={`block absolute h-0.5 w-5 bg-base-black transform transition duration-500 ease-in-out ${isMobileMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-1.5"} `}
                  ></span>
                  <span
                    aria-hidden="true"
                    className={`block absolute h-0.5 w-5 bg-base-black transform transition duration-500 ease-in-out ${isMobileMenuOpen && "opacity-0"}`}
                  ></span>
                  <span
                    aria-hidden="true"
                    className={`block absolute h-0.5 w-5 bg-base-black transform transition duration-500 ease-in-out ${isMobileMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-1.5"}`}
                  ></span>
                </div>
              </button>

              <div
                className="hidden md:block absolute top-0 right-0 bg-white mt-12 px-6 pt-4 pb-2 shadow-md invisible z-100 text-base font-medium opacity-0 transition-all ease-in-out duration-100
                  delay-100 translate-y-[-5px] w-[172px] group-hover/dropdown:visible group-hover/dropdown:opacity-100 group-hover/dropdown:transition-none group-hover/dropdown:delay-0
                  group-hover/dropdown:translate-x-0 group-hover/dropdown:translate-y-0"
              >
                <ul>{mappedMenuLinks}</ul>
              </div>

              {isMobileMenuOpen && (
                <div
                  className={`block md:hidden absolute top-0 right-0 bg-white mt-12 px-6 pt-4 pb-2 shadow-md z-100 text-base font-medium opacity-0 transition-all ease-in-out duration-100
                  delay-100 translate-y-[-5px] w-[172px] ${isMobileMenuOpen ? "visible opacity-100 transition-none delay-0 translate-x-0 translate-y-0" : "invisible"} `}
                >
                  <ul>{mappedMenuLinks}</ul>
                </div>
              )}
              <div className="visible absolute top-0 right-0 bg-transparent w-[60px] h-[50px]" aria-hidden="true"></div>
            </div>
          </div>

          <div className="grow shrink order-3 md:order-2 w-full md:w-0">{pathname !== "/" || scroll ? <Search /> : <div className="md:h-[48px]" />}</div>
        </div>
      </div>
    </>
  );
};

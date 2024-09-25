import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/app/_components/hero";
import { isMainNetwork, MAINNET_EXPLORER_URL, TESTNET_EXPLORER_URL } from "@/utils/network";
import notfound from "@/../public/images/broken.svg";

export const NotFound = ({ title, subtitle, id, linkUrl }: any) => {
  return (
    <>
      <Hero overlap={true}>
        <div className="max-w-6xl mx-6 md:mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mt-20 ml-4 md:ml-10">{title}</h2>
        </div>
      </Hero>
      <div className={"flex flex-col gap-5 items-center justify-center mt-5 mb-20 mx-2 md:mx-auto bg-white md:max-w-2xl px-10 py-6"}>
        <Image src={notfound} alt={""} />
        <h3 className="text-hightlight">Ooops!</h3>
        <p className="text-body">{subtitle}</p>
        <p className="text-body">{id}</p>
        {linkUrl && (
          <p className="text-body font-bold break-all text-center">
            {isMainNetwork ? (
              <Link href={`${TESTNET_EXPLORER_URL}${linkUrl}`} className="text-primary-100">
                View in testnet
              </Link>
            ) : (
              <Link href={`${MAINNET_EXPLORER_URL}${linkUrl}`} className="text-primary-100">
                View in mainnet
              </Link>
            )}
          </p>
        )}
        <Link className="bg-primary-100 text-white text-xl px-12 py-[14px] font-bold" href={"/"}>
          Go home
        </Link>
        <div className="md:pt-9 flex flex-col md:flex-row items-center gap-1">
          <span className="py-4 px-2 font-normal text-base-dark text-base">Or visit our: </span>
          <Link className="text-primary-110 px-2 py-1 font-semibold text-base" href="https://www.mintlayer.org/" target="_blank">
            Website
          </Link>
          <Link className="text-primary-110 px-2 py-1 font-semibold text-base" href="https://docs.mintlayer.org/" target="_blank">
            Documentation
          </Link>
          <Link className="text-primary-110 px-2 py-1 font-semibold text-base" href="https://www.mintlayer.org/wallet" target="_blank">
            Mojito Wallet
          </Link>
        </div>
      </div>
    </>
  );
};

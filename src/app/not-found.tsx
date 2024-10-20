import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/app/_components/hero";

import notfound from "../../public/images/broken.svg";

export default function NotFound() {
  return (
    <>
      <Hero overlap={true}>
        <div className="max-w-6xl mx-6 md:mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mt-20 ml-4 md:ml-10">Page not found</h2>
        </div>
      </Hero>
      <div className={"flex flex-col gap-5 items-center justify-center mt-5 mb-20 mx-2 md:mx-auto bg-white md:max-w-2xl px-10 py-6"}>
        <Image src={notfound} alt={""} />
        <h3 className="text-hightlight">Ooops!</h3>
        <p className="text-body">This is not the page you are looking for</p>

        <Link href={"/"} className={"bg-primary-100 py-2 px-6 text-white font-semibold"}>
          Go home
        </Link>

        <div className="flex flex-col  items-center md:flex-row gap-4">
          <div>Or visit our:</div>
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
}

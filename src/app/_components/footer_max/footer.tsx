import Image from "next/image";
import logo from "./logo-full-white.svg";

export const FooterMax = () => {
  return (
    <div className="bg-base-dark text-white overflow-hidden relative pt-5 md:pt-20 pb-10">
      <div className="absolute w-full h-full z-5">
        <div className="absolute top-0 left-[-100px] rotate-[-20deg] w-full h-[2px] bg-white bg-opacity-10"></div>
        <div className="absolute top-0 left-[-200px] rotate-[-40deg] w-full h-[2px] bg-white bg-opacity-10"></div>
        <div className="absolute top-0 left-[-400px] rotate-[-80deg] w-full h-[2px] bg-white bg-opacity-10"></div>
        <div className="absolute top-0 left-[-100px] rotate-[-40deg] w-full h-[2px] bg-white bg-opacity-10"></div>
        <div className="absolute top-0 left-[-300px] rotate-[-20deg] w-full h-[2px] bg-white bg-opacity-10"></div>
        <div className="absolute top-0 left-[-500px] rotate-[-50deg] w-full h-[2px] bg-white bg-opacity-10"></div>
      </div>
      <div className="relative z-10 flex flex-col-reverse md:flex-row items-start justify-between max-w-6xl mx-auto px-4 py-6 gap-10">
        <div className="md:w-3/4 md:pr-20">
          <div className="mb-8 md:mb-4">
            <Image src={logo} alt={""} />
          </div>
          <p>
            A future-proof blockchain that improves direct token interoperability and enables ways to trade value, create systems, functionalities, and
            participate in truly trustless finance.
            <br />
            We leverage technologically advanced scalability to enforce network & user security, increase node inclusivity, and ensure long-term sustainability.
          </p>
        </div>
        <div className="">
          <div className="font-bold mb-4 hidden md:block">Learn</div>
          <ul>
            <li className="mb-4">
              <a href="https://www.mintlayer.org/">Website</a>
            </li>
            <li className="mb-4">
              <a href="https://docs.mintlayer.org/">Documentation</a>
            </li>
          </ul>
        </div>
        <div className="hidden md:block">
          <div className="font-bold mb-4">Social</div>
          <ul>
            <li className="mb-4">
              <a href="https://www.linkedin.com/company/53488934/">Linkedin</a>
            </li>
            <li className="mb-4">
              <a href="https://t.me/mintlayer">Telegram</a>
            </li>
            <li className="mb-4">
              <a href="https://discord.gg/gkZ4h8McBT">Discord</a>
            </li>
            <li className="mb-4">
              <a href="https://twitter.com/mintlayer">X</a>
            </li>
            <li className="mb-4">
              <a href="https://www.facebook.com/MintlayerOfficial/">Facebook</a>
            </li>
            <li className="mb-4">
              <a href="https://www.youtube.com/channel/UCVVpaPry8xZS47pPBmS4rnA/videos">Youtube</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative z-10 flex items-start justify-between max-w-6xl mx-auto px-4 py-6 gap-10">
        <div className="flex md:items-center md:justify-center md:mx-auto">
          <ul className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
            <li className="text-base-gray40 text-sm font-semibold">© Mintlayer.org</li>
            <li>
              <a href="https://www.mintlayer.org/tc/terms" target="_blank" className="text-base-gray40 text-sm font-semibold">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="https://www.mintlayer.org/tc/privacy" target="_blank" className="text-base-gray40 text-sm font-semibold">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

import Image from "next/image";
import logo from "./logo-full-white.svg";

export const FooterMini = () => {
  return (
    <div className="bg-base-dark text-white overflow-hidden relative mt-auto">
      <div className="absolute w-full h-full z-5">
        <div className="absolute top-0 left-[-100px] rotate-[-20deg] w-full h-[2px] bg-white bg-opacity-10"></div>
        <div className="absolute top-0 left-[-200px] rotate-[-40deg] w-full h-[2px] bg-white bg-opacity-10"></div>
      </div>
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between max-w-6xl mx-auto px-4 py-6 gap-10">
        <div className="">
          <Image src={logo} alt={""} />
        </div>

        <div className="flex items-center justify-center md:mx-auto">
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

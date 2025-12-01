import Link from "next/link";
import Image from "next/image";
import { QRCode } from "@/app/_components/qr-code";
import { Copy } from "@/app/tx/[tx]/_components/copy";

export const TokenSidebarSummary = ({ data, layout = "wide" }: any) => {
  return (
    <div className="bg-white px-4 py-0.5">
      {data.map((item: any) => {
        return (
          <div key={item.title} className={`flex flex-col md:grid grid-rows-2 grid-cols-1 md:grid-rows-1 md:grid-cols-2 my-6 gap-3 md:gap-6 items-start`}>
            <div className={`text-sm font-semibold md:col-span-1 flex text-base-black overflow-hidden text-ellipsis`}>
              {item.icon ? (
                <>
                  {item.iconTooltip ? (
                    <div className="w-5 h-5 block mr-1.5">
                      <div data-tooltip-id="tooltip" data-tooltip-content={item.iconTooltip}>
                        <Image src={item.icon} alt={""} className="w-5 h-5 max-w-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-5 h-5 block mr-1.5">
                      <Image src={item.icon} alt={""} className="w-5 h-5 max-w-none" />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-5 h-5 block mr-1.5"></div>
              )}
              {item.title}
            </div>
            <div className={`md:col-span-1 w-full text-sm break-all`}>
              {item.link ? (
                <Link href={item.link}>{item.value}</Link>
              ) : (
                <div className="flex w-full gap-6 justify-between relative">
                  <div className="break-all">
                    {item.copy ? (
                      <div className="flex gap-2">
                        <span>{item.value}</span>
                        <Copy text={item.copy} />
                      </div>
                    ) : (
                      item.value
                    )}
                  </div>
                  {item.qrCode ? (
                    <>
                      <div className="w-16 inline-block"></div>
                      <div className="w-10 absolute right-0">
                        <QRCode text={item.qrCode} />
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

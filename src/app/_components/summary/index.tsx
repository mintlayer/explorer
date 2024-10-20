import Link from "next/link";
import Image from "next/image";
import { QRCode } from "@/app/_components/qr-code";
import { Copy } from "@/app/tx/[tx]/_components/copy";

const layouts: any = {
  full: {
    grid: "md:grid-cols-10",
    header: "md:col-span-2",
    content: "md:col-span-6",
  },
  wide: {
    grid: "md:grid-cols-10",
    header: "md:col-span-2",
    content: "md:col-span-8",
  },
  narrow: {
    grid: "md:grid-cols-10",
    header: "md:col-span-3",
    content: "md:col-span-7",
  },
};

export const Summary = ({ data, layout = "wide" }: any) => {
  const layoutClass = layouts[layout];

  return (
    <div className="bg-white px-6 py-0.5 h-full">
      {data.map((item: any) => {
        return (
          <div key={item.title} className={`flex flex-col md:grid grid-rows-2 grid-cols-1 md:grid-rows-1 ${layoutClass.grid} my-6 gap-3 md:gap-6 items-start`}>
            <div className={`text-sm font-semibold ${layoutClass.header} flex text-base-black overflow-hidden text-ellipsis`}>
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
            <div className={`${layoutClass.content} w-full text-sm break-all`}>
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

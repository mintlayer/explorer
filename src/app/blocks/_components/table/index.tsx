import Image from "next/image";
import Link from "next/link";

// icons
import icon_tx from "@/app/(homepage)/_icons/16px/transactions.svg";
import icon_block from "@/app/(homepage)/_icons/16px/block.svg";
import icon_time from "@/app/(homepage)/_icons/16px/time.svg";
import { formatDate } from "@/utils/format";
import icon_community from "@/app/(homepage)/_icons/16px/community.svg";

export const Table = ({ data, title, itemsPerPage, skeleton }: any) => {
  return (
    <div className="bg-white px-4 py-4 h-full">
      <div className="font-bold text-2xl mb-4">{title}</div>
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="h-[27px] text-center font-bold text-sm text-gray-500 uppercase px-6">
              <Image className="m-auto" alt="" src={icon_block} />
              <span className="hidden">Block</span>
            </th>
            <th className="h-[27px] text-center font-bold text-sm text-gray-500 uppercase px-6">
              <Image className="m-auto" alt="" src={icon_tx} />
              <span className="hidden">Transactions</span>
            </th>
            <th className="h-[27px] text-center font-bold text-sm text-gray-500 uppercase px-6">
              <Image className="m-auto" alt="" src={icon_community} />
              <span className="hidden">By</span>
            </th>
            <th className="h-[27px] text-center font-bold text-sm text-gray-500 uppercase px-6">
              <Image className="m-auto" alt="" src={icon_time} />
              <span className="hidden">Date</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {skeleton
            ? Array(itemsPerPage)
                .fill(null)
                .map((v, index) => {
                  return (
                    <tr key={index} className={"border-b border-gray-100"}>
                      <td className={"text-center py-4 px-6"}>
                        <div className="bg-secondary-100 w-full h-6 rounded block"></div>
                      </td>
                      <td className={"text-center py-4 px-6"}>
                        <div className="bg-secondary-100 w-full h-6 rounded block"></div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="bg-secondary-100 w-full h-6 rounded block"></div>
                      </td>
                      <td className={"text-center py-4 px-6"}>
                        <div className="bg-secondary-100 w-full h-6 rounded block"></div>
                      </td>
                    </tr>
                  );
                })
            : data.map((item: any, index: number) => {
                return (
                  <tr className="border-b border-gray-100" key={index}>
                    <td className="text-center py-4 px-6">
                      <Link className="text-primary-110 font-semibold" href={`/block/${item.block}`}>
                        #{item.block}
                      </Link>
                    </td>
                    <td className="text-center py-4 px-6">{item.transactions}</td>
                    <td className="text-center py-4 px-6">
                      <Link className="text-primary-110 font-semibold" href={`/pool/${item.pool}`}>
                        {item.pool_label}
                      </Link>
                    </td>
                    <td className="text-center py-4 px-6">{formatDate(item.datetime)}</td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
};

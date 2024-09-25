import styles from "./styles.module.css";
import Link from "next/link";
import { formatML } from "@/utils/numbers";
import { getCoin } from "@/utils/network";
import { formatDate, shortenString } from "@/utils/format";

const coin = getCoin();

export const Delegations = ({ data }: any) => {
  return (
    <div className="bg-white px-4 py-4 h-full custom-wallet-clip-path">
      <div className="font-bold text-2xl my-4 mx-4">Delegations</div>
      <div className="flex flex-col gap-4">
        <table className="w-full">
          <thead className="bg-secondary-100 font-normal">
            <tr className="border-b border-secondary-100 last:border-b-0">
              <th className="text-base-gray text-left font-normal px-4 py-2">Asset</th>
              <th className="text-left font-normal px-4 py-2">Delegation address</th>
              <th className="text-left font-normal px-4 py-2">Creation Date</th>
              <th className="text-left font-normal px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index: number) => (
              <tr className="border-b border-secondary-100 last:border-b-0" key={index}>
                <td className="text-base-gray font-bold px-4 py-2">ML</td>
                <td className="px-4 py-2">
                  <Link href={`/delegation/${item.delegation_id}`} className="text-primary-100">
                    {shortenString(item.delegation_id)}
                  </Link>
                </td>
                <td className="font-medium text-right px-4 py-2">{formatDate(item.creation_block_timestamp)}</td>
                <td className="font-medium text-right px-4 py-2">
                  {formatML(item.balance.decimal)} {coin}
                </td>
              </tr>
            ))}
            {/*<tr className={styles.expand_line}>*/}
            {/*  <td className="text-base-gray font-bold" colSpan={2}><Link href={'/token/tgbl'} className="text-primary-110 font-bold">ML</Link></td>*/}
            {/*  <td ><span className={styles.badge}>Coin</span></td>*/}
            {/*  <td className="font-medium text-right">1000</td>*/}
            {/*  <td className={styles.col_vesting}>Details</td>*/}
            {/*</tr>*/}
            {/*<tr className={styles.expand_header}>*/}
            {/*  <td className={styles.expand_header_hash}>#</td>*/}
            {/*  <td className={styles.expand_header_percentage}>Percentage</td>*/}
            {/*  <td className={styles.expand_header_date}>Release date</td>*/}
            {/*  <td className={styles.expand_header_amount}>Amount</td>*/}
            {/*  <td></td>*/}
            {/*</tr>*/}
            {/*<tr className={styles.expand_row}>*/}
            {/*  <td className={styles.expand_cell_hash}>1</td>*/}
            {/*  <td className={styles.expand_cell_percentage}>12,5%</td>*/}
            {/*  <td className={styles.expand_cell_date}>03.11.23 - 03.21.23</td>*/}
            {/*  <td className={styles.expand_cell_amount}>8.75</td>*/}
            {/*  <td></td>*/}
            {/*</tr>*/}
            {/*<tr className={styles.expand_row}>*/}
            {/*  <td className={styles.expand_cell_hash}>2</td>*/}
            {/*  <td className={styles.expand_cell_percentage}>12,5%</td>*/}
            {/*  <td className={styles.expand_cell_date}>03.11.23 - 03.21.23</td>*/}
            {/*  <td className={styles.expand_cell_amount}>8.75</td>*/}
            {/*  <td></td>*/}
            {/*</tr>*/}
            {/*<tr className={styles.expand_row}>*/}
            {/*  <td className={styles.expand_cell_hash}>3</td>*/}
            {/*  <td className={styles.expand_cell_percentage}>12,5%</td>*/}
            {/*  <td className={styles.expand_cell_date}>03.11.23 - 03.21.23</td>*/}
            {/*  <td className={styles.expand_cell_amount}>8.75</td>*/}
            {/*  <td></td>*/}
            {/*</tr>*/}
          </tbody>
        </table>
      </div>
    </div>
  );
};

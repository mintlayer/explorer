import { HeadingBox } from "@/app/(homepage)/_components/heading_box";
import community from "@/app/(homepage)/_icons/24px/community.svg";
import txs from "@/app/(homepage)/_icons/24px/txs.svg";
import { Icon } from "@/app/_components/heading_box/icon";
import {formatML} from "@/utils/numbers";

export function Summary({ data, data_transaction }: { data: any; data_transaction: number }) {
  return (
    <>
      <div className="col-span-2">
        <HeadingBox
          title={`${formatML(data.total_amount)} ML`}
          subtitle="Total Stake Amount"
          icon={<Icon src={community} />}
          button={{ label: "Start staking", link: "/pools" }}
          iconTooltip="Current APY"
        />
      </div>
      <div>
        <HeadingBox title={data.validators_count} subtitle="Validators" icon={<Icon src={community} />} iconTooltip="Validators" />
      </div>
      <div>
        <HeadingBox title={data_transaction} subtitle="Total transactions" icon={<Icon src={txs} />} iconTooltip="Total transactions" />
      </div>
    </>
  );
}

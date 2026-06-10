import { HeadingBox } from "@/app/(homepage)/_components/heading_box";
import community from "@/app/(homepage)/_icons/24px/community.svg";
import txs from "@/app/(homepage)/_icons/24px/txs.svg";
import { Icon } from "@/app/_components/heading_box/icon";

export function Summary({ data, data_transaction }: { data: any; data_transaction: number }) {
  return (
    <>
      <div>
        <HeadingBox title={data.validators_count} subtitle="Validators" icon={<Icon src={community} />} iconTooltip="Validators" />
      </div>
      <div>
        <HeadingBox title={data_transaction} subtitle="Total transactions" icon={<Icon src={txs} />} iconTooltip="Total transactions" />
      </div>
    </>
  );
}

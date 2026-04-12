import { HeadingBox } from "@/app/(homepage)/_components/heading_box";
import icon_community from "@/app/(homepage)/_icons/16px/community.svg";
import { FormatML } from "@/app/_components/number";
import icon_fee from "@/app/(homepage)/_icons/24px/fee.svg";
import { Icon } from "@/app/_components/heading_box/icon";
export function Summary({ data }: { data: any }) {

  return (
    <>
      <div className="md:col-span-2">
        <HeadingBox title={`${data.total_apy} %`} subtitle="APY" icon={<Icon src={icon_fee} />} iconTooltip="APY" />
      </div>
      <div className="md:col-span-2">
        <HeadingBox title={`${data.validators_count}`} subtitle="Total pools" icon={<Icon src={icon_community} />} iconTooltip="Total pools" />
      </div>
      <div className="md:col-span-2">
        <HeadingBox title={`${data.delegation_count}`} subtitle="Total delegations" icon={<Icon src={icon_community} />} iconTooltip="Total delegations" />
      </div>
      <div className="md:col-span-3">
        <HeadingBox title={<FormatML value={data.total_amount} />} subtitle="Total stake" icon={<Icon src={icon_fee} />} iconTooltip="Total stake" />
      </div>
      <div className="md:col-span-3">
        <HeadingBox
          title={<FormatML value={data.total_effective_amount} />}
          subtitle="Total effective stake"
          icon={<Icon src={icon_fee} />}
          iconTooltip="Total effective stake"
        />
      </div>
    </>
  );
}

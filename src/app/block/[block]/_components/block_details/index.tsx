import Image from "next/image";

export const BlockDetails = ({ data }: any) => {
  return (
    <div className="bg-white py-4 h-full w-full">
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        {data.map((item: any) => (
          <div key={item.title} className="grid grid-cols-2 gap-4 px-4 py-2">
            <div className="text-[14px] font-semibold col-span-1 flex items-center">
              {item.icon ? (
                <div className="w-5 h-5 block mr-1.5">
                  <Image src={item.icon} alt={""} />
                </div>
              ) : (
                <div className="w-5 h-5 block mr-1.5"></div>
              )}
              {item.title}
            </div>
            <div className="text-[14px] overflow-hidden text-ellipsis col-span-1">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Switch = ({ checked, onChange }: any) => {
  return (
    <div
      className={`relative cursor-pointer w-9 min-w-[36px] h-[20px] rounded-[20px]
        after:content-[''] after:absolute after:w-4 after:h-4 after:rounded-[50%] after:bg-white after:top-[2px] after:duration-200
        ${checked ? "bg-primary-110 after:left-[18px]" : "bg-[#808080] after:left-[2px]"}`}
      onClick={onChange}
    ></div>
  );
};

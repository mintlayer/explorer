export const ColumnBox = ({ children, title, icon, right, innerStyle }: any) => {
  return (
    <div className="bg-white p-2">
      <div className={`${innerStyle ? innerStyle : "mx-4 my-5"}`}>
        <div className="flex font-bold text-xl mb-3 relative items-center">
          <span className="mr-4 w-6 h-6 shrink-0">{icon}</span> {title}
          <div className="absolute right-0">{right}</div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

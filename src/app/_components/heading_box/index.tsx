export const HeadingBox = ({ subtitle, title, icon, info, progress, iconTooltip }: any) => {
  return (
    <div className="bg-white p-2 h-full flex items-center custom-heading-box-clip-path">
      <div className="px-2 py-1 md:py-2 flex items-center">
        {iconTooltip ? (
          <div className="mr-4">
            <div data-tooltip-id="tooltip" data-tooltip-content={iconTooltip}>
              {icon}
            </div>
          </div>
        ) : (
          <div className="mr-4">{icon}</div>
        )}
        {title && subtitle && (
          <div className="flex flex-col text-base-black">
            <div className="font-bold">{title}</div>
            {progress && (
              <div className="flex items-center mb-2 mt-[3px]">
                {Array(progress[1])
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`mr-1 ${i < progress[0] ? "bg-secondary-110 border-2 border-secondary-110 w-[10px] h-[10px]" : "w-[7px] h-[7px] bg-gray-300"}`}
                    ></div>
                  ))}
              </div>
            )}
            <div className="text-xs text-base-gray">{subtitle}</div>
          </div>
        )}

        {info &&
          info.map(({ title, subtitle }: any, i: number) => (
            <div className={`flex flex-col text-base-black ${i > 0 && "ml-4"}`} key={i}>
              <div className="font-bold">{title}</div>
              <div className="text-xs text-base-gray">{subtitle}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

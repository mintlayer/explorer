import Link from "next/link";

const MLink = ({ href, children, className, ...props }: any) => {
  const prefix = "";

  return (
    <Link href={prefix + href} className={className} {...props}>
      {children}
    </Link>
  );
};

export default MLink;

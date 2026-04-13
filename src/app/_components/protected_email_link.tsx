"use client";

import { useEffect, useState } from "react";

type ProtectedEmailLinkProps = {
  className?: string;
  encoded: number[];
  label: string;
};

export function ProtectedEmailLink({ className, encoded, label }: ProtectedEmailLinkProps) {
  const [href, setHref] = useState<string>();

  useEffect(() => {
    const email = String.fromCharCode(...encoded);
    setHref(`mailto:${email}`);
  }, [encoded]);

  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

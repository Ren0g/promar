"use client";

import Link from "next/link";

export default function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  ...rest
}) {
  const className = `btn btn-${variant}`;

  if (href) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={className} {...rest}>
      {children}
    </button>
  );
}
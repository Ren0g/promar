"use client";

import Link from "next/link";

export default function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  className = "",
  ...rest
}) {
  // Spojimo klase pravilno: default + variant + dodatne
  const finalClass = `btn btn-${variant} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={finalClass} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={finalClass} {...rest}>
      {children}
    </button>
  );
}

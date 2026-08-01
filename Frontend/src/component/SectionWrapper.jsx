import React from "react";

export default function SectionWrapper({
  background = "",
  border = "",
  padding = "",
  className = "",
  children,
  ...props
}) {
  return (
    <section
      className={`w-full max-w-full min-w-0 ${background} ${border} ${padding} ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}


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
      className={`${background} ${border} ${padding} ${className} min-h-0 content-scroll overflow-x-hidden w-full`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}

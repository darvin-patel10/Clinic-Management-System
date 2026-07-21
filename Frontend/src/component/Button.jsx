import React from "react";

export default function Button({
  type = "button",
  onClick,
  background = "bg-[rgba(39,57,65,1)]",
  border = "border border-[rgba(255,255,255,0.3)]",
  padding,
  className = "font-semibold uppercase w-full",
  children,
  disabled = false,
}) {
  const hoverClass = border !== "border-none" ? "btn-hover transition-all" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`text-xs text-white ${padding ? padding : "p-3 py-2"
        } ${background} ${border} rounded-[0.45rem] rounded-md ${
          disabled
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "cursor-pointer"
        } ${disabled ? "border border-white/60" : hoverClass} ${className}`}
    >
      {children}
    </button>
  );
}

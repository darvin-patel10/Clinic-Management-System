import React from "react";

const InputField = React.forwardRef(function InputField(
  {
    type = "text",
    placeholder,
    background = "bg-slate-50/70 focus:bg-white",
    border = "border border-slate-200 focus:border-blue-500",
    padding = "px-3.5 h-10",
    className = "",
    value,
    name,
    maxLength,
    readOnly,
    disabled,
    onChange,
    onKeyDown,
    onPaste,
    icon: Icon,
    iconPosition = "left",
    ...rest
  },
  ref,
) {
  const iconPaddingLeft = Icon && iconPosition === "left" ? "pl-10" : "";
  const iconPaddingRight = Icon && iconPosition === "right" ? "pr-10" : "";

  const baseClasses = `w-full rounded-xl text-xs sm:text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${background} ${border} ${padding} ${iconPaddingLeft} ${iconPaddingRight} ${className}`.trim();

  if (!Icon) {
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        name={name}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={readOnly}
        disabled={disabled}
        className={baseClasses}
        {...rest}
      />
    );
  }

  return (
    <div className="relative w-full">
      {iconPosition === "left" && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <Icon className="w-4 h-4 shrink-0" />
        </span>
      )}
      <input
        ref={ref}
        type={type}
        value={value}
        name={name}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        maxLength={maxLength}
        readOnly={readOnly}
        disabled={disabled}
        className={baseClasses}
        {...rest}
      />
      {iconPosition === "right" && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <Icon className="w-4 h-4 shrink-0" />
        </span>
      )}
    </div>
  );
});

export default InputField;

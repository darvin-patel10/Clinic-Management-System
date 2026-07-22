import React from "react";

const InputField = React.forwardRef(function InputField(
  {
    type = "text",
    placeholder,
    background = "bg-slate-50",
    border = "border border-slate-200",
    padding = "px-3.5 h-10",
    className = "w-full rounded-xl text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-colors",
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
  const iconPaddingLeft = Icon && iconPosition === "left" ? "pl-9" : "";
  const iconPaddingRight = Icon && iconPosition === "right" ? "pr-9" : "";

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
        className={`${background} ${border} ${padding} ${className}`}
        {...rest}
      />
    );
  }

  return (
    <div className="relative w-full">
      {iconPosition === "left" && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <Icon className="w-4 h-4" />
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
        className={`${background} ${border} ${padding} ${iconPaddingLeft} ${iconPaddingRight} ${className}`}
        {...rest}
      />
      {iconPosition === "right" && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <Icon className="w-4 h-4" />
        </span>
      )}
    </div>
  );
});

export default InputField;

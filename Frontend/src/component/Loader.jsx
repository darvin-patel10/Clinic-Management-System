import { Loader as LoaderIcon } from "../assets/Icons/index.js";

/**
 * Loader — reusable animated spinner component
 *
 * Renders the `laoder.svg` SVGR Component.
 *
 * Props:
 *   className  – extra Tailwind classes (override size / color / margin)
 *                default: "w-5 h-5"
 *   label      – accessible label for screen-readers
 *                default: "Loading"
 *   ...rest    – any other <span> props (e.g. aria-hidden, data-*)
 */
export default function Loader({
    className = "w-5 h-5",
    label = "Loading",
    ...rest
}) {
    return (
        <span
            role="status"
            aria-label={label}
            className={`animate-spin inline-flex shrink-0 ${className}`}
            {...rest}
        >
            <LoaderIcon className="w-full h-full block" />
        </span>
    );
}

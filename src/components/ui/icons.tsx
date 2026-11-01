import type { SVGProps } from "react";

// 14px line icons. Everything else is drawn with PixelIcon (components/graphics).
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 14, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="square"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M1.5 7h10M8 3.5 11.5 7 8 10.5" />
  </Icon>
);
export const ArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 10.5l7-7M5 3.5h5.5V9" />
  </Icon>
);
export const CopyIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 4.5h7v7h-7zM2.5 9.5v-7h7" />
  </Icon>
);
export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 7.5 5.5 10.5 11.5 3.5" />
  </Icon>
);
export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 2v10M2 7h10" />
  </Icon>
);
export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 3l8 8M11 3l-8 8" />
  </Icon>
);
export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M1.5 4h11M1.5 10h11" />
  </Icon>
);
export const ChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 5.5 7 9l3.5-3.5" />
  </Icon>
);

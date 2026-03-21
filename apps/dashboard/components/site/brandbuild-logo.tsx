import Image from "next/image";

type BrandbuildLogoProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  variant?: "full" | "mark";
};

const logoSourceByVariant = {
  full: {
    height: 180,
    src: "/brandbuild-logo.svg",
    width: 760,
  },
  mark: {
    height: 512,
    src: "/brandbuild-mark.svg",
    width: 512,
  },
} as const;

export function BrandbuildLogo({
  alt = "BrandBuild",
  className,
  priority = false,
  variant = "full",
}: BrandbuildLogoProps) {
  const source = logoSourceByVariant[variant];

  return (
    <Image
      alt={alt}
      className={className}
      height={source.height}
      priority={priority}
      src={source.src}
      width={source.width}
    />
  );
}

type SectionHeadingProps = {
  align?: "left" | "center";
  description?: string;
  eyebrow: string;
  title: string;
};

export function SectionHeading({
  align = "left",
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl space-y-5 ${alignment}`}>
      <span className="eyebrow">{eyebrow}</span>
      <div className="space-y-3">
        <h2 className="display-font text-4xl leading-none text-white sm:text-5xl">{title}</h2>
        {description ? (
          <p className="text-base leading-8 text-[var(--text-muted)] sm:text-lg">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

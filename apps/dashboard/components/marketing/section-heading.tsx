type SectionHeadingProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function SectionHeading({ description, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-4">
      <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
        {eyebrow}
      </span>
      <div className="space-y-3">
        <h2 className="display-font text-4xl leading-none text-slate-950 sm:text-5xl">{title}</h2>
        <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
      </div>
    </div>
  );
}

export default function SectionTitle({
  kicker,
  title,
  subtitle,
  align = "left",
  titleAs = "h2",
  titleClassName = ""
}) {
  const TitleTag = titleAs;
  const titleClasses = [titleClassName].filter(Boolean).join(" ");

  return (
    <div className={`section-title section-title-${align}`}>
      {kicker && <p className="section-kicker">{kicker}</p>}
      {title && <TitleTag className={titleClasses}>{title}</TitleTag>}
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}

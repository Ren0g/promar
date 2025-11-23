export default function SectionTitle({
  kicker,
  title,
  subtitle,
  align = "left"
}) {
  return (
    <div className={`section-title section-title-${align}`}>
      {kicker && <p className="section-kicker">{kicker}</p>}
      {title && <h2>{title}</h2>}
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}
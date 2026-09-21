import Image from "next/image";

export default function ReferenceMockup({ src, alt, url }) {
  return (
    <div className="reference-browser-mockup">
      <div className="reference-browser-bar" aria-hidden="true">
        <span className="reference-browser-dots">
          <span />
          <span />
          <span />
        </span>
        <span className="reference-browser-address">{url}</span>
      </div>
      <div className="reference-browser-screen">
        <Image
          src={src}
          alt={alt}
          className="reference-image"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 33vw"
          unoptimized
        />
      </div>
    </div>
  );
}

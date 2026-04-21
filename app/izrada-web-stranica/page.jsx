import Button from "../../components/Button";
import SectionTitle from "../../components/SectionTitle";

export const metadata = {
  title: "Izrada web stranica za firme i obrte | Promar",
  description:
    "Landing stranica za uslugu izrade web stranica za firme i obrte. Jasna cijena, jasan proces i moderan web bez kompliciranja."
};

const packages = [
  {
    name: "Starter",
    price: "299 €",
    description: "Za jednostavnu web stranicu koja treba izgledati uredno i profesionalno.",
    features: [
      "do 3 sekcije ili 1 jednostavna stranica",
      "responzivan prikaz za mobitel i tablet",
      "kontakt podaci i osnovni CTA",
      "osnovna SEO podešenja",
      "objava stranice"
    ]
  },
  {
    name: "Standard",
    price: "549 €",
    description: "Za firme i obrte kojima treba ozbiljnija prezentacija i više sadržaja.",
    features: [
      "do 5 podstranica",
      "prilagođen dizajn i jasna struktura",
      "kontakt forma",
      "galerija ili reference",
      "tehnička SEO podešenja"
    ],
    featured: true
  },
  {
    name: "Napredno",
    price: "po ponudi",
    description: "Za projekte s više sadržaja, dodatnim jezicima ili posebnim funkcionalnostima.",
    features: [
      "više podstranica i sekcija",
      "blog ili CMS",
      "višejezičnost",
      "naprednije forme i integracije",
      "prilagodba prema projektu"
    ]
  }
];

const references = [
  {
    image: "/images/reference-fotqa.jpg",
    alt: "Fotqa referenca",
    title: "Fotqa",
    text: "Primjer čistog i vizualno jakog web nastupa za foto i video studio."
  },
  {
    image: "/images/reference-svadba.jpg",
    alt: "Svadba.app referenca",
    title: "Svadba.app",
    text: "Projekt koji pokazuje da iza Promara ne stoje samo obične stranice nego i ozbiljnija digitalna rješenja."
  },
  {
    image: "/images/reference-vjencanja.jpg",
    alt: "Promar referenca",
    title: "Tvornica vjenčanja",
    text: "Sadržajni i pregledni web s jasnom strukturom i fokusom na korisničko iskustvo."
  }
];

const process = [
  "Kratko dogovorimo što vam stvarno treba.",
  "Složimo strukturu, sadržaj i izgled stranice.",
  "Napravimo web i prilagodimo ga za mobitele.",
  "Pregledate, javite izmjene i objavimo stranicu."
];

const faq = [
  {
    q: "Je li 299 € konačna cijena?",
    a: "Ne uvijek. 299 € je ulazna cijena za jednostavnu stranicu. Ako treba više podstranica, više jezika ili dodatne funkcionalnosti, cijena ide prema paketu ili ponudi."
  },
  {
    q: "Koliko traje izrada?",
    a: "Za jednostavnije stranice najčešće 5 do 10 radnih dana, ovisno o sadržaju i brzini povratnih informacija."
  },
  {
    q: "Što trebam pripremiti?",
    a: "Najčešće logo, osnovne podatke o firmi, tekstove i kontakt podatke. Ako nešto nedostaje, dogovorimo kako to riješiti."
  },
  {
    q: "Radite li i održavanje?",
    a: "Da. Nakon izrade možemo preuzeti manje izmjene, nadogradnje i osnovno održavanje po dogovoru."
  }
];

export default function WebDesignLandingPage() {
  return (
    <>
      <section className="landing-hero section">
        <div className="container landing-hero-inner">
          <div className="landing-hero-content">
            <p className="landing-kicker">IZRADA WEB STRANICA</p>
            <h1>Web stranice za firme i obrte, jasno i bez kompliciranja.</h1>
            <p className="landing-lead">
              Radimo moderne, pregledne i mobilno prilagođene web stranice
              koje izgledaju ozbiljno i jasno komuniciraju što radite.
            </p>

            <ul className="landing-checks">
              <li>Moderna i pregledna</li>
              <li>Prilagođena mobilnim uređajima</li>
              <li>Cijena već od 299 €</li>
            </ul>

            <div className="landing-actions">
              <Button href="/kontakt" variant="primary">
                Pošaljite upit
              </Button>
              <Button href="#paketi" variant="secondary">
                Pogledaj pakete
              </Button>
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-visual-card landing-visual-main">
              <img src="/images/reference-svadba.jpg" alt="Primjer web projekta" />
            </div>
            <div className="landing-visual-card landing-visual-left">
              <img src="/images/reference-fotqa.jpg" alt="Fotqa projekt" />
            </div>
            <div className="landing-visual-card landing-visual-right">
              <img src="/images/reference-vjencanja.jpg" alt="Tvornica vjenčanja projekt" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="ZA KOGA JE OVO"
            title="Za male firme, obrte i uslužne djelatnosti kojima treba ozbiljan web"
            subtitle="Ako nemate web, imate zastarjelu stranicu ili želite jasniji i moderniji nastup, ovo je usluga s kojom najbrže možete krenuti."
          />

          <div className="landing-audience-grid">
            <div className="card">
              <h3>Obrti i lokalne usluge</h3>
              <p>Frizeri, saloni, servisi, prijevoznici, apartmani, ugostitelji i slične djelatnosti.</p>
            </div>
            <div className="card">
              <h3>Male firme</h3>
              <p>Tvrtke kojima treba ozbiljna prezentacija usluga, reference i jasan kontakt.</p>
            </div>
            <div className="card">
              <h3>Brendovi koji rastu</h3>
              <p>Projekti kojima treba jača struktura, više sadržaja i prostor za daljnji razvoj.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="paketi" className="section">
        <div className="container">
          <SectionTitle
            kicker="PAKETI"
            title="Jasno definirani paketi i realne cijene"
            subtitle="Bez muljanja i bez nejasnih stavki. Ako projekt izlazi iz okvira, cijena ide po ponudi."
          />

          <div className="landing-packages-grid">
            {packages.map((item) => (
              <article
                key={item.name}
                className={`landing-package-card ${item.featured ? "featured" : ""}`}
              >
                {item.featured && <span className="landing-badge">Najčešći izbor</span>}
                <h3>{item.name}</h3>
                <p className="landing-package-price">{item.price}</p>
                <p className="landing-package-description">{item.description}</p>
                <ul className="landing-package-list">
                  {item.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="landing-note-box">
            <strong>U cijenu nisu uključeni:</strong> domena, hosting, plaćeni pluginovi,
            profesionalni tekstovi, prijevodi, webshop i custom web aplikacije.
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="KAKO RADIMO"
            title="Proces je jednostavan i brz"
            subtitle="Cilj nije da vas zatrpamo terminima, nego da što prije dođete do gotove stranice."
          />

          <div className="landing-steps-grid">
            {process.map((step, index) => (
              <div key={step} className="landing-step-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            kicker="REFERENCE"
            title="Projekti koji pokazuju stil i smjer"
            subtitle="Promar gradi moderan, pregledan i funkcionalan web nastup, a to se vidi i na stvarnim projektima."
          />

          <div className="landing-references-grid">
            {references.map((item) => (
              <article key={item.title} className="reference-card">
                <img src={item.image} alt={item.alt} className="reference-image" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="ČESTA PITANJA"
            title="Odmah odgovori na ono što ljude najčešće zanima"
          />

          <div className="landing-faq-grid">
            {faq.map((item) => (
              <article key={item.q} className="landing-faq-item">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section landing-final-cta">
        <div className="container landing-final-cta-inner">
          <div>
            <p className="landing-kicker">KREĆEMO?</p>
            <h2>Trebate web stranicu za firmu ili obrt?</h2>
            <p>
              Pošaljite upit i javimo vam što točno ulazi u izradu, koji paket
              ima smisla i koliko brzo možemo krenuti.
            </p>
          </div>
          <div className="landing-final-actions">
            <Button href="/kontakt" variant="primary">
              Zatražite ponudu
            </Button>
            <a className="landing-email-link" href="mailto:info@promar.hr">
              info@promar.hr
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

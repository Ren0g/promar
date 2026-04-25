export const metadata = {
  title: "Izrada web stranica | Promar",
  description:
    "Izrada modernih, preglednih i mobilno prilagođenih web stranica za firme i obrte. Jasna ponuda, realna cijena i brza isporuka."
};

import Button from "../../components/Button";

const paketi = [
  {
    naziv: "Starter",
    cijena: "od 299 €",
    opis: "Za jednostavnu prezentacijsku stranicu ili mali obrt kojem treba uredan online nastup.",
    stavke: [
      "do 3 sekcije ili 1 jednostavna stranica",
      "responzivan prikaz za mobitel i tablet",
      "osnovna kontakt forma",
      "osnovni unos sadržaja"
    ]
  },
  {
    naziv: "Standard",
    cijena: "od 550 €",
    opis: "Za firme i obrte kojima treba ozbiljnija struktura, više sadržaja i bolja prezentacija usluga.",
    stavke: [
      "do 5 podstranica",
      "jasna struktura usluga i sadržaja",
      "kontakt forma i osnovni SEO",
      "povezivanje društvenih mreža"
    ]
  },
  {
    naziv: "Premium",
    cijena: "od 850 €",
    opis: "Za projekte kojima treba više sadržaja, više funkcionalnosti i jači ukupni dojam.",
    stavke: [
      "više podstranica i sekcija",
      "napredniji layout i vizualni dojam",
      "dodatne funkcionalnosti po potrebi",
      "proširena priprema za daljnji rast"
    ]
  }
];

const koraci = [
  {
    naslov: "1. Kratak dogovor",
    opis: "Pošaljete što trebate, a mi javimo što ima smisla i koja je realna procjena."
  },
  {
    naslov: "2. Izrada dizajna i strukture",
    opis: "Slažemo stranicu tako da izgleda ozbiljno i jasno komunicira što radite."
  },
  {
    naslov: "3. Dorade i objava",
    opis: "Nakon potvrde unosimo završne izmjene i pripremamo stranicu za objavu."
  }
];

const faq = [
  {
    pitanje: "Je li 299 € konačna cijena?",
    odgovor:
      "Ne uvijek. 299 € je početna cijena za vrlo jednostavnu stranicu. Ako treba više sadržaja, podstranica ili dodatnih funkcionalnosti, cijena raste prema opsegu posla."
  },
  {
    pitanje: "Koliko traje izrada?",
    odgovor:
      "Za jednostavne stranice najčešće od nekoliko dana do dva tjedna, ovisno o materijalima i brzini komunikacije."
  },
  {
    pitanje: "Radite li i tekstove, vizuale i marketing?",
    odgovor:
      "Da. Promar uz izradu web stranica radi i aplikacije, digitalni marketing te vizualne materijale, po dogovoru."
  }
];

export default function IzradaWebStranicaPage() {
  return (
    <>
      <section className="web-hero">
        <div className="container web-hero-inner">
          <div className="web-hero-copy">
            <p className="web-hero-kicker">Izrada web stranica</p>
            <h1>Web stranice za firme i obrte, jasno i bez kompliciranja.</h1>
            <p className="web-hero-text">
              Radimo moderne, pregledne i mobilno prilagođene web stranice koje
              izgledaju ozbiljno i jasno komuniciraju što radite.
            </p>

            <ul className="web-hero-list">
              <li>Moderna i pregledna</li>
              <li>Prilagođena mobilnim uređajima</li>
              <li>Cijena već od 299 €</li>
            </ul>

            <div className="web-hero-actions">
              <Button href="/kontakt" variant="primary">
                Pošaljite upit
              </Button>
              <a href="#paketi" className="btn btn-secondary">
                Pogledaj pakete
              </a>
            </div>
          </div>

          <div className="web-hero-media">
            <img
              src="/images/websites-hero-mockup.png"
              alt="Mockup primjera web stranica koje izrađuje Promar"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container web-proof">
          <div className="web-proof-card">
            <h2>Za koga je ova ponuda?</h2>
            <p>
              Za male firme, obrte i uslužne djelatnosti kojima treba uredna i
              funkcionalna web stranica bez razvlačenja i nepotrebnih
              komplikacija.
            </p>
          </div>
          <div className="web-proof-card">
            <h2>Što dobivate?</h2>
            <p>
              Jasnu strukturu, responzivan prikaz, moderan izgled i stranicu
              koja ostavlja ozbiljniji dojam nego improvizirano rješenje.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="paketi">
        <div className="container">
          <div className="section-title">
            <p className="section-kicker">Paketi</p>
            <h2>Odaberite paket koji ima smisla za vaš projekt</h2>
            <p className="section-subtitle">
              Ako projekt izlazi iz okvira ovih paketa, cijena se definira prema
              stvarnom opsegu posla.
            </p>
          </div>

          <div className="web-packages">
            {paketi.map((paket) => (
              <article className="web-package-card" key={paket.naziv}>
                <div className="web-package-head">
                  <h3>{paket.naziv}</h3>
                  <span>{paket.cijena}</span>
                </div>
                <p>{paket.opis}</p>
                <ul className="list-check web-package-list">
                  {paket.stavke.map((stavka) => (
                    <li key={stavka}>{stavka}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <p className="section-kicker">Kako radimo</p>
            <h2>Bez kaosa i bez nepotrebnog razvlačenja</h2>
          </div>

          <div className="web-steps">
            {koraci.map((korak) => (
              <div className="web-step" key={korak.naslov}>
                <h3>{korak.naslov}</h3>
                <p>{korak.opis}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-title">
            <p className="section-kicker">Česta pitanja</p>
            <h2>Ono što ljude najčešće zanima prije upita</h2>
          </div>

          <div className="web-faq">
            {faq.map((item) => (
              <article className="web-faq-item" key={item.pitanje}>
                <h3>{item.pitanje}</h3>
                <p>{item.odgovor}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="article-feature-card article-feature-inline">
            <div className="article-feature-media">
              <img
                src="/images/savjeti-web-stranica.png"
                alt="Moderna web stranica prikazana na laptopu i mobitelu"
              />
            </div>

            <div className="article-feature-content">
              <p className="section-kicker">KORISNI SAVJETI</p>
              <h2>Niste sigurni treba li vam web stranica?</h2>
              <p>
                Pripremili smo kratki vodič za obrte i male firme: zašto web
                stranica nije trošak, nego digitalni izlog koji radi za vas.
              </p>

              <div className="article-feature-actions">
                <Button
                  href="/savjeti/izrada-web-stranica-za-obrte-male-firme"
                  variant="primary"
                >
                  Pročitajte članak
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cta">
        <div className="container cta-inner">
          <div>
            <h2>Trebate web stranicu?</h2>
            <p>Pošaljite upit i javimo vam što ima smisla za vaš projekt.</p>
          </div>
          <Button href="/kontakt" variant="primary">
            Zatražite ponudu
          </Button>
        </div>
      </section>
    </>
  );
}

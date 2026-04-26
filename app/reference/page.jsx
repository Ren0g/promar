export const metadata = {
  title: "Primjeri radova | Promar – web stranice i aplikacije",
  description:
    "Primjeri web stranica, platformi i aplikacija: Fotqa, Tvornica vjenčanja, Svadba.app i Zimska liga Panadić."
};

import SectionTitle from "../../components/SectionTitle";
import Button from "../../components/Button";

const projekti = [
  {
    naziv: "Fotqa",
    slika: "/images/reference-fotqa.jpg",
    alt: "Fotqa primjer rada",
    opis:
      "Web, vizualni smjer, sadržaj i predstavljanje usluge za foto/video produkciju.",
    link: "https://fotqa.com",
    label: "fotqa.com"
  },
  {
    naziv: "Tvornica vjenčanja",
    slika: "/images/reference-vjencanja.jpg",
    alt: "Tvornica vjenčanja primjer rada",
    opis:
      "Wedding platforma i zajednica: web, sadržaj, vizuali i struktura koja povezuje mladence s dobavljačima.",
    link: "https://tvornicavjencanja.hr",
    label: "tvornicavjencanja.hr"
  },
  {
    naziv: "Svadba.app",
    slika: "/images/reference-svadba.jpg",
    alt: "Svadba.app primjer aplikacije",
    opis:
      "Web aplikacija za organizaciju vjenčanja s modulima za zadatke, budžet, goste, plan sjedenja, dobavljače, uplate i QR galeriju.",
    link: "https://svadba.app",
    label: "svadba.app"
  },
  {
    naziv: "Zimska liga Panadić",
    slika: "/images/reference-panadic.jpg",
    alt: "Zimska liga Panadić primjer aplikacije",
    opis:
      "Aplikacija za praćenje rezultata, tablica i rasporeda sportske lige, prilagođena korištenju na mobitelu.",
    link: "https://panadic.vercel.app",
    label: "panadic.vercel.app"
  }
];

export default function ReferencePage() {
  return (
    <>
      <section className="section section-alt page-hero-section">
        <div className="container">
          <SectionTitle
            kicker="PRIMJERI RADOVA"
            title="Primjeri radova koji pokazuju što možemo napraviti"
            subtitle="Ovdje su prikazane web stranice, platforme i aplikacije kroz koje se vidi način razmišljanja, struktura, dizajn i funkcionalnosti koje možemo primijeniti i na Vaš projekt."
            titleAs="h1"
            titleClassName="page-main-title"
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="references-grid">
            {projekti.map((projekt) => (
              <div className="reference-card" key={projekt.naziv}>
                <img
                  src={projekt.slika}
                  alt={projekt.alt}
                  className="reference-image"
                />
                <h3>{projekt.naziv}</h3>
                <p>{projekt.opis}</p>
                <p>
                  <a href={projekt.link} target="_blank" rel="noreferrer">
                    {projekt.label}
                  </a>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="ŠTO TO ZNAČI ZA VAŠ PROJEKT"
            title="Ne morate imati isti tip weba — bitan je princip"
            subtitle="Kod svakog projekta prvo gledamo cilj: više upita, bolja prezentacija, rezervacije, prodaja, automatizacija ili jednostavnije upravljanje informacijama. Tek onda predlažemo strukturu i funkcionalnosti."
          />

          <ul className="list-check">
            <li>Za jednostavne usluge dovoljna je jasna landing stranica.</li>
            <li>Za više usluga bolja je struktura s podstranicama.</li>
            <li>Za procese i rezervacije razmatramo dodatne funkcionalnosti.</li>
            <li>Za ozbiljniji dojam važni su tekst, fotografije i dobra hijerarhija sadržaja.</li>
          </ul>
        </div>
      </section>

      <section className="section section-cta">
        <div className="container cta-inner">
          <div>
            <h2>Želite sličan pristup za svoj projekt?</h2>
            <p>Pošaljite opis posla i predložit ćemo strukturu koja odgovara Vašem cilju.</p>
          </div>
          <Button href="/kontakt" variant="primary">
            Zatražite prijedlog
          </Button>
        </div>
      </section>
    </>
  );
}

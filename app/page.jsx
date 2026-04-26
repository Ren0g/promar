export const metadata = {
  title: "Promar – izrada web stranica za obrte i male firme",
  description:
    "Promar izrađuje moderne web stranice, web aplikacije i digitalna rješenja za obrte, male firme i uslužne djelatnosti. Jasna struktura, konkretna ponuda i fokus na upite."
};

import Button from "../components/Button";
import SectionTitle from "../components/SectionTitle";

const problemi = [
  {
    naslov: "Klijenti Vas ne mogu brzo procijeniti",
    opis:
      "Ako nemate web ili je stranica zastarjela, potencijalni klijent teško zna što nudite, gdje radite i zašto bi se javio baš Vama."
  },
  {
    naslov: "Društvene mreže nisu dovoljne",
    opis:
      "Facebook i Instagram su korisni, ali web stranica je Vaša glavna online adresa. Ona ostaje dostupna i kada objave više nisu vidljive."
  },
  {
    naslov: "Stranica mora voditi prema upitu",
    opis:
      "Lijep dizajn nije dovoljan. Posjetitelj mora brzo razumjeti ponudu, vidjeti dokaz ozbiljnosti i lako poslati upit."
  }
];

const usluge = [
  {
    naslov: "Web stranice za obrte i firme",
    opis:
      "Prezentacijske stranice, landing stranice i poslovni webovi s jasnom strukturom, mobilnom prilagodbom i osnovnom SEO pripremom."
  },
  {
    naslov: "Web aplikacije i funkcionalnosti",
    opis:
      "Jednostavni sustavi, forme, dashboardi, rezervacije, interni alati i funkcionalnosti koje standardna web stranica ne može pokriti."
  },
  {
    naslov: "Sadržaj, vizuali i marketing",
    opis:
      "Tekstovi, vizuali, foto/video materijali i digitalni marketing za projekte kojima treba više od same izrade stranice."
  }
];

const paketi = [
  {
    naziv: "Starter",
    cijena: "od 299 €",
    opis: "Za jednostavnu web stranicu ili obrt koji želi uredan početak."
  },
  {
    naziv: "Standard",
    cijena: "od 550 €",
    opis: "Za firme kojima treba više sadržaja, jasnija struktura i bolja prezentacija usluga."
  },
  {
    naziv: "Premium",
    cijena: "od 850 €",
    opis: "Za projekte kojima treba jači vizualni dojam, više sekcija ili dodatne funkcionalnosti."
  }
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <p className="hero-kicker">
              Izrada web stranica za obrte, firme i uslužne djelatnosti
            </p>

            <h1 className="page-main-title fade-in">
              Izrađujemo web stranice koje jasno pokazuju što nudite i potiče klijente da pošalju upit.
            </h1>

            <p className="hero-subtitle fade-in-delay">
              Promar izrađuje moderne i pregledne web stranice za male firme,
              obrte i projekte kojima treba ozbiljniji online nastup — od jednostavne
              prezentacije do web aplikacije.
            </p>

            <div className="hero-actions fade-in-slow">
              <Button href="/kontakt" variant="primary" className="glow">
                Zatražite okvirnu ponudu
              </Button>
              <Button href="/izrada-web-stranica" variant="secondary">
                Pogledajte pakete
              </Button>
            </div>
          </div>

          <div className="hero-media">
            <img src="/images/hero-image.jpg" alt="Promar izrada web stranica" />
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="PROBLEM"
            title="Dobar web ne smije biti samo online vizitka"
            subtitle="Ako stranica ne objašnjava ponudu, ne gradi povjerenje i ne vodi prema kontaktu, onda ne radi svoj posao."
          />

          <div className="cards-grid">
            {problemi.map((problem) => (
              <div className="card" key={problem.naslov}>
                <h3>{problem.naslov}</h3>
                <p>{problem.opis}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container home-about">
          <SectionTitle
            kicker="RJEŠENJE"
            title="Stranicu slažemo kao prodajni put, ne kao skup lijepih blokova"
            subtitle="Prvo definiramo što posjetitelj mora shvatiti u prvih nekoliko sekundi. Zatim slažemo strukturu: ponuda, koristi, primjeri, način rada i jasan poziv na upit. Tako web postaje alat koji pomaže prodaji, a ne samo trošak."
          />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="USLUGE"
            title="Od jednostavne web stranice do konkretnog digitalnog rješenja"
            subtitle="Krenite s onim što Vam stvarno treba. Ako projekt kasnije naraste, web se može nadograditi."
          />

          <div className="cards-grid">
            {usluge.map((usluga) => (
              <div className="card" key={usluga.naslov}>
                <h3>{usluga.naslov}</h3>
                <p>{usluga.opis}</p>
              </div>
            ))}
          </div>

          <div className="section-cta-centered">
            <Button href="/usluge" variant="secondary">
              Pogledajte sve usluge
            </Button>
          </div>
        </div>
      </section>

      <section className="section" id="paketi">
        <div className="container">
          <SectionTitle
            kicker="PAKETI"
            title="Jasni paketi za različite faze poslovanja"
            subtitle="Ne morate odmah raditi veliki web. Važno je odabrati opseg koji ima smisla za Vaš posao, budžet i cilj."
          />

          <div className="web-packages">
            {paketi.map((paket) => (
              <article className="web-package-card" key={paket.naziv}>
                <div className="web-package-head">
                  <h3>{paket.naziv}</h3>
                  <span>{paket.cijena}</span>
                </div>
                <p>{paket.opis}</p>
              </article>
            ))}
          </div>

          <div className="section-cta-centered">
            <Button href="/izrada-web-stranica" variant="primary">
              Provjerite što uključuju paketi
            </Button>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="article-feature-card">
            <div className="article-feature-media">
              <img
                src="/images/savjeti-web-stranica.png"
                alt="Moderna web stranica prikazana na laptopu i mobitelu"
              />
            </div>

            <div className="article-feature-content">
              <p className="section-kicker">KORISNO PRIJE ODLUKE</p>
              <h2>Što web stranica treba napraviti za Vaš obrt ili firmu?</h2>
              <p>
                Pripremili smo vodič koji objašnjava zašto web nije samo trošak,
                nego mjesto na kojem potencijalni klijent procjenjuje ozbiljnost,
                razumije ponudu i odlučuje hoće li se javiti.
              </p>

              <div className="article-feature-actions">
                <Button
                  href="/savjeti/izrada-web-stranica-za-obrte-male-firme"
                  variant="primary"
                >
                  Pročitajte vodič
                </Button>
                <Button href="/savjeti" variant="secondary">
                  Svi savjeti
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            kicker="PRIMJERI RADOVA"
            title="Primjeri radova koji pokazuju način rada"
            subtitle="Prikazujemo projekte i platforme kroz koje se vidi pristup strukturi, dizajnu, sadržaju i funkcionalnostima — od prezentacijskih stranica do web aplikacija."
          />

          <div className="references-grid">
            <div className="reference-card">
              <img
                src="/images/reference-fotqa.jpg"
                alt="Fotqa primjer rada"
                className="reference-image"
              />
              <h3>Fotqa</h3>
              <p>Web, vizualni identitet i sadržaj za foto/video produkciju.</p>
            </div>

            <div className="reference-card">
              <img
                src="/images/reference-vjencanja.jpg"
                alt="Tvornica vjenčanja primjer rada"
                className="reference-image"
              />
              <h3>Tvornica vjenčanja</h3>
              <p>Web i sadržaj za wedding zajednicu i povezivanje mladenaca s dobavljačima.</p>
            </div>

            <div className="reference-card">
              <img
                src="/images/reference-svadba.jpg"
                alt="Svadba.app primjer aplikacije"
                className="reference-image"
              />
              <h3>Svadba.app</h3>
              <p>
                Web aplikacija za organizaciju vjenčanja s modulima za zadatke,
                budžet, goste, plan sjedenja i galeriju.
              </p>
            </div>
          </div>

          <div className="section-cta-centered">
            <Button href="/reference" variant="secondary">
              Pogledajte primjere radova
            </Button>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="ZAŠTO PROMAR"
            title="Manje praznih obećanja, više jasne izvedbe"
          />

          <ul className="list-check">
            <li>Jasno definirani paketi i realan opseg posla.</li>
            <li>Direktna komunikacija, bez prebacivanja između odjela.</li>
            <li>Struktura stranice prilagođena cilju: upit, poziv, rezervacija ili prezentacija usluge.</li>
            <li>Mogućnost izrade vizuala, fotografija, videa i dodatnog sadržaja.</li>
            <li>Iskustvo u web projektima, aplikacijama i digitalnim platformama.</li>
          </ul>
        </div>
      </section>

      <section className="section section-cta">
        <div className="container cta-inner">
          <div>
            <h2>Pošaljite osnovne podatke o projektu.</h2>
            <p>Predložit ćemo opseg koji ima smisla i okvirnu cijenu prije početka izrade.</p>
          </div>
          <Button href="/kontakt" variant="primary">
            Zatražite ponudu
          </Button>
        </div>
      </section>
    </>
  );
}

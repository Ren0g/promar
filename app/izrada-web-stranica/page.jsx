export const metadata = {
  title: "Izrada web stranica za obrte i male firme | Promar",
  description:
    "Izrada modernih, preglednih i mobilno prilagođenih web stranica za firme i obrte. Paketi već od 299 €, jasna struktura i konkretan opseg."
};

import Button from "../../components/Button";

const paketi = [
  {
    naziv: "Starter",
    cijena: "od 299 €",
    oznaka: "Za brz i uredan početak",
    opis:
      "Za obrt, uslugu ili mali projekt kojem treba jednostavna stranica koja objašnjava ponudu i omogućuje brz kontakt.",
    stavke: [
      "do 3 sekcije ili 1 jednostavna stranica",
      "prilagodba za mobitel i tablet",
      "osnovna kontakt forma ili CTA za poziv/poruku",
      "osnovni unos sadržaja",
      "osnovna SEO priprema"
    ],
    nije: [
      "pisanje opširnih tekstova",
      "više podstranica",
      "velike galerije",
      "više jezika",
      "napredne funkcionalnosti"
    ]
  },
  {
    naziv: "Standard",
    cijena: "od 550 €",
    oznaka: "Najbolji izbor za većinu firmi",
    opis:
      "Za firme i obrte kojima treba jasnija struktura, više sadržaja i kvalitetnija prezentacija usluga.",
    stavke: [
      "do 5 podstranica",
      "razrada strukture usluga",
      "kontakt forma i osnovni SEO",
      "povezivanje društvenih mreža",
      "priprema sadržaja za bolji prvi dojam"
    ],
    nije: ["webshop", "sustav rezervacija", "custom aplikacija", "kompletno vođenje marketinga"]
  },
  {
    naziv: "Premium",
    cijena: "od 850 €",
    oznaka: "Za ozbiljniji nastup",
    opis:
      "Za projekte kojima treba jači vizualni dojam, više sadržaja, napredniji layout ili dodatne funkcionalnosti.",
    stavke: [
      "više podstranica i sekcija",
      "napredniji vizualni dojam",
      "dodatne funkcionalnosti po dogovoru",
      "proširena SEO i sadržajna priprema",
      "bolja podloga za oglašavanje i daljnji rast"
    ],
    nije: ["veliki sustavi bez dodatne procjene", "neograničene izmjene", "održavanje bez dogovora"]
  }
];

const problemi = [
  {
    naslov: "Posjetitelj mora odmah razumjeti ponudu",
    opis:
      "U prvih nekoliko sekundi mora biti jasno čime se bavite, gdje radite i kako Vas klijent može kontaktirati."
  },
  {
    naslov: "Dizajn mora izgledati ozbiljno, ali ne smije smetati",
    opis:
      "Cilj nije pokazati efekte, nego predstaviti posao pregledno, uvjerljivo i profesionalno."
  },
  {
    naslov: "Svaka stranica mora imati sljedeći korak",
    opis:
      "Poziv, poruka, obrazac, rezervacija ili upit — korisnik mora znati što treba napraviti nakon što pročita ponudu."
  }
];

const koraci = [
  {
    naslov: "1. Pošaljite osnovne podatke",
    opis:
      "Napišete čime se bavite, što želite postići i imate li domenu, tekstove i fotografije."
  },
  {
    naslov: "2. Predlažemo opseg i paket",
    opis:
      "Ne guramo najskuplje rješenje. Predlažemo ono što ima smisla za Vaš cilj, sadržaj i budžet."
  },
  {
    naslov: "3. Izrađujemo i objavljujemo stranicu",
    opis:
      "Slažemo strukturu, unosimo sadržaj, radimo dorade i pripremamo stranicu za objavu."
  }
];

const dodaci = [
  {
    naslov: "Dodatne podstranice",
    opis:
      "Za usluge koje trebaju zasebno objašnjenje, primjere rada ili posebnu kontakt sekciju."
  },
  {
    naslov: "Pisanje ili dorada tekstova",
    opis:
      "Ako nemate spremne tekstove, možemo ih složiti tako da zvuče jasno, prirodno i prodajno."
  },
  {
    naslov: "Veće galerije radova",
    opis:
      "Za djelatnosti u kojima fotografije nose prodaju: građevina, beauty, apartmani, ugostiteljstvo i slične usluge."
  },
  {
    naslov: "Više jezika",
    opis:
      "Za apartmane, turizam i firme koje rade sa stranim klijentima ili gostima."
  },
  {
    naslov: "Booking ili upitni obrasci",
    opis:
      "Za rezervacije termina, slanje detaljnijih upita ili prikupljanje podataka prije prvog razgovora."
  },
  {
    naslov: "Webshop",
    opis:
      "Za prodaju proizvoda, poklon bonova, digitalnih proizvoda ili jednostavnih online narudžbi."
  },
  {
    naslov: "SEO sadržaj i članci",
    opis:
      "Za teme po kojima Vas ljudi traže na Googleu i za dodatne stranice koje dugoročno dovode posjetitelje."
  },
  {
    naslov: "Održavanje stranice",
    opis:
      "Za sitne izmjene, tehničke provjere, objave novog sadržaja i sigurnost da stranica ostane uredna."
  }
];

const faq = [
  {
    pitanje: "Je li 299 € konačna cijena?",
    odgovor:
      "Može biti, ali samo ako projekt ostaje u opsegu Starter paketa. Ako želite više sekcija, više podstranica, opširne tekstove, veliku galeriju ili posebne funkcionalnosti, cijena se povećava prema stvarnom opsegu."
  },
  {
    pitanje: "Koristite li gotovu strukturu kod Starter paketa?",
    odgovor:
      "Da. Starter paket koristi provjerenu strukturu koju prilagođavamo Vašoj djelatnosti, sadržaju, bojama i fotografijama. Zato je cijena niža i izrada brža. Potpuno custom pristup pripada većim paketima."
  },
  {
    pitanje: "Što ako nemam tekstove i fotografije?",
    odgovor:
      "Možemo krenuti s osnovnim informacijama i Vašim fotografijama, ali bolji sadržaj daje bolji rezultat. Pisanje tekstova, foto/video materijali i opširnija priprema mogu se dogovoriti dodatno."
  },
  {
    pitanje: "Mogu li kasnije nadograditi web?",
    odgovor:
      "Da. Stranica se može kasnije nadograditi dodatnim podstranicama, galerijama, blogom, oglasnim landing stranicama ili funkcionalnostima."
  }
];

export default function IzradaWebStranicaPage() {
  return (
    <>
      <section className="web-hero">
        <div className="container web-hero-inner">
          <div className="web-hero-copy">
            <p className="web-hero-kicker">Izrada web stranica</p>
            <h1 className="page-main-title">
              Web stranice za obrte i firme koje jasno vode prema upitu.
            </h1>
            <p className="web-hero-text">
              Izrađujemo moderne, pregledne i mobilno prilagođene web stranice
              koje potencijalnom klijentu odmah pokazuju što nudite, za koga radite
              i kako Vas može kontaktirati.
            </p>

            <ul className="web-hero-list">
              <li>Paketi već od 299 €</li>
              <li>Jasno definirano što ulazi u cijenu</li>
              <li>Struktura usmjerena na upite, pozive i rezervacije</li>
            </ul>

            <div className="web-hero-actions">
              <Button href="/kontakt" variant="primary">
                Zatražite okvirnu ponudu
              </Button>
              <a href="#paketi" className="btn btn-secondary">
                Pogledajte pakete
              </a>
            </div>
          </div>

          <div className="web-hero-media">
            <img
              src="/images/websites-hero-mockup.png"
              alt="Primjeri web stranica koje izrađuje Promar"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-title">
            <p className="section-kicker">ŠTO STRANICA MORA NAPRAVITI</p>
            <h2>Nije dovoljno da web samo izgleda moderno</h2>
            <p className="section-subtitle">
              Dobra stranica mora brzo objasniti vrijednost Vaše usluge, ukloniti
              nesigurnost i dovesti posjetitelja do konkretnog kontakta.
            </p>
          </div>

          <div className="web-proof">
            {problemi.map((problem) => (
              <div className="web-proof-card" key={problem.naslov}>
                <h2>{problem.naslov}</h2>
                <p>{problem.opis}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="paketi">
        <div className="container">
          <div className="section-title">
            <p className="section-kicker">PAKETI</p>
            <h2>Odaberite opseg koji odgovara Vašem poslu</h2>
            <p className="section-subtitle">
              Paketi služe da odmah znate okvir. Ako projekt izlazi iz okvira,
              cijena se definira prema dodatnom sadržaju i funkcionalnostima.
            </p>
          </div>

          <div className="web-packages">
            {paketi.map((paket) => (
              <article className="web-package-card" key={paket.naziv}>
                <div className="web-package-head">
                  <div>
                    <h3>{paket.naziv}</h3>
                    <p>{paket.oznaka}</p>
                  </div>
                  <span>{paket.cijena}</span>
                </div>
                <p>{paket.opis}</p>

                <h4>Uključuje:</h4>
                <ul className="list-check web-package-list">
                  {paket.stavke.map((stavka) => (
                    <li key={stavka}>{stavka}</li>
                  ))}
                </ul>

                <h4>Ne uključuje automatski:</h4>
                <ul className="list-check web-package-list">
                  {paket.nije.map((stavka) => (
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
            <p className="section-kicker">DODATNE MOGUĆNOSTI</p>
            <h2>Što se može dodati po potrebi</h2>
            <p className="section-subtitle">
              Dodatke ne treba gurati u svaki projekt. Dodaju se kada stvarno pomažu
              cilju stranice ili poslovnom procesu.
            </p>
          </div>

          <div className="cards-grid add-ons-grid">
            {dodaci.map((dodatak) => (
              <div className="card add-on-card" key={dodatak.naslov}>
                <h3>{dodatak.naslov}</h3>
                <p>{dodatak.opis}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-title">
            <p className="section-kicker">KAKO RADIMO</p>
            <h2>Jasan proces od upita do objave</h2>
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

      <section className="section">
        <div className="container">
          <div className="section-title">
            <p className="section-kicker">ČESTA PITANJA</p>
            <h2>Ono što je dobro riješiti prije početka</h2>
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

      <section className="section section-alt">
        <div className="container">
          <div className="article-feature-card article-feature-inline">
            <div className="article-feature-media">
              <img
                src="/images/savjeti-web-stranica.png"
                alt="Moderna web stranica prikazana na laptopu i mobitelu"
              />
            </div>

            <div className="article-feature-content">
              <p className="section-kicker">PRIJE NEGO KRENETE</p>
              <h2>Niste sigurni koji paket ima smisla?</h2>
              <p>
                Pročitajte kratki vodič za obrte i male firme. Pomoći će Vam da
                odlučite treba li Vam jednostavna stranica, ozbiljnija prezentacija
                ili dodatne funkcionalnosti.
              </p>

              <div className="article-feature-actions">
                <Button
                  href="/savjeti/izrada-web-stranica-za-obrte-male-firme"
                  variant="primary"
                >
                  Pročitajte vodič
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cta">
        <div className="container cta-inner">
          <div>
            <h2>Želite znati koji paket odgovara Vašem projektu?</h2>
            <p>Pošaljite osnovne informacije i predložit ćemo realan opseg izrade.</p>
          </div>
          <Button href="/kontakt" variant="primary">
            Zatražite ponudu
          </Button>
        </div>
      </section>
    </>
  );
}

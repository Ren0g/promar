export const metadata = {
  title: "Promar – Web, aplikacije i marketing",
  description:
    "Studio iz Velike Gorice za izradu web stranice, web aplikacije, digitalni marketing te foto i video produkciju. Pomažemo brendovima da izgledaju profesionalno i privuku više klijenata."
};

import Button from "../components/Button";
import SectionTitle from "../components/SectionTitle";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <p className="hero-kicker">Studio za izradu web stranica, aplikacija i marketing</p>

            <h1 className="fade-in">
              Radimo web stranice, aplikacije i digitalni marketing.
            </h1>

            <p className="hero-subtitle fade-in-delay">
              Pomažemo brendovima da izgledaju profesionalno i privuku više
              klijenata.
            </p>

            <div className="hero-actions fade-in-slow">
              <Button href="/kontakt" variant="primary" className="glow">
                Spreman za novi web? Javi se.
              </Button>
            </div>
          </div>

          <div className="hero-media">
            <img src="/images/hero-image.jpg" alt="Promar hero vizual" />
          </div>
        </div>
      </section>

      {/* O PROMARU */}
      <section className="section">
        <div className="container home-about">
          <SectionTitle
            kicker="O PROMARU"
            title="Agencija za izradu web stranica, web aplikacija i digitalni marketing"
            subtitle="Promar je digitalna agencija specijalizirana za izradu modernih web 
            stranica, razvoj web aplikacija i provedbu učinkovitih digitalnih kampanja. 
            Naš pristup temelji se na jasnoj strukturi, čistom dizajnu i funkcionalnim rješenjima 
            koja klijentima donose stvarnu vrijednost — bez kompliciranja i nepotrebnih koraka."
          />

          <div className="container home-about">
           <SectionTitle
              subtitle="Iza nas su projekti poput Fotqa i Tvornice vjenčanja, što nam daje
              jedinstvenu kombinaciju iskustva u webu, videu, sadržaju i
              digitalnom marketingu. Upravo taj spoj omogućuje nam da razumijemo
              i tehnološku stranu i potrebe brenda, te isporučimo rješenja koja
              istovremeno dobro izgledaju i dobro funkcioniraju."
            />
          </div>
        </div>
      </section>

      {/* USLUGE – kratki pregled */}
      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="USLUGE"
            title="Web, aplikacije, marketing i produkcija"
            subtitle="Sve što je potrebno da vaš brend online izgleda i funkcionira profesionalno."
          />

          <div className="cards-grid">
            <div className="card">
              <h3>Web stranice i web aplikacije</h3>
              <p>Moderne, brze i mobilno prilagođene.</p>
            </div>
            <div className="card">
              <h3>Digitalni marketing</h3>
              <p>Društvene mreže, reklame, sadržaj, brendiranje.</p>
            </div>
            <div className="card">
              <h3>Foto &amp; video produkcija</h3>
              <p>Snima­nje, montaža, eventi, sport, brendovi.</p>
            </div>
          </div>

          <div className="section-cta-centered">
            <Button href="/usluge" variant="secondary">
              Pogledaj sve usluge
            </Button>
          </div>
        </div>
      </section>

      {/* REFERENCE – kratko */}
      <section className="section">
        <div className="container">
          <SectionTitle
            kicker="REFERENCE"
            title="Stvarni projekti, stvarni rezultati"
          />

          <div className="references-grid">
            <div className="reference-card">
              <img
                src="/images/reference-fotqa.jpg"
                alt="Fotqa referenca"
                className="reference-image"
              />
              <h3>Fotqa</h3>
              <p>Web &amp; profesionalna foto/video produkcija.</p>
            </div>
            <div className="reference-card">
              <img
                src="/images/reference-vjencanja.jpg"
                alt="Tvornica vjenčanja referenca"
                className="reference-image"
              />
              <h3>Tvornica vjenčanja</h3>
              <p>Platforma i web za najveću wedding zajednicu.</p>
            </div>
            <div className="reference-card">
              <img
                src="/images/reference-vgb.jpg"
                alt="VGB referenca"
                className="reference-image"
              />
              <h3>VGB – Velika Gorica Broadcast</h3>
              <p>Sportska video produkcija i futsal snimke.</p>
            </div>
          </div>

          <div className="section-cta-centered">
            <Button href="/reference" variant="secondary">
              Sve reference
            </Button>
          </div>
        </div>
      </section>

      {/* ZAŠTO MI */}
      <section className="section section-alt">
        <div className="container">
          <SectionTitle
            kicker="ZAŠTO MI"
            title="Moderni webovi, brza komunikacija, stvarne reference"
          />

          <ul className="list-check">
            <li>Moderni webovi i tehnologija.</li>
            <li>Brza i jasna komunikacija.</li>
            <li>Vlastita foto &amp; video produkcija.</li>
            <li>Reference: Fotqa, Tvornica vjenčanja, VGB.</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-cta">
        <div className="container cta-inner">
          <div>
            <h2>Spremni za novi web?</h2>
            <p>Javite se i dogovorit ćemo sve što trebate.</p>
          </div>
          <Button href="/kontakt" variant="primary">
            Javite se
          </Button>
        </div>
      </section>
    </>
  );
}

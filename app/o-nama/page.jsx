export const metadata = {
  title: "O nama | Promar – Web, aplikacije i marketing",
  description:
    "Digitalna agencija specijalizirana za izradu web stranica, web aplikacija i marketing."
};

import SectionTitle from "../../components/SectionTitle";
import Button from "../../components/Button";

export default function ONamaPage() {
  return (
    <section className="section">
      <div className="container">
        <SectionTitle
          kicker="O NAMA"
          title="Studio koji spaja web, aplikacije i digitalni marketing"
        />

        <div className="two-cols">
          <div>
            <h3>Uvod</h3>
            <p>
              Radimo web stranice, aplikacije i digitalni marketing. Bez
              kompliciranja, brzo i precizno.
            </p>

            <h3>Naš način rada</h3>
            <ol className="list-steps">
              <li>Razumijemo što trebate.</li>
              <li>Planiramo strukturu, sadržaj i funkcionalnosti.</li>
              <li>Sve radimo interno – dizajn, razvoj, produkcija.</li>
              <li>Fokus na funkcionalnosti i izgled.</li>
              <li>Rezultat koji vidite – stvarne reference.</li>
            </ol>

            <h3>Što nas čini drugačijima</h3>
            <ul className="list-check">
              <li>Brza komunikacija i jasna cijena.</li>
              <li>Moderna tehnologija i dizajn.</li>
              <li>Vlastita foto &amp; video produkcija.</li>
              <li>
                Iskustvo na projektima poput Fotqa, Tvornica vjenčanja i VGB.
              </li>
            </ul>
          </div>

          <div className="about-highlight">
            <p>
              Ako trebate studio koji radi web, aplikacije i marketing – javite se.
            </p>
            <Button href="/kontakt" variant="primary">
              Kontaktirajte nas
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

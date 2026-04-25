export const metadata = {
  title: "Reference | Promar – Web, aplikacije i marketing",
  description:
    "Naši web projekti i aplikacije: Fotqa, Tvornica vjenčanja, Svadba.app i Zimska liga Panadić."
};

import SectionTitle from "../../components/SectionTitle";
import Button from "../../components/Button";

export default function ReferencePage() {
  return (
    <section className="section">
      <div className="container">
        <SectionTitle
          kicker="REFERENCE"
          title="Projekti iza kojih stojimo"
          subtitle="Od webova do aplikacija – projekti koji najbolje pokazuju način na koji radimo."
          titleAs="h1"
          titleClassName="page-main-title"
        />

        <div className="references-grid">
          <div className="reference-card">
            <img
              src="/images/reference-fotqa.jpg"
              alt="Fotqa referenca"
              className="reference-image"
            />
            <h3>Fotqa</h3>
            <p>
              Profesionalna foto/video produkcija. Web, vizualni identitet i
              kontinuirani sadržaj.
            </p>
            <p>
              <a href="https://fotqa.com" target="_blank" rel="noreferrer">
                fotqa.com
              </a>
            </p>
          </div>

          <div className="reference-card">
            <img
              src="/images/reference-vjencanja.jpg"
              alt="Tvornica vjenčanja referenca"
              className="reference-image"
            />
            <h3>Tvornica vjenčanja</h3>
            <p>
              Najveća hrvatska wedding zajednica. Web, funkcionalnosti i
              vizuali za mladenke i dobavljače.
            </p>
            <p>
              <a
                href="https://tvornicavjencanja.hr"
                target="_blank"
                rel="noreferrer"
              >
                tvornicavjencanja.hr
              </a>
            </p>
          </div>

          <div className="reference-card">
            <img
              src="/images/reference-svadba.jpg"
              alt="Svadba.app referenca"
              className="reference-image"
            />
            <h3>Svadba.app</h3>
            <p>
              Moderna web aplikacija za mladence koja miče Excel, poruke i
              improvizaciju iz planiranja vjenčanja. Na jednom mjestu vodi
              zadatke, budžet, goste, plan sjedenja, dobavljače, uplate i QR
              galeriju za fotografije gostiju.
            </p>
            <p>
              <a href="https://svadba.app" target="_blank" rel="noreferrer">
                svadba.app
              </a>
            </p>
          </div>

          <div className="reference-card">
            <img
              src="/images/reference-panadic.jpg"
              alt="Zimska liga Panadić referenca"
              className="reference-image"
            />
            <h3>Zimska liga Panadić</h3>
            <p>
              Web aplikacija za praćenje rezultata, tablica i rasporeda Zimske
              malonogometne lige Panadić.
            </p>
            <p>
              <a
                href="https://panadic.vercel.app"
                target="_blank"
                rel="noreferrer"
              >
                panadic.vercel.app
              </a>
            </p>
          </div>
        </div>

        <div className="section-cta-centered">
          <Button href="/kontakt" variant="primary">
            Želite svoj projekt među referencama? Javite se.
          </Button>
        </div>
      </div>
    </section>
  );
}

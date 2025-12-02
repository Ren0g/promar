export const metadata = {
  title: "Reference | Promar – Web, aplikacije i marketing",
  description:
    "Od web projekata do produkcije – nekoliko referenci koje pokazuju kako radimo: Fotqa, Tvornica vjenčanja, VGB i Zimska liga Panadić."
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
          subtitle="Od webova do produkcije – nekoliko projekata koji najbolje pokazuju kako radimo."
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
              src="/images/reference-vgb.jpg"
              alt="VGB referenca"
              className="reference-image"
            />
            <h3>VGB – Velika Gorica Broadcast</h3>
            <p>
              Sportska video produkcija i futsal snimke. Web u izradi, video
              primjeri dostupni.
            </p>
            <p>
              <a href="https://promar.hr/vgb" target="_blank" rel="noreferrer">
                promar.hr/vgb
              </a>
            </p>
          </div>

          {/* NOVO: Zimska liga Panadić */}
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

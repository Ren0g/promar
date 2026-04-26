export const metadata = {
  title: "Kontakt | Promar – zatražite ponudu",
  description:
    "Pošaljite upit za izradu web stranice, web aplikacije, digitalni marketing ili foto/video sadržaj. Promar će predložiti opseg i okvirnu cijenu."
};

import SectionTitle from "../../components/SectionTitle";
import ContactForm from "../../components/ContactForm";

export default function KontaktPage() {
  return (
    <section className="section">
      <div className="container">
        <SectionTitle
          kicker="KONTAKT"
          title="Pošaljite osnovne podatke i zatražite okvirnu ponudu"
          subtitle="Napišite čime se bavite, kakvu stranicu ili rješenje trebate i imate li već tekstove, fotografije ili domenu. Na temelju toga možemo predložiti realan opseg posla."
          titleAs="h1"
          titleClassName="page-main-title"
        />

        <div className="contact-layout">
          <div className="contact-info">
            <h3>Podaci</h3>
            <p>
              <strong>Email:</strong>{" "}
              <span>
                <a href="mailto:info@promar.hr">info@promar.hr</a>
              </span>
            </p>
            <p>
              <strong>Telefon:</strong>{" "}
              <span>
                <a href="tel:+385998389738">+385 99 838 9738</a>
              </span>
            </p>
            <p>
              <strong>Lokacija:</strong> Velika Gorica, Hrvatska
            </p>
            <p>
              <strong>Web:</strong>{" "}
              <a href="https://promar.hr" target="_blank" rel="noreferrer">
                promar.hr
              </a>
            </p>

            <div className="about-highlight">
              <h3>Što je dobro poslati?</h3>
              <ul className="list-check">
                <li>Čime se bavite i koje usluge nudite.</li>
                <li>Koji je cilj stranice: upiti, pozivi, rezervacije ili prezentacija.</li>
                <li>Imate li domenu, tekstove i fotografije.</li>
                <li>Koji paket okvirno gledate, ako već znate.</li>
              </ul>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

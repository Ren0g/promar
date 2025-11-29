export const metadata = {
  title: "Kontakt | Promar – Web, aplikacije i marketing",
  description:
    "Javite nam se za izradu web stranica, web aplikacija, digitalni marketing ili foto/video produkciju. Odgovaramo u najkraćem roku."
};

import SectionTitle from "../../components/SectionTitle";
import ContactForm from "../../components/ContactForm";

export default function KontaktPage() {
  return (
    <section className="section">
      <div className="container">
        <SectionTitle
          kicker="KONTAKT"
          title="Javite se i dogovorit ćemo sve što trebate"
          subtitle="Pošaljite nam osnovne informacije o projektu i javit ćemo se s prijedlogom i procjenom."
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
          </div>

          <div className="contact-form-wrapper">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}

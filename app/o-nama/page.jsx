export const metadata = {
  title: "O Promaru | Web stranice, aplikacije i marketing",
  description:
    "Promar je praktičan studio iz Velike Gorice za izradu web stranica, web aplikacija, digitalnih rješenja i sadržaja."
};

import SectionTitle from "../../components/SectionTitle";
import Button from "../../components/Button";

export default function ONamaPage() {
  return (
    <>
      <section className="section section-alt page-hero-section">
        <div className="container">
          <SectionTitle
            kicker="O PROMARU"
            title="Mali studio za web koji razmišlja poslovno, a ne samo dizajnerski"
            subtitle="Promar iz Velike Gorice izrađuje web stranice, web aplikacije i digitalna rješenja za obrte, male firme i uslužne djelatnosti. Fokus je na jasnoj ponudi, urednoj izvedbi i stranici koja posjetitelja vodi prema konkretnom kontaktu."
            titleAs="h1"
            titleClassName="page-main-title"
          />
        </div>
      </section>

      <section className="section">
        <div className="container two-cols">
          <div className="content-flow">
            <h3>Direktan pristup</h3>
            <p>
              Promar nije velika agencija s deset odjela. Prednost je u tome što
              projekt ne prolazi kroz nepotrebne slojeve komunikacije. Dogovaramo
              cilj, strukturu i opseg, a zatim se radi ono što je stvarno potrebno.
            </p>

            <h3>Kako razmišljamo o webu</h3>
            <ol className="list-steps">
              <li>Prvo definiramo što posjetitelj mora shvatiti odmah.</li>
              <li>Zatim slažemo strukturu koja vodi prema upitu, pozivu ili rezervaciji.</li>
              <li>Tek nakon toga dolaze dizajn, sadržaj i tehnička izvedba.</li>
              <li>Ako nešto nema smisla za Vaš cilj, ne guramo to samo da projekt bude skuplji.</li>
            </ol>

            <h3>Što možemo pokriti</h3>
            <ul className="list-check">
              <li>Izradu prezentacijskih web stranica i landing stranica.</li>
              <li>Jednostavne web aplikacije i dodatne funkcionalnosti.</li>
              <li>Tekstove, vizuale, fotografije, video i sadržaj za online nastup.</li>
              <li>Digitalni marketing i pripremu stranice za kampanje.</li>
            </ul>
          </div>

          <div className="about-highlight">
            <h3>Za koga je Promar dobar izbor?</h3>
            <p>
              Za obrte, male firme i projekte koji žele ozbiljniji online nastup,
              ali ne žele ulaziti u prevelik, preskup ili nejasan proces.
            </p>
            <p>
              Ako trebate jasan web, konkretan prijedlog i realan opseg posla,
              pošaljite osnovne informacije o projektu.
            </p>
            <Button href="/kontakt" variant="primary">
              Zatražite prijedlog
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

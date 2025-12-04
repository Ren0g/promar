"use client";

import { useState, useEffect } from "react";
import Button from "./Button";

export default function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
    website: "" // honeypot
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // ░░░ reCAPTCHA loader ░░░
  useEffect(() => {
    if (!window.grecaptcha) {
      const script = document.createElement("script");
      script.src =
        "https://www.google.com/recaptcha/api.js?render=6LfuCyEsAAAAAOXyd1SEb_o2TwE8jIHcieJ1lW2s";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitted(false);
  }

  function validate(formValues) {
    const newErrors = {};

    if (!formValues.name.trim()) {
      newErrors.name = "Molimo upišite ime i prezime.";
    }

    if (!formValues.email.trim()) {
      newErrors.email = "Molimo upišite email adresu.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      newErrors.email = "Email adresa nije ispravna.";
    }

    if (!formValues.phone.trim()) {
      newErrors.phone = "Molimo upišite broj mobitela.";
    }

    if (!formValues.service.trim()) {
      newErrors.service = "Molimo odaberite uslugu.";
    }

    if (!formValues.message.trim()) {
      newErrors.message = "Molimo opišite projekt ili upit.";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // ❗ Honeypot – ako je bot popunio ovo polje → prekidamo bez poruke
    if (values.website) {
      console.warn("BOT DETECTED (honeypot)");
      return;
    }

    // ░░░ RECAPTCHA TOKEN ░░░
    const token = await window.grecaptcha.execute(
      "6LfuCyEsAAAAAOXyd1SEb_o2TwE8jIHcieJ1lW2s",
      { action: "submit" }
    );

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        captcha: token
      })
    });

    const result = await response.json();

    if (!result.success) {
      setSubmitted(false);
      alert("Greška pri slanju poruke.");
      return;
    }

    console.log("Kontakt forma poslana:", values);
    setSubmitted(true);

    // Reset forme po želji
    setValues({
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
      website: ""
    });
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={values.website}
        onChange={handleChange}
        style={{ display: "none" }}
        tabIndex="-1"
        autoComplete="off"
      />

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="name">Ime i prezime</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Vaše ime i prezime"
            value={values.name}
            onChange={handleChange}
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="ime@domena.com"
            value={values.email}
            onChange={handleChange}
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="phone">Mobitel</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="091 123 4567"
            value={values.phone}
            onChange={handleChange}
          />
          {errors.phone && <p className="form-error">{errors.phone}</p>}
        </div>

        <div className="form-field">
          <label htmlFor="service">Usluga</label>
          <select
            id="service"
            name="service"
            value={values.service}
            onChange={handleChange}
          >
            <option value="">Odaberite uslugu</option>
            <option value="web">Web stranica</option>
            <option value="app">Web aplikacija</option>
            <option value="marketing">Digitalni marketing</option>
            <option value="produkcija">Foto &amp; video produkcija</option>
            <option value="ostalo">Ostalo</option>
          </select>
          {errors.service && <p className="form-error">{errors.service}</p>}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="message">Poruka</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Ukratko opišite što trebate..."
          value={values.message}
          onChange={handleChange}
        />
        {errors.message && <p className="form-error">{errors.message}</p>}
      </div>

      <Button type="submit" variant="primary">
        Zatražite ponudu
      </Button>

      {submitted && (
        <p className="form-success">
          Hvala! Vaša poruka je zaprimljena, javit ćemo se u najkraćem roku.
        </p>
      )}
    </form>
  );
}

"use client";

import { useState } from "react";
import Button from "./Button";

export default function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

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

    // 🔥 DODANO — SLANJE NA BACKEND
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const result = await response.json();

    if (!result.success) {
      setSubmitted(false);
      alert("Greška pri slanju poruke.");
      return;
    }
    // 🔥 KRAJ DODATKA

    console.log("Kontakt forma poslana:", values);
    setSubmitted(true);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
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

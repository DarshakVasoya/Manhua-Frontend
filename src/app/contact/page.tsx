"use client";
import React, { useState } from "react";

const categories = [
  "General Inquiry",
  "Feedback / Suggestions",
  "Bug / Technical Issue",
  "Content Request",
  "Partnership / Collaboration",
  "Account / Login Issue",
  "Other"
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    category: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.message || !form.category) {
      setError("Please fill in all required fields.");
      return;
    }
  fetch('https://api.manhwagalaxy.org/contact_us', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        status: 'new'
      })
    })
      .then(res => {
        if (!res.ok) {
          res.text().then(text => {
            console.error('API error:', text);
          });
          throw new Error('Failed to submit');
        }
        return res.json();
      })
      .then(data => {
        setSubmitted(true);
      })
      .catch((err) => {
        setError('Failed to submit. Please try again later.');
        console.error('Submit error:', err);
      });
  };

  return (
    <main className="container-page max-w-xl mx-auto py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-[var(--color-accent)]">Contact Us</h1>
      <form onSubmit={handleSubmit} className="bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl p-6 flex flex-col gap-5 shadow-md">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1 text-[var(--color-text)]">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-[var(--color-text)]">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1 text-[var(--color-text)]">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1 text-[var(--color-text)]">Message</label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm font-semibold text-center">{error}</div>}
        {submitted ? (
          <div className="text-green-600 text-center font-semibold">Thank you for contacting us! We&apos;ll get back to you soon.</div>
        ) : (
          <button
            type="submit"
            className="px-5 py-2 rounded-md bg-[var(--color-accent)] text-white font-semibold hover:bg-[var(--color-accent-hover)] transition"
          >Submit</button>
        )}
      </form>
    </main>
  );
}

"use client";
import React from "react";

export default function TermsPage() {
  React.useEffect(() => {
    document.title = "Terms of Service | ManhwaGalaxy";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta') as HTMLMetaElement;
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = "Read the Terms of Service for ManhwaGalaxy. Learn about site rules, user conduct, and legal disclaimers.";
  }, []);
  return (
    <main className="container-page max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
        <p>By accessing or using ManhwaGalaxy, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, please do not use the site.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">2. Use of Content</h2>
        <p>All manga and related content are provided for personal, non-commercial use only. You may not reproduce, distribute, or modify any content without permission from the copyright holder.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">3. User Conduct</h2>
        <p>You agree not to use ManhwaGalaxy for any unlawful purpose or to violate any local, state, or international laws. Harassment, abuse, or posting of offensive material is strictly prohibited.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">4. Disclaimer</h2>
    <p>ManhwaGalaxy provides content &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy, completeness, or availability of any content.</p>
   </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">5. Changes to Terms</h2>
        <p>We reserve the right to update these Terms of Service at any time. Changes will be posted on this page and are effective immediately upon posting.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">6. Contact</h2>
        <p>If you have any questions about these Terms, please contact us at darshakvasoya6@gmail.com .</p>
      </section>
    </main>
  );
}

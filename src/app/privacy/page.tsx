"use client";
import React from "react";

export default function PrivacyPage() {
  React.useEffect(() => {
    document.title = "Privacy Policy | ManhwaGalaxy";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta') as HTMLMetaElement;
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = "Read the Privacy Policy for ManhwaGalaxy. Learn how we handle data, cookies, and third-party services.";
  }, []);
  return (
    <main className="container-page max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">1. Information We Collect</h2>
        <p>We may collect non-personal information such as browser type, device, and usage statistics to improve our service. We do not require users to create accounts or provide personal information to access content.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">2. Cookies</h2>
        <p>ManhwaGalaxy may use cookies to enhance user experience and analyze site traffic. You can disable cookies in your browser settings, but some features may not work as intended.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">3. Third-Party Services</h2>
        <p>We may use third-party analytics or advertising services that collect information in accordance with their own privacy policies. ManhwaGalaxy is not responsible for the practices of these third parties.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">4. Data Security</h2>
        <p>We take reasonable measures to protect your information, but no method of transmission over the Internet is 100% secure. Use the site at your own risk.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">5. Changes to Policy</h2>
        <p>We may update this Privacy Policy from time to time. Changes will be posted on this page and are effective immediately upon posting.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">6. Contact</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at support@manhwagalaxy.com.</p>
      </section>
    </main>
  );
}

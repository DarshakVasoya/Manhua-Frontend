"use client";
import React, { useEffect } from "react";

export default function DMCA() {
  useEffect(() => {
    document.title = "DMCA Policy | ManhwaGalaxy";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta') as HTMLMetaElement;
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = "Read our DMCA Policy to understand how copyright issues are handled at ManhwaGalaxy. Contact us for takedown requests or copyright concerns.";
  }, []);

  return (
    <main className="container-page max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">DMCA Policy</h1>
      <div className="space-y-4 text-sm text-[var(--color-text-dim)]">
        <p>
          ManhwaGalaxy respects the intellectual property rights of others and expects users to do the same. If you believe that your copyrighted work has been posted on our site without authorization, please contact us immediately.
        </p>
        <h2 className="text-lg font-semibold mt-6 mb-2">How to File a DMCA Takedown Request</h2>
        <p>
          To submit a DMCA takedown request, please provide the following information:
        </p>
        <ul className="list-disc ml-6">
          <li>Your name and contact information</li>
          <li>A description of the copyrighted work</li>
          <li>The URL(s) of the infringing content</li>
          <li>A statement that you have a good faith belief the use is unauthorized</li>
          <li>A statement, under penalty of perjury, that the information is accurate and you are authorized to act</li>
        </ul>
        <p>
          Send your DMCA request to: <a href="mailto:admin@manhwagalaxy.com" className="text-[var(--color-accent)] underline">admin@manhwagalaxy.com</a>
        </p>
        <h2 className="text-lg font-semibold mt-6 mb-2">Counter Notification</h2>
        <p>
          If you believe your content was removed in error, you may submit a counter notification with similar details. We will review and respond as required by law.
        </p>
        <h2 className="text-lg font-semibold mt-6 mb-2">Repeat Infringers</h2>
        <p>
          ManhwaGalaxy may terminate accounts of users who are repeat infringers of copyright.
        </p>
      </div>
    </main>
  );
}

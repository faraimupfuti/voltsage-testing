import type { Metadata } from 'next'
import Header from '@/components/Header'
import { Footer } from '@/components/ContactAndFooter'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How VoltSage collects, uses, and protects your information.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="font-disp font-bold text-lg text-ink mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-ink-muted leading-relaxed">{children}</div>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6">
          <div className="section-eyebrow">Legal</div>
          <h1 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-ink-faint font-mono mb-12">Effective date: August 2026</p>

          <p className="text-base text-ink-muted leading-relaxed mb-12">
            At VoltSage, we value your privacy and are committed to protecting your personal information. This Privacy
            Policy explains what information we collect through voltsage.co and our free sizing tools, how we use it,
            who we share it with, and the choices you have.
          </p>

          <div className="divider mb-10" />

          <Section title="Information We Collect">
            <p>We collect different information depending on how you use the site:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-ink">To unlock the free sizing tools</strong> — your full name, country, and email address.</li>
              <li><strong className="text-ink">If you submit an enquiry</strong> through our contact form — your name, a contact detail (phone number or email, whichever you provide), the service you're asking about, your location, and your message.</li>
              <li><strong className="text-ink">The details you enter into the sizing tools</strong> — the appliances or farm equipment you add, their power ratings, quantities, and operating schedules, plus your selected location. This is used to calculate your results and is described further under "How Your Tool Data Is Handled" below.</li>
              <li><strong className="text-ink">Technical and usage information</strong> — general analytics such as pages visited and browser type, collected through a privacy-focused analytics service (see "Cookies &amp; Analytics" below).</li>
            </ul>
          </Section>

          <Section title="How Your Tool Data Is Handled">
            <p>
              The appliance, equipment, and load-schedule data you enter into the Residential, Agricultural, and
              Battery Runtime tools is processed <strong className="text-ink">directly in your browser</strong> to
              calculate your sizing results. We do not transmit this data to our servers as you type it in.
            </p>
            <p>
              If you choose to download a PDF report, that report is generated on your own device and saved directly
              to your computer or phone — it is not uploaded to VoltSage or any third party. Your tool inputs are only
              shared with us if you separately choose to include them in an enquiry through our contact form.
            </p>
          </Section>

          <Section title="How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To unlock and provide access to our free solar sizing and energy assessment tools</li>
              <li>To respond to enquiries and support requests submitted through our contact form</li>
              <li>To follow up about your solar sizing results, where you've asked us to</li>
              <li>To understand general usage trends and improve our tools and website</li>
              <li>To send occasional updates about VoltSage's products or educational content — you may opt out at any time</li>
            </ul>
          </Section>

          <Section title="Information Sharing">
            <p>VoltSage does not sell your personal information, and we do not earn a commission on any equipment you buy.</p>
            <p>
              When you sign up to use the tools or submit an enquiry, that information is automatically forwarded to
              our internal systems through Make.com, a workflow automation service we use to manage signups and
              enquiries. Make.com processes this data on our behalf and does not use it for its own purposes.
            </p>
            <p>We may also disclose information where required by applicable law.</p>
          </Section>

          <Section title="Cookies &amp; Analytics">
            <p>
              We use Umami, a privacy-focused analytics service, to understand general website traffic and usage
              trends. Umami does not use tracking cookies, does not collect personally identifiable information, and
              does not track you across other websites. We do not use advertising or cross-site tracking cookies on
              voltsage.co.
            </p>
          </Section>

          <Section title="Data Security">
            <p>
              We take reasonable technical and organisational measures to protect your personal information from
              unauthorised access, loss, misuse, or disclosure. However, no internet-based service can guarantee
              absolute security.
            </p>
          </Section>

          <Section title="Your Rights">
            <p>You may request to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your personal information, where applicable</li>
              <li>Withdraw consent to receive marketing communications</li>
            </ul>
            <p>To make any of these requests, please contact us using the details below.</p>
          </Section>

          <Section title="Third-Party Services">
            <p>VoltSage relies on a small number of third-party services to operate the website and process the information above:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-ink">Make.com</strong> — processes signup and enquiry form submissions</li>
              <li><strong className="text-ink">Umami</strong> — privacy-focused website analytics</li>
              <li>Our cloud hosting provider, which serves the website itself</li>
            </ul>
            <p>These services may collect information in accordance with their own privacy policies.</p>
          </Section>

          <Section title="International Users">
            <p>
              VoltSage's tools are available in English, Spanish, Portuguese, French, and German, and are used by
              visitors across multiple countries. By using voltsage.co, you understand that your information may be
              processed by the third-party services listed above, which may operate outside your country of
              residence.
            </p>
          </Section>

          <Section title="Children's Privacy">
            <p>VoltSage's tools are intended for general audiences and are not directed at children. We do not knowingly collect personal information from children.</p>
          </Section>

          <Section title="Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. Any changes will be published on this page with an updated effective date.</p>
          </Section>

          <Section title="Contact Us">
            <p>If you have any questions about this Privacy Policy or how your information is handled, please contact us at:</p>
            <p className="font-mono text-ink">VoltSage<br/>Email: <a href="mailto:info@voltsage.co" className="text-brand-orange hover:underline">info@voltsage.co</a></p>
          </Section>
        </section>
      </main>
      <Footer />
    </>
  )
}

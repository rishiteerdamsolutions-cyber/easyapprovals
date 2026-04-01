import Link from 'next/link';
import LegalPageLayout, {
  LegalH2,
  LegalH3,
  LegalLi,
  LegalNote,
  LegalUl,
} from '@/components/legal/LegalPageLayout';
import { POLICIES_EFFECTIVE_DATE, SITE_LEGAL } from '@/lib/site-legal';

export const metadata = {
  title: 'Terms & Conditions | Easy Approval',
  description:
    'Terms of use for Easy Approval services, payments via Razorpay and Cashfree, and limitations of liability.',
};

export default function TermsPage() {
  const { brandName, legalEntityName, registeredOffice, supportEmail, websiteUrl, gstin } =
    SITE_LEGAL;

  return (
    <LegalPageLayout title="Terms & Conditions" effectiveDate={POLICIES_EFFECTIVE_DATE}>
      <LegalNote>
        Online payments are processed by RBI-authorised payment aggregators such as{' '}
        <strong>Razorpay</strong> and <strong>Cashfree</strong>. By paying through our checkout,
        you also agree to their applicable terms and privacy policies for the payment leg of the
        transaction.
      </LegalNote>

      <p>
        These Terms & Conditions (“<strong>Terms</strong>”) govern your access to and use of the
        website at {websiteUrl} and the professional, compliance, and related services offered by{' '}
        <strong>{legalEntityName}</strong> (“<strong>{brandName}</strong>”, “we”, “us”, “our”).
      </p>
      <p>
        Registered office: {registeredOffice}.
        {gstin ? ` GSTIN: ${gstin}.` : ''} Support:{' '}
        <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
          {supportEmail}
        </a>
        .
      </p>

      <LegalH2>1. Acceptance</LegalH2>
      <p>
        By using the Services, creating an account, or placing an order, you agree to these Terms
        and our{' '}
        <Link href="/privacy" className="text-primary-600 hover:underline">
          Privacy Policy
        </Link>
        ,{' '}
        <Link href="/refund" className="text-primary-600 hover:underline">
          Refund Policy
        </Link>
        , and{' '}
        <Link href="/shipping" className="text-primary-600 hover:underline">
          Shipping & Delivery Policy
        </Link>
        . If you disagree, do not use the Services.
      </p>

      <LegalH2>2. Eligibility</LegalH2>
      <p>
        You represent that you are at least 18 years old and have legal capacity to contract. If
        you use the Services on behalf of an organisation, you represent that you are authorised to
        bind that organisation.
      </p>

      <LegalH2>3. Description of services</LegalH2>
      <p>
        {brandName} provides technology-enabled access to corporate, tax, GST, intellectual
        property, and related compliance services, which may be performed by us and/or qualified
        third-party professionals. Government portals, timelines, and outcomes depend on factors
        outside our control; we do not guarantee specific approval dates or results from
        authorities.
      </p>

      <LegalH2>4. Accounts</LegalH2>
      <LegalUl>
        <LegalLi>You are responsible for accurate registration information and account security.</LegalLi>
        <LegalLi>
          Notify us promptly of unauthorised use. We may suspend or terminate accounts for breach,
          fraud, or risk.
        </LegalLi>
      </LegalUl>

      <LegalH2>5. Orders, fees, and taxes</LegalH2>
      <LegalUl>
        <LegalLi>
          Prices, professional fees, and government or statutory fees (where applicable) are
          displayed or communicated before payment. Taxes (e.g. GST) may be charged as per law.
        </LegalLi>
        <LegalLi>
          Government fees paid to authorities on your behalf are generally non-refundable by us once
          remitted; see our Refund Policy.
        </LegalLi>
      </LegalUl>

      <LegalH2>6. Payments and payment partners</LegalH2>
      <LegalH3>6.1 Processing</LegalH3>
      <p>
        We use third-party payment gateways (including without limitation Razorpay and Cashfree) to
        collect payments. Your payment is subject to successful authorisation and settlement by the
        relevant bank, NPCI, card network, or wallet provider.
      </p>
      <LegalH3>6.2 Your obligations</LegalH3>
      <LegalUl>
        <LegalLi>You authorise us and our payment partners to charge the agreed amount.</LegalLi>
        <LegalLi>
          You must not use stolen payment credentials or engage in fraudulent transactions.
          Chargebacks and disputes must be raised in good faith; abusive chargebacks may lead to
          account termination and legal action.
        </LegalLi>
      </LegalUl>
      <LegalH3>6.3 Failed or duplicate payments</LegalH3>
      <p>
        If a payment fails or appears duplicated, contact{' '}
        <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
          {supportEmail}
        </a>{' '}
        with transaction references. Refunds, where due, are handled per our Refund Policy and
        payment-partner timelines.
      </p>

      <LegalH2>7. Cancellations and refunds</LegalH2>
      <p>
        Cancellations and refunds are governed by our{' '}
        <Link href="/refund" className="text-primary-600 hover:underline">
          Refund Policy
        </Link>
        . Nothing in these Terms overrides your statutory rights where applicable.
      </p>

      <LegalH2>8. Intellectual property</LegalH2>
      <p>
        Content on the site (text, graphics, logos, software) is owned by {legalEntityName} or
        licensors. You receive a limited, non-exclusive licence to use the Services for personal or
        internal business use. You may not copy, scrape, or reverse engineer except as permitted by
        law.
      </p>

      <LegalH2>9. Your content and documents</LegalH2>
      <p>
        You retain ownership of materials you upload. You grant us a licence to use, store, and
        share them with professionals and authorities as needed to deliver the Services. You
        represent that you have rights to the content and that it does not violate third-party
        rights.
      </p>

      <LegalH2>10. Disclaimers</LegalH2>
      <p>
        The Services are provided on an “as is” and “as available” basis to the fullest extent
        permitted by law. We disclaim implied warranties where allowable. Professional advice
        delivered through the platform is for your engagement; you remain responsible for business
        decisions and statutory compliance.
      </p>

      <LegalH2>11. Limitation of liability</LegalH2>
      <p>
        To the maximum extent permitted by applicable law in India, {legalEntityName} and its
        officers, employees, and partners shall not be liable for indirect, incidental, special,
        consequential, or punitive damages, or loss of profits, data, or goodwill. Our aggregate
        liability arising out of the Services for any claim shall not exceed the fees you paid to us
        for the specific order giving rise to the claim in the six (6) months preceding the claim,
        except where liability cannot be excluded by law (including death or personal injury caused
        by negligence, fraud, or wilful misconduct).
      </p>

      <LegalH2>12. Indemnity</LegalH2>
      <p>
        You agree to indemnify and hold harmless {legalEntityName} and its affiliates from claims,
        damages, losses, and expenses (including reasonable legal fees) arising from your misuse of
        the Services, violation of these Terms, or infringement of third-party rights.
      </p>

      <LegalH2>13. Governing law and jurisdiction</LegalH2>
      <p>
        These Terms are governed by the laws of India. Subject to mandatory provisions, courts at
        the location of our registered office (or such other venue we specify in writing) shall
        have exclusive jurisdiction.
      </p>

      <LegalH2>14. Dispute resolution</LegalH2>
      <p>
        We encourage you to contact{' '}
        <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
          {supportEmail}
        </a>{' '}
        first to resolve disputes. Where applicable law requires or permits, parties may explore
        mediation or arbitration as an alternative to litigation.
      </p>

      <LegalH2>15. Changes</LegalH2>
      <p>
        We may modify these Terms by posting an updated version with a new effective date. Continued
        use after changes constitutes acceptance of the revised Terms for new transactions.
      </p>

      <LegalH2>16. Contact</LegalH2>
      <LegalUl>
        <LegalLi>
          Email:{' '}
          <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
            {supportEmail}
          </a>
        </LegalLi>
        <LegalLi>
          <Link href="/contact" className="text-primary-600 hover:underline">
            Contact form
          </Link>
        </LegalLi>
      </LegalUl>

      <LegalNote>
        Have these Terms reviewed by your legal counsel before go-live. Replace bracketed
        placeholders in environment variables (see .env.example) with your legal entity name,
        address, GSTIN, and support contacts.
      </LegalNote>
    </LegalPageLayout>
  );
}

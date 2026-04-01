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
  title: 'Privacy Policy | Easy Approval',
  description:
    'How Easy Approval collects, uses, and protects your personal data, including payments processed via Razorpay, Cashfree, and other partners.',
};

export default function PrivacyPolicyPage() {
  const { brandName, legalEntityName, registeredOffice, supportEmail, websiteUrl } =
    SITE_LEGAL;

  return (
    <LegalPageLayout title="Privacy Policy" effectiveDate={POLICIES_EFFECTIVE_DATE}>
      <LegalNote>
        Payments on {websiteUrl} may be processed by licensed payment aggregators (such as{' '}
        <strong>Razorpay</strong> and <strong>Cashfree</strong>). Card and UPI credential data
        are handled by those providers under their certifications and policies; we do not ask you
        to share full card numbers or CVV on our own servers.
      </LegalNote>

      <p>
        This Privacy Policy describes how <strong>{legalEntityName}</strong> (“
        <strong>{brandName}</strong>”, “we”, “us”, “our”) collects, uses, stores, and discloses
        information when you use our website, applications, and related professional and
        compliance services (collectively, the “<strong>Services</strong>”).
      </p>
      <p>
        Registered office: {registeredOffice}. For privacy requests, contact{' '}
        <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
          {supportEmail}
        </a>
        .
      </p>

      <LegalH2>1. Scope and consent</LegalH2>
      <p>
        By accessing or using the Services, you agree to this Privacy Policy. If you do not agree,
        please do not use the Services. We may update this policy from time to time; the
        “Effective date” above reflects the latest version.
      </p>

      <LegalH2>2. Information we collect</LegalH2>
      <LegalH3>2.1 You provide directly</LegalH3>
      <LegalUl>
        <LegalLi>
          Identity and contact: name, email, phone number, billing address, business name.
        </LegalLi>
        <LegalLi>
          Order and service details: services purchased, questionnaire responses, documents you
          upload for filings or compliance.
        </LegalLi>
        <LegalLi>
          Communications: messages you send via forms, email, chat, or support channels.
        </LegalLi>
      </LegalUl>

      <LegalH3>2.2 Automatically collected</LegalH3>
      <LegalUl>
        <LegalLi>
          Technical data: IP address, device/browser type, approximate location, pages viewed,
          referring URLs, timestamps.
        </LegalLi>
        <LegalLi>
          Cookies and similar technologies: see Section 6.
        </LegalLi>
      </LegalUl>

      <LegalH3>2.3 Payment-related information</LegalH3>
      <p>
        When you pay online, your transaction is processed by our payment partners (e.g. Razorpay,
        Cashfree, or other RBI-authorised payment aggregators we may use). We typically receive:
      </p>
      <LegalUl>
        <LegalLi>Payment status, transaction ID, amount, payment method type (e.g. UPI, card).</LegalLi>
        <LegalLi>
          Limited billing identifiers needed for reconciliation and accounting—not your full card
          number or CVV, which are handled by the payment gateway in line with PCI DSS and RBI
          norms.
        </LegalLi>
      </LegalUl>

      <LegalH2>3. How we use information</LegalH2>
      <LegalUl>
        <LegalLi>To provide, fulfil, and support the Services you request.</LegalLi>
        <LegalLi>To process payments, prevent fraud, and comply with legal and audit requirements.</LegalLi>
        <LegalLi>To communicate with you about orders, filings, notices, and service updates.</LegalLi>
        <LegalLi>To improve security, troubleshoot, and analyse usage in aggregated form.</LegalLi>
        <LegalLi>To comply with court orders, regulatory requests, and applicable Indian law.</LegalLi>
      </LegalUl>

      <LegalH2>4. Sharing of information</LegalH2>
      <p>We may share information with:</p>
      <LegalUl>
        <LegalLi>
          <strong>Payment partners</strong> (e.g. Razorpay, Cashfree) for authorisation, settlement,
          refunds, and chargeback handling.
        </LegalLi>
        <LegalLi>
          <strong>Professional partners</strong> such as chartered accountants, company secretaries,
          or filing agents who perform work on your matter—only what is needed for that engagement.
        </LegalLi>
        <LegalLi>
          <strong>Technology providers</strong> (hosting, email, CRM, storage) under contracts that
          require confidentiality and appropriate security.
        </LegalLi>
        <LegalLi>
          <strong>Government or regulatory bodies</strong> when required for filings, notices, or
          lawful requests.
        </LegalLi>
      </LegalUl>
      <p>We do not sell your personal information to third parties for their marketing.</p>

      <LegalH2>5. Data retention</LegalH2>
      <p>
        We retain information for as long as needed to provide the Services, meet legal,
        regulatory, and tax obligations (including record-keeping for payments and filings), and
        resolve disputes. Retention periods may vary by data type and applicable law.
      </p>

      <LegalH2>6. Cookies and similar technologies</LegalH2>
      <p>
        We use cookies and similar technologies for session management, preferences, analytics, and
        security. You can control cookies through your browser settings; disabling some cookies may
        limit certain features.
      </p>

      <LegalH2>7. Security</LegalH2>
      <p>
        We implement reasonable technical and organisational measures to protect personal data,
        including encryption in transit where appropriate, access controls, and vendor due
        diligence. No method of transmission over the Internet is 100% secure; we cannot guarantee
        absolute security.
      </p>

      <LegalH2>8. Your rights and choices</LegalH2>
      <p>
        Subject to applicable law (including the Digital Personal Data Protection Act, 2023, where
        applicable), you may request access, correction, or deletion of certain personal data, or
        withdraw consent where processing is consent-based, by contacting us at{' '}
        <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
          {supportEmail}
        </a>
        . We may need to verify your identity. Some requests may be limited where we must retain
        data for legal or contractual reasons.
      </p>

      <LegalH2>9. Children</LegalH2>
      <p>
        The Services are not directed at minors. If you believe we have collected data from a
        child without appropriate consent, contact us and we will take appropriate steps.
      </p>

      <LegalH2>10. Third-party links</LegalH2>
      <p>
        Our site may link to third-party websites or payment flows. Their privacy practices are
        governed by their own policies. We encourage you to read Razorpay’s and Cashfree’s privacy
        notices when you are redirected to their checkout or payment pages.
      </p>

      <LegalH2>11. International transfers</LegalH2>
      <p>
        We primarily process data in India. If we use subprocessors outside India, we will take
        steps consistent with applicable law and contractual safeguards.
      </p>

      <LegalH2>12. Contact</LegalH2>
      <p>
        For privacy questions or requests:{' '}
        <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
          {supportEmail}
        </a>
        . You may also use our{' '}
        <Link href="/contact" className="text-primary-600 hover:underline">
          contact page
        </Link>
        .
      </p>

      <LegalNote>
        This policy is provided for transparency and payment-gateway compliance. It is not legal
        advice; have your counsel review it for your specific entity and data practices.
      </LegalNote>
    </LegalPageLayout>
  );
}

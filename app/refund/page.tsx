import Link from 'next/link';
import LegalPageLayout, {
  LegalH2,
  LegalH3,
  LegalLi,
  LegalNote,
  LegalOl,
  LegalUl,
} from '@/components/legal/LegalPageLayout';
import { POLICIES_EFFECTIVE_DATE, SITE_LEGAL } from '@/lib/site-legal';

export const metadata = {
  title: 'Refund & Cancellation Policy | Easy Approval',
  description:
    'Refunds, cancellations, and failed payments for Easy Approval services paid via Razorpay, Cashfree, and other payment partners.',
};

export default function RefundPolicyPage() {
  const { brandName, legalEntityName, supportEmail, websiteUrl } = SITE_LEGAL;

  return (
    <LegalPageLayout title="Refund & Cancellation Policy" effectiveDate={POLICIES_EFFECTIVE_DATE}>
      <LegalNote>
        Refunds for card/UPI/netbanking/wallet payments are processed through our payment partners
        (e.g. <strong>Razorpay</strong>, <strong>Cashfree</strong>). Once we approve a refund, the
        amount is typically credited to your original payment method within <strong>5–14 business
        days</strong>, depending on your bank or issuer—this is outside our direct control.
      </LegalNote>

      <p>
        This Refund & Cancellation Policy explains how <strong>{legalEntityName}</strong> (“
        <strong>{brandName}</strong>”) handles cancellations, refunds, and payment reversals for
        orders placed on {websiteUrl}. It should be read together with our{' '}
        <Link href="/terms" className="text-primary-600 hover:underline">
          Terms & Conditions
        </Link>
        .
      </p>

      <LegalH2>1. Nature of services</LegalH2>
      <p>
        Most offerings are professional, compliance, or filing-related services—not physical goods.
        Refund eligibility depends on how much work has been performed and whether government or
        third-party fees have already been paid on your behalf.
      </p>

      <LegalH2>2. When you may request a refund</LegalH2>
      <LegalH3>2.1 Before service commencement</LegalH3>
      <p>
        If you cancel an order <strong>before</strong> we have started substantive work (e.g. before
        assignment to a professional, before submission to any government portal, and before
        incurring non-recoverable third-party charges), you may be eligible for a{' '}
        <strong>full or partial refund</strong> of the professional fee component, as determined by
        us in good faith based on the specific service.
      </p>
      <LegalH3>2.2 After service commencement</LegalH3>
      <p>
        Once work has started, refunds are <strong>partial or nil</strong>, proportional to work
        completed and costs already incurred. If a deliverable has been completed and handed over,
        fees for that milestone are generally non-refundable except as in Section 4.
      </p>
      <LegalH3>2.3 Government, statutory, and third-party fees</LegalH3>
      <p>
        Amounts paid or payable to government departments, registries, payment gateways, DSC
        providers, or other third parties are typically <strong>non-refundable</strong> by us after
        they have been remitted or committed, even if the underlying application is later rejected
        or delayed by the authority—unless the authority itself provides a refund mechanism, in
        which case we will reasonably assist you within our operational limits.
      </p>

      <LegalH2>3. Failed, duplicate, or erroneous charges</LegalH2>
      <LegalUl>
        <LegalLi>
          <strong>Failed transactions:</strong> If payment fails but your account was debited
          (rare), contact your bank and us with the transaction ID. Per RBI and network rules,
          reversals may be handled as a “auto-reversal” or chargeback; timelines depend on banks
          and Razorpay/Cashfree.
        </LegalLi>
        <LegalLi>
          <strong>Duplicate payments:</strong> If you were charged twice for the same order, email{' '}
          <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
            {supportEmail}
          </a>{' '}
          with both transaction references. After verification, we will initiate a refund for the
          duplicate amount per Section 5.
        </LegalLi>
        <LegalLi>
          <strong>Wrong amount:</strong> If you were charged an incorrect amount due to our error,
          we will correct it after verification.
        </LegalLi>
      </LegalUl>

      <LegalH2>4. Defective or deficient service delivery</LegalH2>
      <p>
        If you believe the service was not delivered as expressly agreed in your order (subject to
        authority-dependent outcomes), contact us within <strong>7 days</strong> of delivery or
        expected delivery. We will investigate and may offer rework, credit, or partial refund where
        we confirm a material failure attributable to us. This does not cover rejection of
        applications by government bodies for reasons beyond our control (incomplete documents,
        policy changes, objections, etc.).
      </p>

      <LegalH2>5. How refunds are processed</LegalH2>
      <LegalOl>
        <LegalLi>
          Email <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">{supportEmail}</a>{' '}
          with order ID, registered email/phone, reason, and payment proof (UTR / Razorpay or
          Cashfree payment ID).
        </LegalLi>
        <LegalLi>
          We aim to respond within <strong>3–5 business days</strong> and, if approved, initiate the
          refund through the same payment partner that processed the original transaction.
        </LegalLi>
        <LegalLi>
          Refunds to cards, UPI, or bank accounts follow the payment partner and bank settlement
          cycles (commonly <strong>5–14 business days</strong> after initiation).
        </LegalLi>
      </LegalOl>

      <LegalH2>6. Chargebacks and payment disputes</LegalH2>
      <p>
        If you initiate a chargeback or payment dispute with your bank, we may share transaction
        and service-delivery records with Razorpay, Cashfree, or the acquirer to defend a legitimate
        charge. Fraudulent chargebacks may result in account closure and legal recourse.
      </p>

      <LegalH2>7. Subscription or recurring billing</LegalH2>
      <p>
        If we introduce recurring plans, cancellation and refund rules for those plans will be
        stated at checkout and in an addendum to this policy. Unless stated otherwise, recurring
        charges stop from the next billing cycle after you cancel in the manner we specify.
      </p>

      <LegalH2>8. Non-waiver of statutory rights</LegalH2>
      <p>
        Nothing in this policy limits any non-waivable rights you may have under applicable consumer
        protection law in India.
      </p>

      <LegalH2>9. Contact</LegalH2>
      <p>
        Refund requests:{' '}
        <a href={`mailto:${supportEmail}`} className="text-primary-600 hover:underline">
          {supportEmail}
        </a>
        .{' '}
        <Link href="/contact" className="text-primary-600 hover:underline">
          Contact page
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}

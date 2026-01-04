import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/easyapprovallogo.png"
                alt="Easy Approval"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-bold">Easy Approval</span>
            </div>
            <p className="text-gray-400 text-sm">
              India&apos;s leading AI-powered corporate services and compliance platform.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services?category=startup" className="text-gray-400 hover:text-white">
                  Business Registration
                </Link>
              </li>
              <li>
                <Link href="/services?category=gst" className="text-gray-400 hover:text-white">
                  GST Services
                </Link>
              </li>
              <li>
                <Link href="/services?category=income-tax" className="text-gray-400 hover:text-white">
                  Income Tax
                </Link>
              </li>
              <li>
                <Link href="/services?category=mca" className="text-gray-400 hover:text-white">
                  MCA Compliance
                </Link>
              </li>
              <li>
                <Link href="/services?category=trademark" className="text-gray-400 hover:text-white">
                  Trademark & IP
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-400 hover:text-white">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="text-gray-400 hover:text-white">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Easy Approval. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


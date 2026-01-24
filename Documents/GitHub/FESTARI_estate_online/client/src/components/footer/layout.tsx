import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-800 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">
            Stay updated on what matters
          </h2>
          <p className="text-sm text-gray-600">
            Get alerts for new listings, artisan recommendations, and venue
            availability
          </p>
          <form className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <input
              type="email"
              name="newsletter-email"
              placeholder="Enter your email"
              className="w-full sm:w-72 px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#BE4D00] focus:border-[#BE4D00] text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#BE4D00] text-white text-sm font-medium hover:bg-[#a64300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BE4D00] h-13.25 w-47"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-500">
            By clicking Sign Up you&apos;re confirming that you agree with our
            Terms and Conditions.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4 text-sm">
          <div className="space-y-4">
            <div className="font-semibold">FestariEstate</div>
            <p className="text-gray-600 wrap-break-word">
              Stay informed about new properties, market insights, and platform
              updates delivered straight to your inbox.
            </p>
            <form className="flex gap-3 items-center">
              <input
                type="email"
                name="footer-email"
                placeholder="Email address"
                className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#BE4D00] focus:border-[#BE4D00] text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#BE4D00] text-white text-sm font-medium hover:bg-[#a64300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BE4D00] whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500">
              By subscribing you agree with our Privacy Policy and consent to receive updates from Real Estate Marketplace Platform.
            </p>
          </div>

          <div className="space-y-3 md:ml-16">
            <div className="font-semibold">Explore</div>
            <ul className="space-y-2 text-gray-700">
              <li>
                <Link href="/properties">Properties</Link>
              </li>
              <li>
                <Link href="/howitworks">How it works</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-semibold">Accounts</div>
            <ul className="space-y-2 text-gray-700">
              <li>
                <Link href="/signin">Seller Dashboard</Link>
              </li>
              <li>
                <Link href="/signup">Buyer Dashboard</Link>
              </li>
              <li>
                <Link href="/bookings">Artisan Dashboard</Link>
              </li>
              <li>
                <Link href="/contact">Venue Dashboard</Link>
              </li>
              <li>
                <Link href="/contact">Admin Dashboard</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-semibold">Follow us</div>
            <ul className="space-y-2 text-gray-700">
              <li>
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="https://x.com" target="_blank" rel="noreferrer">
                  X
                </Link>
              </li>
              <li>
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </Link>
              </li>

              <li>
                <Link
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  YouTube
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <span>
              © {new Date().getFullYear()}Festari Estate Marketplace Platform.
              All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-gray-900">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/sitemap" className="hover:text-gray-900">
              Site Map
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

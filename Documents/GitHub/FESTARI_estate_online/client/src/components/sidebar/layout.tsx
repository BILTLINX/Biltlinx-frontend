"use client";

import Image from "next/image";
import Link from "next/link";

export default function SidebarLayout() {
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white flex flex-col items-center border-r border-gray-200 overflow-y-auto">
      {/* Logo */}
      <div className="pt-4 text-center">
        <Image
          src="/FestariEstatesLogo.png"
          alt="Festari Estates Logo"
          width={250}
          height={250}
          priority
        />
        <p className=" text-[#BE4D00] tracking-wider">SEARCH. SECURE. SETTLE</p>
      </div>

      {/* Navigation */}
      <nav className="mt-8 w-full flex-1">
        <ul className="space-y-4 text-center text-[16px] font-lightbold ">
          <li>
            <Link href="/" className="text-black">
              Home
            </Link>
          </li>
          <li>
            <Link href="/services" className="text-black">
              Services
            </Link>
          </li>
          <li>
            <Link href="/gallery" className="text-black">
              Gallery
            </Link>
          </li>
          <li>
            <Link href="/properties" className="text-black">
              Properties
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-black">
              About Us
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-black">
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      {/* Social Media Icons */}
      <div className="pb-8 flex gap-6">
        <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <div className="w-6 h-6">
            <Image
              src="/instagram.png"
              alt="Instagram"
              width={24}
              height={24}
              className="w-full h-full hover:opacity-70 transition-opacity"
            />
          </div>
        </Link>
        <Link href="https://x.com" target="_blank" rel="noopener noreferrer">
          <div className="w-6 h-6">
            <Image
              src="/x.png"
              alt="X"
              width={24}
              height={24}
              className="w-full h-full hover:opacity-70 transition-opacity"
            />
          </div>
        </Link>
        <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <div className="w-6 h-6">
            <Image
              src="/facebook.png"
              alt="Facebook"
              width={24}
              height={24}
              className="w-full h-full hover:opacity-70 transition-opacity"
            />
          </div>
        </Link>
      </div>
    </aside>
  );
}

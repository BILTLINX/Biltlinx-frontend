import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="mt-4 bg-white border-b border-gray-200 px-8 py-4 w-110.25 h-12.5 mx-auto">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-4">
          <Link 
            href="/list-property" 
            className="text-gray-700 hover:text-gray-900 text-sm font-medium"
          >
            List a property
          </Link>
          <Link 
            href="/list-venue" 
            className="text-gray-700 hover:text-gray-900 text-sm font-medium"
          >
            List a venue
          </Link>
          <Link 
            href="/offer-service" 
            className="text-gray-700 hover:text-gray-900 text-sm font-medium"
          >
            Offer your service
          </Link>
        </div>
        
        <button 
          className="w-10 h-10 rounded-full bg-[#BE4D00] flex items-center justify-center hover:bg-[#a64300] transition-colors"
          aria-label="Filter"
        >
          <svg 
            className="w-5 h-5 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

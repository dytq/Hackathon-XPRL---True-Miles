import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Vehicle NFT Registry</h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Track vehicle history and ownership with secure, tamper-proof NFTs on the XRP Ledger
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/create-nft"
            className="rounded-lg bg-blue-600 text-white px-8 py-3 font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Create Vehicle NFT
          </Link>
          <Link
            href="/lookup-nft"
            className="rounded-lg border border-gray-300 bg-white text-gray-800 px-8 py-3 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Lookup Vehicle NFT
          </Link>
        </div>
      </section>

      <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center transition-all hover:shadow-md">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Create NFTs</h2>
          <p className="text-gray-600 mb-4">
            Create digital representations of vehicles with all important details securely stored on the XRP Ledger.
          </p>
          <Link href="/create-nft" className="text-blue-600 hover:text-blue-800 font-medium">
            Create NFT &rarr;
          </Link>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center transition-all hover:shadow-md">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">View Details</h2>
          <p className="text-gray-600 mb-4">
            Look up any vehicle NFT by its token ID to view comprehensive vehicle information and ownership details.
          </p>
          <Link href="/lookup-nft" className="text-blue-600 hover:text-blue-800 font-medium">
            Lookup NFT &rarr;
          </Link>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center transition-all hover:shadow-md">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Manage NFTs</h2>
          <p className="text-gray-600 mb-4">
            Use the dashboard to manage your wallet, view all your vehicle NFTs, and control their properties.
          </p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
            Open Dashboard &rarr;
          </Link>
        </div>
      </section>

      <section className="py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">For Vehicle Owners</h3>
            <ul className="space-y-4">
              <li className="flex">
                <span className="bg-blue-50 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">1</span>
                <span>Create a wallet on the XRP Ledger Testnet</span>
              </li>
              <li className="flex">
                <span className="bg-blue-50 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">2</span>
                <span>Register your vehicle by creating an NFT with all relevant details</span>
              </li>
              <li className="flex">
                <span className="bg-blue-50 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">3</span>
                <span>Keep your vehicle information updated with each inspection</span>
              </li>
              <li className="flex">
                <span className="bg-blue-50 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">4</span>
                <span>Transfer ownership when selling the vehicle</span>
              </li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">For Buyers & Inspectors</h3>
            <ul className="space-y-4">
              <li className="flex">
                <span className="bg-blue-50 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">1</span>
                <span>Request the NFT ID from the vehicle owner</span>
              </li>
              <li className="flex">
                <span className="bg-blue-50 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">2</span>
                <span>Verify vehicle history, maintenance records, and mileage</span>
              </li>
              <li className="flex">
                <span className="bg-blue-50 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">3</span>
                <span>Confirm ownership through the transparent XRPL blockchain</span>
              </li>
              <li className="flex">
                <span className="bg-blue-50 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center font-bold mr-3 flex-shrink-0">4</span>
                <span>Trust that vehicle data cannot be falsified or tampered with</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 border-t text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Create your first vehicle NFT or explore the system by looking up existing NFTs on the XRP Ledger Testnet.
        </p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 text-white px-8 py-3 font-medium hover:bg-blue-700 transition-colors shadow-sm inline-block"
        >
          Go to Dashboard
        </Link>
      </section>
    </div>
  );
}

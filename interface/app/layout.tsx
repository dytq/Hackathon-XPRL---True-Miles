import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Vehicle NFT Registry",
  description: "Track vehicle history and ownership using XRPL NFTs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="bg-white text-gray-800 p-4 shadow-sm border-b">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <Link href="/" className="text-xl font-bold mb-4 sm:mb-0 text-blue-600">
              Vehicle NFT Registry
            </Link>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link 
                    href="/" 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard" 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/create-nft" 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Create NFT
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/lookup-nft" 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Lookup NFT
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="container mx-auto py-8 px-4">
          {children}
        </main>
        
        <footer className="bg-white p-4 border-t">
          <div className="container mx-auto text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Vehicle NFT Registry | Built on XRPL</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

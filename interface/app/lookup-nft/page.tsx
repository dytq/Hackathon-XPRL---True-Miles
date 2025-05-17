'use client';

import { useState, useEffect } from 'react';
import { Client } from 'xrpl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LookupNFT() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  
  const [nftId, setNftId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [nftData, setNftData] = useState<any>(null);
  const [error, setError] = useState('');
  const [detailedView, setDetailedView] = useState(false);
  const [accountToSearch, setAccountToSearch] = useState('');

  // Helper function to convert hex to string
  const hexToString = (hex: string) => {
    try {
      // Remove 'hex' prefix if it exists
      const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
      return Buffer.from(cleanHex, 'hex').toString('utf8');
    } catch (error) {
      return '[Invalid URI format]';
    }
  };

  // Extract metadata from URI
  const extractMetadata = (uri: string) => {
    try {
      const decodedUri = hexToString(uri);
      // Check if it's a base64 data URI
      if (decodedUri.startsWith('data:application/json;base64,')) {
        const base64 = decodedUri.replace('data:application/json;base64,', '');
        const jsonStr = Buffer.from(base64, 'base64').toString('utf8');
        return JSON.parse(jsonStr);
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Lookup NFT using multiple approaches
  const lookupNFT = async () => {
    if (!nftId.trim()) {
      setError('Please enter an NFT ID');
      return;
    }

    setLoading(true);
    setError('');
    setNftData(null);

    let xrplClient: Client | null = null;
    
    try {
      xrplClient = new Client('wss://s.altnet.rippletest.net:51233');
      await xrplClient.connect();

      // If the user has provided an account to search, try that first
      if (accountToSearch) {
        const nft = await searchNFTInAccount(xrplClient, accountToSearch);
        if (nft) {
          setNftData({
            ...nft,
            owner: accountToSearch,
            metadata: nft.URI ? extractMetadata(nft.URI) : null
          });
          return;
        }
      }

      // Try searching through some recently created accounts from local storage
      const wallets = JSON.parse(localStorage.getItem('vehicleNftWallets') || '[]');
      
      for (const wallet of wallets) {
        const nft = await searchNFTInAccount(xrplClient, wallet.address);
        if (nft) {
          setNftData({
            ...nft,
            owner: wallet.address,
            metadata: nft.URI ? extractMetadata(nft.URI) : null
          });
          return;
        }
      }

      // If NFT is still not found, inform the user
      throw new Error('NFT not found. Please provide an account address to search.');
    } catch (err: any) {
      setError(`Failed to lookup NFT: ${err.message}`);
    } finally {
      if (xrplClient) {
        await xrplClient.disconnect();
      }
      setLoading(false);
    }
  };

  // Helper function to search for NFT in a specific account
  const searchNFTInAccount = async (client: Client, account: string) => {
    try {
      const response = await client.request({
        command: "account_nfts",
        account: account
      });

      // Find the specific NFT in the account's NFTs
      const matchingNFT = response.result.account_nfts.find(
        (nft: any) => nft.NFTokenID === nftId
      );

      return matchingNFT || null;
    } catch (error) {
      return null;
    }
  };

  // If we have an initial ID from the URL, look it up on first render
  useEffect(() => {
    if (initialId) {
      lookupNFT();
    }
  }, [initialId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Lookup Vehicle NFT</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
        
        <div className="mb-4">
          <label htmlFor="nftId" className="block text-sm font-medium mb-1">
            NFT ID
          </label>
          <input
            type="text"
            id="nftId"
            value={nftId}
            onChange={(e) => setNftId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter NFT ID"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="accountAddress" className="block text-sm font-medium mb-1">
            Account Address (optional)
          </label>
          <div className="text-xs text-gray-500 mb-2">
            If you know which account owns this NFT, entering it will speed up the search
          </div>
          <input
            type="text"
            id="accountAddress"
            value={accountToSearch}
            onChange={(e) => setAccountToSearch(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="r..."
          />
        </div>
        
        <button
          onClick={lookupNFT}
          disabled={loading}
          className={`w-full p-3 rounded text-white font-medium transition-all transform hover:scale-[1.01] hover:shadow-md ${
            loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </span>
          ) : 'Search for NFT'}
        </button>
        
        {error && (
          <div className="mt-4 p-4 border-l-4 border-red-500 bg-red-50 text-red-800 rounded-md shadow-sm">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
      
      {nftData && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {nftData.metadata?.brand} {nftData.metadata?.model} ({nftData.metadata?.year})
              </h2>
              <button
                onClick={() => setDetailedView(!detailedView)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm px-3 py-1 rounded transition-all"
              >
                {detailedView ? 'Simple View' : 'Technical Details'}
              </button>
            </div>
            {nftData.metadata && (
              <p className="text-blue-100 mt-2">VIN: {nftData.metadata.vehicle}</p>
            )}
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-gray-200 pb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Vehicle Information
                </h3>
                
                {nftData.metadata ? (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-gray-600">VIN:</span>
                      <span className="col-span-2 font-medium">{nftData.metadata.vehicle}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-gray-600">Brand:</span>
                      <span className="col-span-2 font-medium">{nftData.metadata.brand}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-gray-600">Model:</span>
                      <span className="col-span-2 font-medium">{nftData.metadata.model}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-gray-600">Year:</span>
                      <span className="col-span-2 font-medium">{nftData.metadata.year}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-gray-600">Last Inspection:</span>
                      <span className="col-span-2 font-medium">{nftData.metadata.lastInspection}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-gray-600">Mileage:</span>
                      <span className="col-span-2 font-medium">
                        {Number(nftData.metadata.mileage).toLocaleString()} km
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p>No detailed metadata available for this NFT</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* NFT Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-gray-200 pb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  NFT Information
                </h3>
                
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-gray-600">Token ID:</span>
                    <span className="col-span-2 text-sm font-medium break-all">{nftData.NFTokenID}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-gray-600">Issuer:</span>
                    <span className="col-span-2 text-sm font-medium break-all">{nftData.Issuer}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-gray-600">Owner:</span>
                    <span className="col-span-2 text-sm font-medium break-all">{nftData.owner}</span>
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-gray-600">Flags:</span>
                    <span className="col-span-2 font-medium flex items-center space-x-2">
                      <span>{nftData.Flags}</span>
                      <span className="text-xs text-gray-500">(bitflag value)</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-gray-600">Transferable:</span>
                    <span className="col-span-2 font-medium">
                      {(nftData.Flags & 1) === 1 ? (
                        <span className="text-green-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          No
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-gray-600">Burnable:</span>
                    <span className="col-span-2 font-medium">
                      {(nftData.Flags & 8) === 8 ? (
                        <span className="text-green-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          No
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {detailedView && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Technical Details
                </h3>
                
                <div className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-auto shadow-inner">
                  <pre className="text-xs font-mono">{JSON.stringify(nftData, null, 2)}</pre>
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              
              <Link
                href="/dashboard"
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
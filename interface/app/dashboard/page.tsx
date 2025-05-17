'use client';

import { useState, useEffect } from 'react';
import { Client, Wallet } from 'xrpl';
import Link from 'next/link';

interface SavedWallet {
  name: string;
  address: string;
  seed: string;
}

interface NFT {
  NFTokenID: string;
  URI?: string;
  Issuer: string;
  Flags: number;
  // Add other properties as needed
}

export default function Dashboard() {
  const [wallets, setWallets] = useState<SavedWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<SavedWallet | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletSeed, setWalletSeed] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load saved wallets from local storage
  useEffect(() => {
    const savedWallets = localStorage.getItem('vehicleNftWallets');
    if (savedWallets) {
      setWallets(JSON.parse(savedWallets));
    }
  }, []);

  // Save wallets to local storage when updated
  useEffect(() => {
    if (wallets.length > 0) {
      localStorage.setItem('vehicleNftWallets', JSON.stringify(wallets));
    }
  }, [wallets]);

  // Load NFTs when wallet is selected
  useEffect(() => {
    if (selectedWallet) {
      loadNFTs(selectedWallet);
    }
  }, [selectedWallet]);

  const loadNFTs = async (wallet: SavedWallet) => {
    setLoading(true);
    setNfts([]);
    setError('');
    
    try {
      const client = new Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();
      
      const response = await client.request({
        command: "account_nfts",
        account: wallet.address,
      });
      
      await client.disconnect();
      
      if (response.result.account_nfts) {
        setNfts(response.result.account_nfts as unknown as NFT[]);
      }
    } catch (err: any) {
      setError(`Failed to load NFTs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addWallet = () => {
    if (!walletName || !walletSeed) {
      setError('Please provide both wallet name and seed');
      return;
    }

    try {
      // Verify the seed is valid by creating a wallet
      const wallet = Wallet.fromSeed(walletSeed);
      
      const newWallet = {
        name: walletName,
        address: wallet.address,
        seed: walletSeed
      };
      
      setWallets(prev => [...prev, newWallet]);
      setWalletName('');
      setWalletSeed('');
      setSuccess('Wallet added successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(`Invalid seed: ${err.message}`);
    }
  };

  const selectWallet = (wallet: SavedWallet) => {
    setSelectedWallet(wallet);
  };

  const removeWallet = (indexToRemove: number) => {
    setWallets(wallets.filter((_, index) => index !== indexToRemove));
    if (selectedWallet && selectedWallet.address === wallets[indexToRemove].address) {
      setSelectedWallet(null);
      setNfts([]);
    }
  };

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NFT Dashboard</h1>
        <Link 
          href="/create-nft" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New NFT
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar with wallets */}
        <div className="md:col-span-4">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Your Wallets
            </h2>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-sm">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded shadow-sm">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p>{success}</p>
                </div>
              </div>
            )}
            
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Wallet
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Wallet Name</label>
                  <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="My Testnet Wallet"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-600">Wallet Seed</label>
                  <input
                    type="text"
                    value={walletSeed}
                    onChange={(e) => setWalletSeed(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="sXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  />
                </div>
                <button
                  onClick={addWallet}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex justify-center items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Wallet
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 flex items-center text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Saved Wallets
              </h3>
              
              {wallets.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p>No wallets saved yet</p>
                  <p className="text-sm mt-1">Add a wallet to get started</p>
                </div>
              ) : (
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {wallets.map((wallet, index) => (
                    <li 
                      key={wallet.address}
                      className={`p-3 rounded border cursor-pointer transition-all transform ${
                        selectedWallet?.address === wallet.address 
                          ? 'bg-blue-50 border-blue-300 shadow-sm' 
                          : 'hover:bg-gray-50 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div 
                          className="flex-1"
                          onClick={() => selectWallet(wallet)}
                        >
                          <p className="font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${selectedWallet?.address === wallet.address ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {wallet.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-1">{wallet.address}</p>
                        </div>
                        <button 
                          onClick={() => removeWallet(index)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove wallet"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Need test XRP?
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Get a test wallet with XRP from the XRPL Testnet Faucet to create and manage NFTs.
            </p>
            <a 
              href="https://test.xrplexplorer.com/faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit XRPL Testnet Faucet
            </a>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-8">
          {!selectedWallet ? (
            <div className="bg-white p-8 rounded-lg shadow-lg text-center min-h-[400px] flex flex-col items-center justify-center">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">No Wallet Selected</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                Please select a wallet from the sidebar or add a new one to view your NFTs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/create-nft"
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New NFT
                </Link>
                <a
                  href="https://test.xrplexplorer.com/faucet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Get Testnet XRP
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-5 text-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                    {selectedWallet.name}'s NFTs
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadNFTs(selectedWallet)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-1 px-3 rounded transition-colors flex items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      {loading ? 'Loading...' : 'Refresh'}
                    </button>
                    <Link
                      href="/create-nft"
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-1 px-3 rounded transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New NFT
                    </Link>
                  </div>
                </div>
                <p className="text-sm text-blue-100 mt-1">{selectedWallet.address}</p>
              </div>
              
              <div className="p-5">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-blue-600 shadow-sm">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading NFTs...
                    </div>
                  </div>
                ) : nfts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                    <p className="text-gray-500 mb-4">No NFTs found for this wallet</p>
                    <Link
                      href="/create-nft"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Your First NFT
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {nfts.map((nft) => {
                      const metadata = nft.URI ? extractMetadata(nft.URI) : null;
                      
                      return (
                        <div 
                          key={nft.NFTokenID} 
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-all transform hover:scale-[1.01] bg-white"
                        >
                          <div className="bg-gray-50 p-4 border-b">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg">
                                  {metadata?.brand || 'Unknown Brand'} {metadata?.model || 'Vehicle'} {metadata?.year && `(${metadata.year})`}
                                </h3>
                                {metadata ? (
                                  <div className="text-sm text-gray-600 mt-1">
                                    <p className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                      </svg>
                                      VIN: {metadata.vehicle}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-sm text-yellow-600 mt-1 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    No metadata available
                                  </p>
                                )}
                              </div>
                              <Link
                                href={`/lookup-nft?id=${nft.NFTokenID}`}
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Details
                              </Link>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            {metadata && (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Last Inspection</p>
                                  <p className="font-medium">{metadata.lastInspection}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Mileage</p>
                                  <p className="font-medium">{Number(metadata.mileage).toLocaleString()} km</p>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                              <div className="truncate max-w-[70%]">
                                <span className="font-medium">ID:</span> {nft.NFTokenID}
                              </div>
                              <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded-full ${(nft.Flags & 1) === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                  {(nft.Flags & 1) === 1 ? 'Transferable' : 'Non-transferable'}
                                </span>
                                <span className={`px-2 py-1 rounded-full ${(nft.Flags & 8) === 8 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                  {(nft.Flags & 8) === 8 ? 'Burnable' : 'Non-burnable'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
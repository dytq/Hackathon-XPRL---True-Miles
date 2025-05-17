'use client';

import { useState, useEffect } from 'react';
import { Client, Wallet } from 'xrpl';
import Link from 'next/link';

interface SavedWallet {
  name: string;
  address: string;
  seed: string;
}

export default function CreateNFT() {
  const [wallets, setWallets] = useState<SavedWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<SavedWallet | null>(null);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const [walletName, setWalletName] = useState('');
  
  const [formData, setFormData] = useState({
    vin: '',
    brand: '',
    model: '',
    year: 2023,
    lastInspectionDate: '',
    mileage: 0,
    seed: '', // The seed for the wallet
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; nftId?: string }>({ 
    success: false, 
    message: '' 
  });

  // Load saved wallets from localStorage on component mount
  useEffect(() => {
    const savedWallets = localStorage.getItem('vehicleNftWallets');
    if (savedWallets) {
      setWallets(JSON.parse(savedWallets));
    }
  }, []);

  const handleWalletSelect = (wallet: SavedWallet) => {
    setSelectedWallet(wallet);
    setFormData(prev => ({
      ...prev,
      seed: wallet.seed
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? Number(value) : value
    }));
  };

  const saveWallet = () => {
    if (!walletName || !formData.seed) {
      return;
    }

    try {
      // Verify the seed is valid
      const wallet = Wallet.fromSeed(formData.seed);
      
      const newWallet = {
        name: walletName,
        address: wallet.address,
        seed: formData.seed
      };
      
      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      localStorage.setItem('vehicleNftWallets', JSON.stringify(updatedWallets));
      
      setSelectedWallet(newWallet);
      setWalletName('');
      setShowWalletForm(false);
    } catch (error) {
      // Invalid seed, just ignore silently
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult({ success: false, message: '' });

    try {
      // Create a wallet from the provided seed
      const wallet = Wallet.fromSeed(formData.seed);
      
      // Connect to XRP Ledger
      const client = new Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();

      // Prepare NFT metadata
      const metadata = {
        vehicle: formData.vin,
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        lastInspection: formData.lastInspectionDate,
        mileage: formData.mileage,
      };

      // Convert metadata to URI format (base64)
      const metadataString = JSON.stringify(metadata);
      const metadataBase64 = Buffer.from(metadataString).toString('base64');
      const uri = `data:application/json;base64,${metadataBase64}`;
      // Convert the entire URI to hex format for XRPL
      const hexUri = Buffer.from(uri).toString('hex').toUpperCase();

      // Prepare NFT mint transaction
      const mintTx = {
        TransactionType: "NFTokenMint" as const,
        Account: wallet.address,
        URI: hexUri,
        Flags: 8, // Transferable and burnable (1 + 8 = 9, but using 8 for simplicity)
        NFTokenTaxon: 0,
        Fee: "12",
      };

      // Submit transaction
      const mintResult = await client.submitAndWait(mintTx, {
        wallet: wallet,
      });

      // Get the NFT ID from the transaction result
      const nfts = await client.request({
        command: "account_nfts",
        account: wallet.address,
      });

      // Disconnect from the client
      await client.disconnect();

      // Get the last minted NFT ID
      const nftId = nfts.result.account_nfts[nfts.result.account_nfts.length - 1].NFTokenID;
      
      setResult({ 
        success: true, 
        message: 'NFT created successfully!', 
        nftId 
      });
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: `Failed to create NFT: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Vehicle NFT</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Wallet</h2>
          
          {wallets.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select a saved wallet:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {wallets.map(wallet => (
                  <div
                    key={wallet.address}
                    className={`p-3 border rounded cursor-pointer transition ${
                      selectedWallet?.address === wallet.address 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleWalletSelect(wallet)}
                  >
                    <p className="font-medium">{wallet.name}</p>
                    <p className="text-xs text-gray-500 truncate">{wallet.address}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {showWalletForm ? (
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-medium mb-3">Save this wallet</h3>
              <div className="mb-3">
                <label className="block text-sm mb-1">Wallet Name</label>
                <input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="My Vehicle Wallet"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={saveWallet}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowWalletForm(false)}
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : formData.seed && !selectedWallet ? (
            <button
              type="button"
              onClick={() => setShowWalletForm(true)}
              className="text-blue-600 text-sm hover:underline"
            >
              Save this wallet for later
            </button>
          ) : null}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Vehicle Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">Vehicle Information</h2>
              
              <div>
                <label htmlFor="vin" className="block mb-1 font-medium">VIN</label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="brand" className="block mb-1 font-medium">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="model" className="block mb-1 font-medium">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            
            {/* Right column - Additional Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">Additional Details</h2>
              
              <div>
                <label htmlFor="year" className="block mb-1 font-medium">Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastInspectionDate" className="block mb-1 font-medium">Last Inspection Date</label>
                <input
                  type="date"
                  id="lastInspectionDate"
                  name="lastInspectionDate"
                  value={formData.lastInspectionDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="mileage" className="block mb-1 font-medium">Mileage (km)</label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Wallet Seed (if not using saved wallet) */}
          {!selectedWallet && (
            <div className="pt-4 border-t">
              <label htmlFor="seed" className="block mb-1 font-medium">Wallet Seed</label>
              <input
                type="text"
                id="seed"
                name="seed"
                value={formData.seed}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Use a testnet seed only. Get one from the 
                <a 
                  href="https://test.xrplexplorer.com/faucet" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                > XRPL Testnet Faucet</a>.
              </p>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-4 border-t">
            <Link 
              href="/dashboard"
              className="text-blue-600 hover:underline"
            >
              Back to Dashboard
            </Link>
            
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Creating NFT...' : 'Create NFT'}
            </button>
          </div>
        </form>
        
        {result.message && (
          <div className={`mt-6 p-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-medium">{result.message}</p>
            {result.nftId && (
              <div className="mt-4">
                <p className="font-medium">NFT ID:</p>
                <div className="bg-white p-3 rounded border mt-2 overflow-auto">
                  <code className="break-all">{result.nftId}</code>
                </div>
                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/lookup-nft?id=${result.nftId}`}
                    className="text-blue-600 hover:underline"
                  >
                    View NFT Details
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(result.nftId || '');
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Copy NFT ID
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
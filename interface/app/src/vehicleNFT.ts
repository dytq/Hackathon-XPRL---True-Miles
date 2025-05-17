import { Client, Wallet, NFTokenMintFlags } from 'xrpl';

interface VehicleInfo {
  vin: string;
  brand: string;
  model: string;
  year: number;
  lastInspectionDate: string;
  mileage: number;
}

export async function createVehicleNFT(
  vehicleInfo: VehicleInfo,
  wallet: Wallet
): Promise<string> {
  // Connect to XRP Ledger
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();

  try {
    // Prepare NFT metadata
    const metadata = {
      vehicle: vehicleInfo.vin,
      brand: vehicleInfo.brand,
      model: vehicleInfo.model,
      year: vehicleInfo.year,
      lastInspection: vehicleInfo.lastInspectionDate,
      mileage: vehicleInfo.mileage,
    };

    // Convert metadata to URI format (base64)
    const metadataString = JSON.stringify(metadata);
    const metadataBase64 = Buffer.from(metadataString).toString('base64');
    const uri = "uri test";
    // const uri = `data:application/json;base64,${metadataBase64}`;

    // Prepare NFT mint transaction
    const mintTx = {
      TransactionType: "NFTokenMint" as const,
      Account: wallet.address,
      URI: uri,
      Flags: NFTokenMintFlags.tfTransferable,
      NFTokenTaxon: 0, // Required field, using 0 as default
      Fee: "12", // Standard fee
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

    // Return the NFT ID of the last minted token
    return nfts.result.account_nfts[nfts.result.account_nfts.length - 1].NFTokenID;
  } catch (error: any) {
    await client.disconnect();
    throw new Error(`Failed to mint NFT: ${error.message}`);
  }
}

// Example usage:
/*
const wallet = Wallet.fromSeed("your_seed_here");
const vehicleInfo: VehicleInfo = {
  vin: "1HGCM82633A123456",
  brand: "Toyota",
  model: "Camry",
  year: 2020,
  lastInspectionDate: "2023-12-01",
  mileage: 50000
};

createVehicleNFT(vehicleInfo, wallet)
  .then(nftId => console.log("NFT created with ID:", nftId))
  .catch(error => console.error("Error:", error));
*/ 
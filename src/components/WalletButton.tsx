import { useState } from 'react';
import { BrowserProvider } from 'ethers';

export function WalletButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("wallet_switchEthereumChain", [{ chainId: "0x144" }]); // zkSync Era
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Please install a Web3 wallet like MetaMask to use this feature");
    }
  };

  return (
    <button 
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
    >
      {isConnecting ? 
        "Connecting..." : 
        account ? 
          truncateAddress(account) : 
          "Connect Wallet"
      }
    </button>
  );
}

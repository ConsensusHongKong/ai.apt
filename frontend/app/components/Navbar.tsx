"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";
import Link from "next/link";
import { getAptosAccount } from "../../app/utils/place-order";
import { shortenAddress } from "../utils/util";
import { WalletSelector } from "./wallet/WalletSelector";
import { ThemeToggle } from "./ThemeToggle";


const accountPrivateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY as string;


export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
      setWalletAddress(shortenAddress(user || "0x04c03edceda71bab13542c8908e19d1fd53ba412484fc1d7f66972705475152d") || "");
    }
  }, []);


  const handleLogin = (method: string) => {
    const account = getAptosAccount(accountPrivateKey);
    let walletAccount = '';
    if (account.accountAddress.toString()) {
      walletAccount = account.accountAddress.toString();
    } else {
      walletAccount = "0x04c03edceda71bab13542c8908e19d1fd53ba412484fc1d7f66972705475152d";
    }
    setIsLoggedIn(true);
    setWalletAddress(shortenAddress(walletAccount));
    setIsLoginModalOpen(false);
    localStorage.setItem("user", walletAccount);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center cursor-pointer">
              <Image src="/logo.jpg" alt="Logo" width={40} height={40} />
              <span className="mt-1 ml-2 text-xl font-bold text-mainColor">MarexAI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/trading-agents"
                className={`px-3 py-2 rounded-md ${
                  pathname === "/trading-agents" ? "bg-gray-100 text-mainColor" : "text-gray-600 hover:bg-gray-100"
                }`}>
                Trading Agents
              </Link>
              <Link
                href="/"
                className={`px-3 py-2 rounded-md ${
                  pathname === "/x-profile" ? "bg-gray-100 text-mainColor" : "text-gray-600 hover:bg-gray-100"
                }`}>
                X Profile
              </Link>
            </div>
          </div>
          <div className="flex-grow flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search agents..."
                className="w-full py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-mainColor"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex space-x-2 items-center justify-center">
              <div className="flex-grow text-right min-w-0">
                <WalletSelector />
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
    </nav>
  );
}

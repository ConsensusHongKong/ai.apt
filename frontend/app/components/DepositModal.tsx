"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (usdtAmount: string) => void;
  walletAddress: string;
}

export default function DepositModal({ isOpen, onClose, onConfirm, walletAddress }: DepositModalProps) {
  const [usdtAmount, setUsdtAmount] = useState("");
  const [aptAmount, setAptAmount] = useState("");
  const [warning, setWarning] = useState(false);
  const exchangeRate = 0.1; // 1 USDT = 0.1 APT

  useEffect(() => {
    if (usdtAmount) {
      const apt = Number.parseFloat(usdtAmount) * exchangeRate;
      setAptAmount(apt.toFixed(2));
    } else {
      setAptAmount("");
    }
  }, [usdtAmount]);

  if (!isOpen) return null;
  const amountConfirm = () => {
    if (Number.parseFloat(usdtAmount) < 300) {
      setWarning(true);
      return;
    } else if (Number.parseFloat(usdtAmount) > 2000) {
      setWarning(true);
      return;
    } else {
      setWarning(false);
    }
    onConfirm(usdtAmount);
    setUsdtAmount("")
  };
  const amountClose = () => {
    setUsdtAmount("")
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Deposit Funds</h2>
          <button onClick={amountClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Wallet Address:</p>
          <p className="font-mono bg-gray-100 p-2 rounded">{walletAddress}</p>
        </div>
        <div className="mb-4">
          <label htmlFor="usdt-amount" className="block text-sm font-medium text-gray-700 mb-1">
            USDC Amount:
          </label>
          <input
            type="number"
            id="usdt-amount"
            value={usdtAmount}
            min={300}
            max={2000}
            onChange={(e) => setUsdtAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter USDT amount"
          />
          {warning && <div className="text-red-700 my-1">usdtAmount min 300 and max 2000</div>}
        </div>
        {/* <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">APT Amount:</p>
          <p className="font-mono bg-gray-100 p-2 rounded">{aptAmount ? `${aptAmount} APT` : "-"}</p>
        </div> */}
        <button
          onClick={amountConfirm}
          className="w-full px-4 py-2 bg-mainColor text-white rounded-md hover:bg-mainColor transition-colors">
          Confirm Deposit
        </button>
      </div>
    </div>
  );
}

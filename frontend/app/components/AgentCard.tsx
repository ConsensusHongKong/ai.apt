"use client";

import Image from "next/image";
import Link from "next/link";
import { Twitter } from "lucide-react";

interface AgentProps {
  agent: {
    id: number;
    name: string;
    avatar: string;
    walletAddress: string;
    weeklyReturn: number;
    managedFunds: number;
    userCount: number;
    twitterHandle: string;
    description: string;
    riskLevel: string;
  };
}

export default function AgentCard({ agent }: AgentProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const toTwitter = (event: React.MouseEvent, url: string) => {
    event.stopPropagation();
    event.preventDefault();
    window.open(`https://twitter.com/${url}`);
  };
  return (
    <Link href={`/agent/${agent.id}/${agent.twitterHandle}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <Image src={agent.avatar} alt={agent.name} width={50} height={50} className="rounded-full" />
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{agent.name}</h2>
              <p className="text-sm text-gray-500">{agent.walletAddress}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Weekly Return</p>
              <p className="text-lg font-bold text-green-500">{agent.weeklyReturn}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Risk Level</p>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskLevelColor(agent.riskLevel)}`}>
                {agent.riskLevel}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Managed Funds</p>
              <p className="text-lg font-bold">${agent.managedFunds.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Users</p>
              <p className="text-lg font-bold">{agent.userCount}</p>
            </div>
          </div>
          <div className="mb-4 flex items-center">
            <Twitter className="text-blue-400 mr-2" size={18} />
            <div className="text-blue-500 hover:underline" onClick={(e) => toTwitter(e, agent.twitterHandle)}>
              @{agent.twitterHandle == "AIapt" ? 'ai.apt' : agent.twitterHandle}
            </div>
          </div>
          <p className="text-sm text-gray-600">{agent.description}</p>
        </div>
      </div>
    </Link>
  );
}

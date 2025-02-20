import Link from "next/link";
import { ArrowRight, Zap, Brain, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Unlock the Trillion-Dollar Potential of On-Chain Assets with AI-Driven Intelligence
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300">
          Let AI Agents Become Your 24/7 On-Chain Strategist — No Code, No Complexity, Just Alpha.
        </p>
        <Link
          href="/trading-agents"
          className="bg-mainColor hover:bg-mainColor text-white font-bold py-3 px-6 rounded-full inline-flex items-center transition duration-300">
          Get Started
          <ArrowRight className="ml-2" />
        </Link>
      </section>

      {/* Value Proposition Section */}
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            The On-Chain Migration Movement Needs a New Language — AI
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Traditional On-Chain Experience</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Zap className="mr-2 text-red-500" />
                  Manual swaps → Slippage traps
                </li>
                <li className="flex items-center">
                  <Zap className="mr-2 text-red-500" />
                  Static strategies → Missed trends
                </li>
                <li className="flex items-center">
                  <Zap className="mr-2 text-red-500" />
                  Sleep-deprived tracking → Burnout
                </li>
              </ul>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">MarexAI Revolutionary Solution</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Zap className="mr-2 text-mainColor" />
                  Autonomous execution → Zero emotional bias
                </li>
                <li className="flex items-center">
                  <Zap className="mr-2 text-mainColor" />
                  Dynamic agent swarm → Adaptive to any market pulse
                </li>
                <li className="flex items-center">
                  <Zap className="mr-2 text-mainColor" />
                  AI-curated insights → Wake up to profits
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Differentiation Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Architect Your Own AI Agent Ecosystem</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg">
              <Brain className="w-12 h-12 mb-4 text-mainColor" />
              <h3 className="text-xl font-semibold mb-2">Train Agents That Think Like You</h3>
              <p>Custom Model Training for Your Digital Twin</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <BarChart3 className="w-12 h-12 mb-4 text-mainColor" />
              <h3 className="text-xl font-semibold mb-2">Agent vs. Agent</h3>
              <p>Reinforcement Learning Arena for Strategy Optimization</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <Zap className="w-12 h-12 mb-4 text-mainColor" />
              <h3 className="text-xl font-semibold mb-2">One-Click War Room</h3>
              <p>Low-Code Multi-Chain Command Center Deployment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Taglines Section */}
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Revolutionizing On-Chain Asset Management</h2>
          <div className="space-y-8">
            <p className="text-2xl font-semibold">From Dumb Money to Self-Optimizing Portfolios</p>
            <p className="text-2xl font-semibold">Your AI Agent Army, Deployed in 3 Clicks</p>
            <p className="text-2xl font-semibold">The First Protocol to Turn On-Chain Data into Autopilot Yield</p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Coming Soon: AgentX Marketplace</h2>
          <p className="text-xl mb-8">Stay tuned for our revolutionary AI agent marketplace.</p>
          <Link
            href="/notify-me"
            className="bg-mainColor hover:bg-mainColor text-white font-bold py-3 px-6 rounded-full inline-flex items-center transition duration-300">
            Notify Me
            <ArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Data Visualization Section */}
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">The Cost of Inaction</h2>
          <p className="text-2xl mb-4">Every 10 ETH of sleeping assets = 1.2 ETH annualized alpha lost</p>
          <div className="bg-gray-700 p-6 rounded-lg inline-block">
            <p className="text-4xl font-bold">$1T</p>
            <p className="text-xl">Total On-Chain Asset Market</p>
          </div>
          <p className="text-2xl mt-8">Don't let your assets sleep. Wake them up with MarexAI.</p>
        </div>
      </section>
    </main>
  );
}

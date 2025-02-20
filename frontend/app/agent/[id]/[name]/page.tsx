"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import Image from "next/image";
import {
  RefreshCw,
  ArrowRight,
  Send,
  Loader2,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Play,
  Pause,
  Twitter,
  ExternalLink,
  Clock,
} from "lucide-react";
import DepositModal from "../../../components/DepositModal";
import { MdPreview, MdCatalog } from "md-editor-rt";
import "md-editor-rt/lib/preview.css";
import FullScreenLoading from "../../../components/FullScreenLoading";
import Toast from "../../../components/Toast";

import { getAptosAccount, getWalletUsdcBalance, placeMarketOrder, placeLimitOrder } from "../../../utils/place-order";
import { shortenAddress, formatMarketCoinValues } from "@/app/utils/util";
import { parseDomainOfCategoryAxis } from "recharts/types/util/ChartUtils";

const accountPrivateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY as string;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];
interface Message {
  sender: "user" | "ai";
  content: string;
  showButtons?: boolean;
  loading?: boolean;
}
interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}
interface Transaction {
  time: string;
  action: string;
  coin: string;
  amount: number;
  price: number;
}

interface MarketNews {
  title: string;
  description: string;
  published_at: string;
  source: string;
  link: string;
}

export default function AgentChat() {
  const params = useParams();
  const { id, name } = params;

  const [operationFrequency, setOperationFrequency] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      content: `Hello! I am your quant trading agent, designed to achieve a stable, low-risk, market-neutral return of 10%-15% per month. I specialize in BTC and APT trading and utilize a multi-strategy approach. 
      My general strategy is:
      🔹 ~ 50% of funds go into BTC and APT spot grid trading, capturing small but consistent profits.
      🔹 ~ 40% of funds are allocated to low-leverage trend trading (around 3x leverage).
      🔹 ~ 10% of funds go into high-leverage event-driven trading (approximately 20x leverage) to seize short-term high-reward opportunities.
      ✨ I monitor real-time market sentiment, news trends, and order book depth to dynamically adjust strategies.
      📊 I optimize position sizing to maintain neutrality, balancing profit potential and risk exposure.
      🚀 Fully automated execution, allowing you to track performance effortlessly.
      💡 Feel free to ask me anything! 
      ⚠️ Disclaimer:
      Please note that the projected return of 10%-15% per month is an estimate based on historical data. Actual returns may fall below expectations or result in losses. The market is unpredictable, and trading carries inherent risks. Please allocate funds based on your personal risk tolerance.`,
      showButtons: false,
      loading: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositInx, setDepositInx] = useState(-1);
  const [isTalking, setIsTalking] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [btcPrice, setBtcPrice] = useState({ price: 0, change: 0 });
  const [aptPrice, setAptPrice] = useState({ price: 0, change: 0 });
  const [marketNewsList, setMarketNewsList] = useState([]);
  const [marketNews, setMarketNews] = useState<MarketNews | null>(null);

  useEffect(() => {
    setIsClient(true);
    setConversationId(generateRandomString(13));
    handleDataBase("30500");
    setMarketNews({
      title: "New Regulatory Framework Proposed for Cryptocurrency Exchanges",
      description: "In a move that could reshape the crypto landscape, regulators have proposed a new framework...",
      source: "BlockchainInsider",
      link: "https://www.example.com/crypto-regulation-news",
      published_at: new Date().toISOString(),
    });
    setTransactions([
      {
        time: new Date().toLocaleTimeString(),
        action: "Buy",
        coin: "APT",
        amount: 85,
        price: 812,
      },
    ]);
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const user = localStorage.getItem("user") || "0x04c03edceda71bab13542c8908e19d1fd53ba412484fc1d7f66972705475152d"; // default to empty string
      setWalletAddress(shortenAddress(user));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTransactions((prevTransactions) => {
        const newTransaction = {
          time: new Date().toLocaleTimeString(),
          action: Math.random() > 0.5 ? "Buy" : "Sell",
          coin: ["APT", "BTC", "ETH"][Math.floor(Math.random() * 3)],
          amount: Math.floor(Math.random() * 100) + 1,
          price: Math.floor(Math.random() * 1000) + 100,
        };
        return [newTransaction, ...prevTransactions.slice(0, 19)];
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Auto hide after 3 seconds
  };
  const addMessage = (sender: "user" | "ai", content: string, showButtons = false, loading = false) => {
    setMessages((prev) => [...prev, { sender, content, showButtons, loading }]);
  };
  function generateRandomString(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  }
  const handleSend = async (newInput?: string, inx?: number) => {
    if (isTalking) return;
    let currentInputCopy = input || newInput;
    if (currentInputCopy?.trim()) {
      setInput("");
      setIsTalking(true);
      try {
        if (inx) {
          messages[inx - 1].content = currentInputCopy;
          messages[inx].content = "";
        } else {
          addMessage("user", currentInputCopy);
          addMessage("ai", "", false, true);
        }
        setTimeout(() => {
          scrollContentToBottom();
        }, 50);
        const response = await fetch("http://18.141.230.255:8090/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: conversationId,
            message: currentInputCopy,
            agent_id: Number(id),
          }),
        });
        const { body } = response;
        if (body) {
          const reader = body.getReader();
          let readerDone = false;
          let accumulatedData = "";
          while (!readerDone) {
            const { value, done } = await reader.read();
            readerDone = done;
            if (value) {
              const decoder = new TextDecoder("utf-8");
              accumulatedData += decoder.decode(value, { stream: true });
              const lines = accumulatedData.split("\n");
              accumulatedData = lines.pop() || "";
              if (lines && lines.length > 1) {
                lines.forEach((item) => {
                  if (!item.trim()) {
                    return;
                  }
                  if (item.startsWith("data:")) {
                    let parsedData;
                    try {
                      parsedData = JSON.parse(item.split("data:")[1]);
                    } catch (error) {
                      console.log("error", error);
                      return;
                    }
                    if (parsedData.event == "message" && parsedData.data == "<think>") {
                      parsedData.data = `<details open="" style="word-break: break-word;color:gray;background-color: #f8f8f8;padding: 8px;border-radius: 4px;"> <summary> Thinking... </summary>`;
                    } else if (parsedData.event == "message" && parsedData.data == "</think>") {
                      parsedData.data = "</details>";
                    }
                    if (parsedData.event == "message" && parsedData != undefined && parsedData != null) {
                      setIsTalking(true);
                      setMessages((prevMessages) => {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[inx ? inx : updatedMessages.length - 1] = {
                          ...updatedMessages[inx ? inx : updatedMessages.length - 1],
                          loading: false,
                          content: updatedMessages[inx ? inx : updatedMessages.length - 1].content + parsedData.data,
                        };
                        return updatedMessages;
                      });
                      scrollContentToBottom();
                    } else if (parsedData.event == "end") {
                      setIsTalking(false);
                      setMessages((prevMessages) => {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[inx ? inx : updatedMessages.length - 1] = {
                          ...updatedMessages[inx ? inx : updatedMessages.length - 1],
                          showButtons: true,
                          loading: false,
                        };
                        return updatedMessages;
                      });
                      scrollContentToBottom();
                    } else if (parsedData.event == "error") {
                      showToast("network error", "error");
                      scrollContentToBottom();
                    }
                  } else {
                    setIsTalking(false);
                  }
                });
              } else {
                setIsTalking(false);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error in sendMessages:", error);
      } finally {
      }
    }
  };

  // const regenerateAdvice = (message: object, inx: number) => {
  //   setMessages((prev) => {
  //     const newMessages = [...prev];
  //     newMessages.splice(inx, 1, { sender: "ai", content: "", showButtons: false });
  //     return newMessages;
  //   });
  //   let newInput = messages[inx - 1].content;
  //   setInput(messages[inx - 1].content);
  //   handleSend(newInput, inx);
  // };

  const scrollContentToBottom = () => {
    let content = document.querySelector(".message_list");
    content.scrollTop = content?.scrollHeight;
  };
  const handleDeposit = (inx: number) => {
    setIsDepositModalOpen(true);
    setDepositInx(inx);
  };
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirm = async (usdtAmount: string) => {
    setIsDepositModalOpen(false);
    setTotalValue(Number(usdtAmount));
    setTotalTitle("My holdings");
    handleDataBase(usdtAmount);
    // fetch("http://18.141.230.255:8090/merkleTradeAgent", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     amount: messages[depositInx - 1].content,
    //     message: messages[depositInx].content,
    //     agent_id: Number(id),
    //   }),
    // }).then((res) => {
    //   res
    //     .json()
    //     .then(async (data) => {
    //       console.log("merkleTradeAgent", data);
    //       const account = getAptosAccount(accountPrivateKey);
    //       const usdcBalance = await getWalletUsdcBalance(account.accountAddress);
    //       if (usdcBalance >= 300) {
    //         if (data.data.length == 2) {
    //           let strategy1 = data.data[0];
    //           let strategy2 = data.data[1];
    //           if (!strategy1.sizeDelta || !strategy1.collateralDelta || !strategy1.price) {
    //             showToast("Strategy 1 is missing required parameters", "error");
    //             setIsLoading(false);
    //             return;
    //           }
    //           const orderresponse1 = await placeLimitOrder(
    //             strategy1["isLong"],
    //             strategy1["pair"],
    //             account.accountAddress,
    //             BigInt(strategy1["sizeDelta"]),
    //             BigInt(strategy1["collateralDelta"]),
    //             BigInt(strategy1["price"]),
    //             strategy1["isIncrease"],
    //             BigInt(strategy1["stopLossTriggerPrice"]) || undefined,
    //             BigInt(strategy1["takeProfitTriggerPrice"]) || undefined,
    //             strategy1["canExecuteAbovePrice"] || false
    //           );
    //           let resultContent = "";
    //           if (orderresponse1) {
    //             resultContent = `Successfully place order: ${strategy1["pair"]} with ${formatMarketCoinValues(
    //               strategy1["sizeDelta"]
    //             )} USDC`;
    //           } else {
    //             resultContent = `Failed place order: ${strategy1["pair"]} with ${formatMarketCoinValues(
    //               strategy1["sizeDelta"]
    //             )} USDC`;
    //           }
    //           addMessage("ai", resultContent, false, false);

    //           // Check required parameters for strategy2
    //           if (!strategy2.sizeDelta || !strategy2.collateralDelta || !strategy2.price) {
    //             showToast("Strategy 2 is missing required parameters", "error");
    //             setIsLoading(false);
    //             return;
    //           }
    //           const orderresponse2 = await placeLimitOrder(
    //             strategy2["isLong"],
    //             strategy2["pair"],
    //             account.accountAddress,
    //             BigInt(strategy2["sizeDelta"]),
    //             BigInt(strategy1["collateralDelta"]),
    //             BigInt(strategy2["price"]),
    //             strategy2["isIncrease"],
    //             BigInt(strategy2["stopLossTriggerPrice"]) || undefined,
    //             BigInt(strategy2["takeProfitTriggerPrice"]) || undefined,
    //             strategy2["canExecuteAbovePrice"] || false
    //           );
    //           let resultContent2 = "";
    //           if (orderresponse2) {
    //             resultContent2 = `Successfully place order: ${strategy2["pair"]} with ${formatMarketCoinValues(
    //               strategy2["sizeDelta"]
    //             )} USDC`;
    //           } else {
    //             resultContent2 = `Failed place order: ${strategy2["pair"]} with ${formatMarketCoinValues(
    //               strategy2["sizeDelta"]
    //             )} USDC`;
    //           }
    //           addMessage("ai", resultContent2, false, false);
    //         }
    //         setIsLoading(false);
    //         setTimeout(() => {
    //           scrollContentToBottom();
    //         }, 50);
    //       } else {
    //         showToast("The current Aptos account does not have enough USDC balance.", "error");
    //         setIsLoading(false);
    //         setTimeout(() => {
    //           scrollContentToBottom();
    //         }, 50);
    //       }
    //     })
    //     .catch((err) => {
    //       setIsLoading(false);
    //       console.log(err);
    //     });
    // });
  };
  
let abortController = new AbortController();
let signal = abortController.signal;
  const [totalValue, setTotalValue] = useState(30500);
  const [totalTitle, setTotalTitle] = useState("Total Value");
  const [profitRate, setProfitRate] = useState(0);
  const [drawdown, setDrawdown] = useState(0);
  const [assetDistribution, setAssetDistribution] = useState([
    { name: "High-frequency Trading", value: 0, percentage: 0 },
    { name: "Staking", value: 0, percentage: 0 },
    { name: "Leverage Margin", value: 0, percentage: 0 },
  ]);
  const [profitData, setProfitData] = useState([]);
  const [holdingDistribution, setHoldingDistribution] = useState([
    { coin: "APT", amount: 0, percentage: 0, profitLoss: 0 },
    { coin: "BTC", amount: 0, percentage: 0, profitLoss: 0 },
    { coin: "ETH", amount: 0, percentage: 0, profitLoss: 0 },
    { coin: "USDC", amount: 0, percentage: 0, profitLoss: 0 },
  ]);
  const [ispush, setispush]  = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleDataBase = async (usdtAmount: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;
    if (!ispush) {
      return;
    }
    setispush(false)
    try {
      const response = await fetch("http://18.141.230.255:8090/realtime ", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: Number(id),
          amount: usdtAmount,
        }),
        signal,
      });
      const { body } = response;
      if (body) {
        const reader = body.getReader();
        let readerDone = false;
        let accumulatedData = "";
        while (!readerDone) {
          const { value, done } = await reader.read();
          readerDone = done;
          if (value) {
            const decoder = new TextDecoder("utf-8");
            accumulatedData = decoder.decode(value, { stream: true });
            const lines = accumulatedData.split("\n");
            if (lines && lines.length >= 1) {
              lines.forEach((item) => {
                if (!item.trim()) {
                  return;
                }
                if (item.startsWith("data:")) {
                  let parsedData;
                  try {
                    parsedData = JSON.parse(item.split("data:")[1]);
                  } catch (error) {
                    console.log("error", error);
                    return;
                  }
                  if (parsedData.event == "message" && parsedData != undefined && parsedData != null) {
                    setBtcPrice((prev) => ({
                      price: parsedData.data.last_crypto_prices && JSON.parse(parsedData.data.last_crypto_prices).bitcoin.usd,
                      change:
                        parsedData.data.last_crypto_prices &&
                        JSON.parse(parsedData.data.last_crypto_prices).bitcoin.usd - prev.price,
                    }));
                    setAptPrice((prev) => ({
                      price: parsedData.data.last_crypto_prices && JSON.parse(parsedData.data.last_crypto_prices).aptos.usd,
                      change:
                        parsedData.data.last_crypto_prices &&
                        JSON.parse(parsedData.data.last_crypto_prices).aptos.usd - prev.price,
                    }));
                    setMarketNewsList(parsedData.last_crypto_news && JSON.parse(parsedData.last_crypto_news));
                    setMarketNews(
                      parsedData.last_crypto_news &&
                        JSON.parse(parsedData.last_crypto_news)[
                          Math.floor(Math.random() * JSON.parse(parsedData.last_crypto_news).length)
                        ]
                    );
                    if (parsedData.trading_strategy) {
                      setTotalValue(JSON.parse(parsedData.trading_strategy).totalValueList[0]);
                      setProfitRate(JSON.parse(parsedData.trading_strategy).profitRate[0]);
                      setDrawdown(JSON.parse(parsedData.trading_strategy).drawdown[0]);
                      setAssetDistribution(JSON.parse(parsedData.trading_strategy).assetDistribution);
                      setProfitData(JSON.parse(parsedData.trading_strategy).profitData);
                      setHoldingDistribution(JSON.parse(parsedData.trading_strategy).holdingDistribution);
                    }
                    setispush(true);
                  }
                }
              });
            }
          }
        }
      }
    }
    catch (error: any) {
      if (error.name === "AbortError") {
        console.log("error AbortError");
      } else {
        console.log("error", error);
      }
    } finally {
      setispush(true);
    }
  };
  return (
    <div className="h-full bg-gray-100" id="agent_content">
      {isLoading && <FullScreenLoading />}
      <div className="flex h-full bg-gray-100 pt-8">
        <div className="w-[70%] px-8 pb-8 overflow-y-auto scrollbar-hidden">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Image
                  src={`/${name == "AIapt" ? "AIapt" : name}.jpg`}
                  alt="AIapt"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">{name == "AIapt" ? "ai.apt" : name}</h1>
                  <div className="flex items-center mt-1">
                    <a
                      href="https://twitter.com/ai_apt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-500 hover:underline mr-4">
                      <Twitter size={16} className="mr-1" />@{name == "AIapt" ? "ai.apt" : name}
                    </a>
                    <span className="text-gray-500 text-sm">{walletAddress}</span>
                  </div>
                </div>
              </div>
              <div>
                <button className="bg-mainColor text-white px-4 py-2 rounded mr-2" onClick={() => handleDeposit(0)}>
                  Deposit
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded">Withdraw</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">{totalTitle} (USDC)</h2>
                <p className="text-3xl font-bold">${totalValue}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">24H Profit Rate</h2>
                <p className={`text-3xl font-bold ${profitRate >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {profitRate >= 0 ? <ArrowUp className="inline" /> : <ArrowDown className="inline" />}
                  {Math.abs(profitRate)}%
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Current Drawdown</h2>
                <p className={`text-3xl font-bold ${drawdown > 5 ? "text-red-500" : "text-yellow-500"}`}>
                  {drawdown > 5 && <AlertTriangle className="inline mr-1" />}
                  {drawdown}%
                </p>
                <p className="text-sm text-gray-500">Risk Level: Low</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Asset Distribution</h2>
                {isClient && (
                  <PieChart width={300} height={200}>
                    <Pie data={assetDistribution} cx={150} cy={100} outerRadius={80} fill="#8884d8" dataKey="value">
                      {assetDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Profit Curve</h2>
                {isClient && (
                  <LineChart width={400} height={200} data={profitData}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-100 p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">Spot Grid Trading</h2>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: COLORS[0] }}></div>
                  <span className="font-medium">
                    ${assetDistribution[0].value.toLocaleString()} ({assetDistribution[0].percentage}%)
                  </span>
                </div>
                <p>Current Strategy：wBTC and APT High-frequency Spot Grid Trading</p>
                <p>Operation Frequency: {operationFrequency} times/second</p>
                <p>24H Yield: 1.2%</p>
                <div className="flex items-center mt-2">
                  <div className={`w-3 h-3 rounded-full ${isRunning ? "bg-green-500" : "bg-red-500"} mr-2`}></div>
                  <p>{isRunning ? "Running" : "Paused"}</p>
                  <button
                    className={`ml-4 px-3 py-1 rounded ${isRunning ? "bg-red-500" : "bg-green-500"} text-white`}
                    onClick={() => setIsRunning(!isRunning)}>
                    {isRunning ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">Low-leverage Trend Trading</h2>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: COLORS[1] }}></div>
                  <span className="font-medium">
                    ${assetDistribution[1].value.toLocaleString()} ({assetDistribution[1].percentage}%)
                  </span>
                </div>
                <p>
                  Current Strategy: Hedge with spot trading, calculating the net Delta, ensuring the overall risk is close to
                  zero.
                </p>
                <p>
                  <span className="text-red-500">3x</span> leverage
                </p>
                <p>24H Yield: 0.5%</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">High-leverage Event-driven Trading</h2>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: COLORS[2] }}></div>
                  <span className="font-medium">
                    ${assetDistribution[2].value.toLocaleString()} ({assetDistribution[2].percentage}%)
                  </span>
                </div>
                <p>Current Strategy: "Event capture," low trading frequency, small positions, supplementing overall returns</p>
                <p>
                  <span className="text-red-500">20-50x</span> leverage
                </p>
                <p>24H Yield: 3.5%</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Latest Market Update</h2>
              <div className="bg-gray-100 p-4 rounded">
                <div className="flex mb-4">
                  <div className="flex-1">
                    <span className="font-bold">BTC: </span>
                    <span className={btcPrice.change >= 0 ? "text-green-500" : "text-red-500"}>
                      ${btcPrice.price.toFixed(2)} ({btcPrice.change >= 0 ? "+" : ""}
                      {btcPrice.change.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="font-bold">APT: </span>
                    <span className={aptPrice.change >= 0 ? "text-green-500" : "text-red-500"}>
                      ${aptPrice.price.toFixed(2)} ({aptPrice.change >= 0 ? "+" : ""}
                      {aptPrice.change.toFixed(2)})
                    </span>
                  </div>
                </div>
                {marketNews && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">{marketNews.title}</h3>
                    {marketNews.description != "No description available" && (
                      <p className="text-sm mb-2">{marketNews.description}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500 mt-2">
                      <Clock size={14} className="mr-1" />
                      <span className="mr-2">{new Date(marketNews.published_at).toLocaleString()}</span>
                      <span className="mr-2">|</span>
                      <span className="mr-2">Source: {marketNews.source}</span>
                      <a
                        href={marketNews.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center">
                        Read more <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Real-time Transactions</h2>
              <div className="bg-gray-100 p-4 rounded h-[200px] overflow-y-auto">
                {transactions.length > 0 && (
                  <ul>
                    {transactions.map((tx, index) => (
                      <li key={index} className="mb-1 text-sm">
                        {tx.time} ▶ {tx.action} {tx.coin} {tx.amount} @ ${tx.price}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Holding Distribution</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left">Coin</th>
                      <th className="py-2 px-4 text-right">Amount</th>
                      <th className="py-2 px-4 text-right">Percentage</th>
                      <th className="py-2 px-4 text-right">Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdingDistribution.map((holding, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="py-2 px-4">{holding.coin}</td>
                        <td className="py-2 px-4 text-right">{holding.amount}</td>
                        <td className="py-2 px-4 text-right">{holding.percentage}%</td>
                        <td className={`py-2 px-4 text-right ${holding.profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {holding.profitLoss > 0 ? "+" : ""}
                          {holding.profitLoss}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        {/* chat */}
        <div className="w-[30%] bg-white border-l rounded-lg border-gray-200 flex flex-col pt-8">
          <div className="max-w-4xl h-full mx-auto bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <Image src={`/${name}.jpg`} alt="AIapt" width={40} height={40} className="rounded-full" />
                <h1 className="text-xl font-bold ml-3">{name}</h1>
              </div>
            </div>
            <div className="h-[calc(100%-148px)] overflow-y-auto p-4 message_list scrollbar-hidden">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                  <div className={`inline-block p-3 rounded-lg ${message.sender === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
                    {message.sender == "ai" && message.loading && (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-1" />
                        <span>AI is thinking...</span>
                      </div>
                    )}
                    {isClient && !message.loading && <MdPreview language="en-US" id={name} modelValue={message.content} />}
                    {isClient && !message.loading && <MdCatalog editorId={name} scrollElement="html" />}
                    {message.showButtons && (
                      <div className="mt-3 flex justify-end space-x-2">
                        {/* <button
                          onClick={() => {
                            regenerateAdvice(message, index);
                          }}
                          className="flex items-center px-3 py-1 bg-gray-200 text-sm text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
                          <RefreshCw className="mr-1" size={14} />
                          Regenerate
                        </button> */}
                        <button
                          onClick={() => handleDeposit(index)}
                          className="flex items-center px-3 py-1 bg-mainColor text-sm text-white rounded-md hover:bg-mainColor transition-colors">
                          Deposit
                          <ArrowRight className="ml-1" size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type your message..."
                  className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-mainColor"
                />
                <button
                  onClick={() => handleSend()}
                  className="px-4 py-2 h-[42px] bg-mainColor text-white rounded-r-md hover:bg-mainColor transition-colors">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onConfirm={(usdtAmount) => handleConfirm(usdtAmount)}
        walletAddress={walletAddress}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

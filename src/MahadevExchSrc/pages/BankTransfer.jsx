

import { useState, useEffect, useCallback } from "react"
import { useSelector } from "react-redux"


import { format } from "date-fns"
import { RefreshCw, ArrowDown, ArrowUp, AlertCircle, Info, Filter } from "lucide-react"

import { getUserId, selectSite } from "../../utils/helper/commonSelectors"
import { getPaymentsByUserId, getwithdrawals } from "../../api"

const BankTransfer = () => {
  const topHeaderColor = useSelector(selectSite())?.headerColor
  const userID = useSelector(getUserId())
  const [activeTab, setActiveTab] = useState("deposits")
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const getGradientStyle = () => ({
    backgroundImage: `linear-gradient(180deg, ${
      topHeaderColor?.start || "#3b82f6"
    }, ${topHeaderColor?.end || "#1d4ed8"})`,
  })

  // Fetch Deposits
  const fetchDeposits = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getPaymentsByUserId(userID)
      setDeposits(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Error fetching deposits:", error)
      setDeposits([])
    } finally {
      setLoading(false)
    }
  }, [userID])

  // Fetch Withdrawals
  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getwithdrawals(userID)
      const withdrawalData = Array.isArray(response) ? response : response.data?.data || []
      setWithdrawals(withdrawalData)
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
      setWithdrawals([])
    } finally {
      setLoading(false)
    }
  }, [userID])

  useEffect(() => {
    if (activeTab === "deposits") fetchDeposits()
    if (activeTab === "withdrawals") fetchWithdrawals()
  }, [activeTab, fetchDeposits, fetchWithdrawals])

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === "accepted") return "bg-green-100 text-green-800 border-green-300"
    if (statusLower === "pending") return "bg-yellow-100 text-yellow-800 border-yellow-300"
    return "bg-red-100 text-red-800 border-red-300"
  }

  const filterTransactions = (transactions) => {
    if (filterStatus === "all") return transactions
    return transactions?.filter((t) => t.status?.toLowerCase() === filterStatus.toLowerCase())
  }

  const TabContent = ({ transactions, type }) => {
    const filteredTransactions = filterTransactions(transactions)

    return (
      <div className="overflow-scroll">
        <div className="min-w-full rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-white text-xs uppercase" style={getGradientStyle()}>
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Trans. ID</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Time</th>
                <th className="px-4 py-3 text-center">Date</th>
                <th className="px-4 py-3 text-left">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions?.length > 0 ? (
                filteredTransactions?.slice()
                  .reverse()
                  ?.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {type === "deposits" ? transaction.UTR : transaction.transactionId || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold">
                        <div className="flex items-center justify-end">
                          <span className={`mr-1 ${type === "deposits" ? "text-green-600" : "text-red-600"}`}>
                            {type === "deposits" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                          </span>
                          {Number.parseFloat(
                            type === "deposits" ? transaction.amount : transaction.withdrawAmount || 0,
                          ).toLocaleString("en-IN")}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            transaction.status,
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                        {format(new Date(transaction.createdAt), "hh:mm a")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                        {format(new Date(transaction.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                        {transaction.remarks || "N/A"}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500 bg-gray-50">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-600 font-medium">No {type} found</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {type === "deposits"
                          ? "Your deposit history will appear here"
                          : "Your withdrawal history will appear here"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const totalDeposits = deposits?.reduce((sum, item) => sum + Number.parseFloat(item.amount || 0), 0)
  const totalWithdrawals = withdrawals?.reduce((sum, item) => sum + Number.parseFloat(item.withdrawAmount || 0), 0)

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4" style={getGradientStyle()}>
          <div className="flex justify-between items-center">
            <h2 className="text-md font-bold text-white flex items-center">
              <span>Transaction History</span>
              <div className="ml-2 bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                {activeTab === "deposits" ? deposits?.length : withdrawals?.length} records
              </div>
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center"
                title="Filter transactions"
              >
                <Filter size={18} className="text-white" />
              </button>
              <button
                onClick={() => (activeTab === "deposits" ? fetchDeposits() : fetchWithdrawals())}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center"
                title="Refresh transactions"
              >
                <RefreshCw size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Deposits</p>
                <p className="text-2xl font-bold text-green-600">{totalDeposits.toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ArrowDown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">{totalWithdrawals.toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <ArrowUp className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    filterStatus === "all"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("accepted")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    filterStatus === "accepted"
                      ? "bg-green-100 text-green-800 border-green-300"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    filterStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus("rejected")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    filterStatus === "rejected"
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
              activeTab === "deposits" ? "text-blue-600 border-b-2 border-blue-500" : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("deposits")}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowDown size={18} className={activeTab === "deposits" ? "text-blue-600" : "text-gray-500"} />
              <span>Deposits</span>
            </div>
          </button>
          <button
            className={`flex-1 py-4 px-4 text-center font-medium transition-colors ${
              activeTab === "withdrawals"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("withdrawals")}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowUp size={18} className={activeTab === "withdrawals" ? "text-blue-600" : "text-gray-500"} />
              <span>Withdrawals</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <>Loading...</>
            </div>
          ) : (
            <>
              {activeTab === "deposits" && <TabContent transactions={deposits} type="deposits" />}
              {activeTab === "withdrawals" && <TabContent transactions={withdrawals} type="withdrawals" />}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-center">
          <div className="flex items-center text-xs text-gray-500">
            <Info size={14} className="mr-1" />
            <span>Transaction history is updated in real-time</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankTransfer


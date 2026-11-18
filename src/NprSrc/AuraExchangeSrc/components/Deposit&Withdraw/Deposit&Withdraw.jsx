import { BadgeIndianRupee } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'


const DepositWithdraw = () => {
  return (
    <>

      <div className="flex w-[100%] sm:hidden block justify-center items-center  font-bold">
        <Link to={"/deposit"} className="flex items-center  w-[50%] justify-center space-x-1 p-2 bg-green-800 text-white text-xs hover:bg-green-700 transition-colors duration-300">
          <BadgeIndianRupee size={15} className='' />

          <span>Deposit</span>
        </Link>
        <Link to={"/withdraw"} className="flex items-center justify-center w-[50%] space-x-1 p-2 bg-red-800 text-white text-xs transition-colors duration-300">
          <BadgeIndianRupee size={15} />
          <span>Withdrawal</span>
        </Link>
      </div>
    </>
  )
}

export default DepositWithdraw

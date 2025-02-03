'use client'
import { api } from '@/trpc/react'
import React, { useState } from 'react'

const BillingPage = () => {
    const { data: user } = api.project.getMyCredits.useQuery()
    console.log(user?.credits)
    const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100])
    const creditsToBuyAmount = creditsToBuy[0]!
    const price = (creditsToBuyAmount / 50).toFixed(2)
  return (
    <div>
        <h1 className='text-xl font-semibold'>Billing</h1>
        <div className="h-2"></div>
        <p className='text-sm text-gray-500'>
            You currently have {user?.credits} credits.
        </p>
    </div>
  )
}

export default BillingPage
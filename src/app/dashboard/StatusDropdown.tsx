"use client";

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import React, { FC } from 'react'
import { changeOrderStatus } from './actions'
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';


const LABEL_MAP: Record< keyof typeof OrderStatus, string> = {
  awaiting_shipment: "Awaiting Shipment",
  fullfilled: "Fullfilled",
  shipped: "Shipped",
}

interface StatusDropdownProps {
  orderId: string,
  orderStatus: OrderStatus
}

const StatusDropdown: FC<StatusDropdownProps> = ({orderId, orderStatus}) => {

  const router = useRouter();

  const { mutate } = useMutation({
    mutationKey: ['change-order-status'],
    mutationFn: changeOrderStatus,
    onSuccess: () => router.refresh(),
    onError: (error) => {
      toast(error.message);
    },

  })

  return <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className='w-52 flex justify-between items-center'>
      {LABEL_MAP[orderStatus]} 
      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent className='p-0'>
    {
      Object.keys(OrderStatus).map((status) => (
        <DropdownMenuItem key={status} className={cn("flex text-sm gap-1 items-center p-2.5 cursor-default hover:bg-zinc-100", {
          "bg-zinc-100": orderStatus === status
        })}
        onClick={() => mutate({id: orderId, newStatus: status as OrderStatus})}
        >
          <Check className={cn("mr-2 h-4 w-4 text-primary", orderStatus === status ? "opacity-100" : "opacity-0")} />
          { LABEL_MAP[status as OrderStatus] } 
          
        </DropdownMenuItem>
      ))
    }

  </DropdownMenuContent>
</DropdownMenu>
}

export default StatusDropdown
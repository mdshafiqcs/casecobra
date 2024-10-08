"use client";

import React, { FC, ReactNode } from 'react'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'


const queryClient = new QueryClient()

interface ProviderProps {
  children: ReactNode
}

const Providers: FC<ProviderProps> = ({children}: ProviderProps) => {
  return <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
}

export default Providers
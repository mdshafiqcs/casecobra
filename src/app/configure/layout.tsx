import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import Steps from '@/components/Steps'
import React, { FC } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: FC<LayoutProps> = ({children}:LayoutProps) => {
  return <MaxWidthWrapper className='flex-1 flex flex-col'>
    <Steps />
    {children}
    </MaxWidthWrapper>
}

export default Layout
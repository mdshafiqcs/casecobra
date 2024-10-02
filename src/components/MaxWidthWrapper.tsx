import { cn } from '@/lib/utils';
import React, { FC } from 'react'


interface MaxWidthWrapperProps {
  className?: string;
  children: React.ReactNode;
}

const MaxWidthWrapper: FC<MaxWidthWrapperProps> = ({className, children}) => {
  return <div className={cn("h-full w-full max-w-screen-xl mx-auto px-2.5 md:px-20", className)}>
    {children}
  </div>
}

export default MaxWidthWrapper
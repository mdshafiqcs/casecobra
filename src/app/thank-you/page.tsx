
import React, { FC, Suspense } from 'react'
import ThankYou from './ThankYou'


const Page: FC = ({}) => {
  return <Suspense>
    <ThankYou />
  </Suspense>
}

export default Page
import { db } from '@/db';
import { notFound } from 'next/navigation';
import React, { FC } from 'react'
import DesignConfigurator from './DesignConfigurator';

interface PageProps {
  searchParams:{
    [key: string]: string | string[] | undefined
  }
}

const Page: FC<PageProps> = async ({searchParams}: PageProps) => {

 

  const {id} = searchParams;

  if(!id || typeof id !== "string") {
    return notFound();
  }


  const configuration = await db.configuration.findUnique({
    where: { id }
  })

  if(!configuration){
    return notFound();
  }

  const {imageUrl, width, height} = configuration;

  return <DesignConfigurator configId={id} imageUrl={imageUrl} imageDimensions={{width, height}} />
}

export default Page
"use client";

import React, { FC, useRef, useState, useTransition } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'

import NextImage from 'next/image';
import { cn, formatPrice } from '@/lib/utils';
import {Rnd} from "react-rnd"
import HandleComponent from '@/components/HandleComponent';
import { ScrollArea } from '@/components/ui/scroll-area';
import {Radio, RadioGroup, Label as RadioGroupLabel, Description as RadioGroupDescription} from "@headlessui/react"

import { COLORS, FINISHES, MATERIALS, MODELS } from '@/app/validators/option-validator';
import { Label } from '@/components/ui/label';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { BASE_PRICE } from '@/config/products';
import { useUploadThing } from '@/lib/uploadthing';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { saveConfig as _saveConfig, SaveConfigArgs } from './actions';
import { useRouter } from 'next/navigation';



interface DesignConfiguratorProps {
  configId: string
  imageUrl: string
  imageDimensions: {width: number, height: number}
}

const DesignConfigurator: FC<DesignConfiguratorProps> = ({configId, imageUrl, imageDimensions}: DesignConfiguratorProps) => {
  const router = useRouter();

  const { mutate: saveConfig, isPending: isLoading } = useMutation({
    mutationKey: ["save-config"],
    mutationFn: async (args: SaveConfigArgs) => {
      await Promise.all([
        saveConfiguration(),
        _saveConfig(args),
      ])
    },
    onError: () => {
      toast("Something went wrong while saving the configs. Please try again.")
    },
    onSuccess: () => {
      router.push(`/configure/preview?id=${configId}`);
    }
  })


  const [options, setOptions] = useState<{
    color: (typeof COLORS)[number];
    model: (typeof MODELS.options)[number];
    material: (typeof MATERIALS.options)[number];
    finish: (typeof FINISHES.options)[number];
  }>({
    color: COLORS[0],
    model: MODELS.options[0],
    material: MATERIALS.options[0],
    finish: FINISHES.options[0],
  });

  const [renderedDimensions, setRenderedDimensions] = useState({
    width: imageDimensions.width / 4,
    height: imageDimensions.height / 4,
  });

  const [renderedPosition, setRenderedPosition] = useState({
    x: 150,
    y: 205,
  });

  const phoneCaseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {startUpload} = useUploadThing("imageUploader");

  async function saveConfiguration() {

    try {

      const {left: caseLeft, top: caseTop, height, width} = phoneCaseRef.current!.getBoundingClientRect();
      const {left: containerLeft, top: containerTop} = containerRef.current!.getBoundingClientRect();

      const leftOffset = caseLeft - containerLeft;
      const topOffset = caseTop - containerTop;

      const actualX = renderedPosition.x - leftOffset;
      const actualY = renderedPosition.y - topOffset;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");

      const userImage = new Image();
      userImage.crossOrigin = "anonymous";
      userImage.src = imageUrl;

      await new Promise((resolve) => (userImage.onload = resolve));

      ctx?.drawImage(userImage, actualX, actualY, renderedDimensions.width, renderedDimensions.height);

      const base64 = canvas.toDataURL();
      const base64Data = base64.split(",")[1];

      const blob = base64ToBlob(base64Data, "image/png");
      const file = new File([blob], "filename.png", {type: "image/png"});

      await startUpload([file], {configId});

    } catch (error) {
      toast.error("Something went wrong while saving your configuration. Please try again.");
    } 
  }

  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for(let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: mimeType});
    return blob;
  }
  
  return <div className='relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-20 pb-20'>
    <div ref={containerRef} className='relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'>

      <div className='relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]'>
        <AspectRatio ref={phoneCaseRef} ratio={896/1831} className='pointer-events-none relative z-50 aspect-[896/1831] w-full'>
          <NextImage fill alt='phone image' src="/phone-template.png" className='pointer-events-none z-50 select-none' />
        </AspectRatio>  

        <div className='absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.5)] ' />
        <div className={cn(
          "absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]",
          `bg-${options.color.tw}`
        )} />
      </div>
      
      <Rnd
      default={{
        x: 150,
        y: 205,
        width: imageDimensions.width / 4,
        height: imageDimensions.height /4,
        
      }}
      className='absolute z-20 border-[3px] border-primary'
      lockAspectRatio
      resizeHandleComponent={{
        bottomRight: <HandleComponent />,
        bottomLeft: <HandleComponent />,
        topRight: <HandleComponent />,
        topLeft: <HandleComponent />,
      }}
      onResizeStop={(_, __, ref, ___, {x, y}) => {
        
        setRenderedDimensions({
          height: parseInt(ref.style.height.slice(0, -2)), 
          width: parseInt(ref.style.width.slice(0, -2)),
        });

        setRenderedPosition({x, y});

      }}

      onDragStop={(_, {x, y}) => {
        setRenderedPosition({x, y});
      }}

      >
        <div className='relative w-full h-full'>
          <NextImage fill src={imageUrl} alt='your image' className='pointer-events-none' />
        </div>
      </Rnd>
    </div>

    <div className='h-[37.5rem] w-full col-span-full lg:col-span-1 flex flex-col bg-white'>
      <ScrollArea className='relative flex-1 overflow-auto' >
        <div aria-hidden="true" className='absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none' />
        <div className='px-8 pb-12 pt-8'>
          <h2 className='tracking-tight font-bold text-3xl'>Customize your case</h2>
          <div className='w-full h-px bg-zinc-200 my-6' />
          <div className='relative mt-4 h-full flex flex-col justify-between'>
            <div className='flex flex-col gap-6'>
              <RadioGroup value={options.color} onChange={(val) =>{
                setOptions(prev => ({...prev, color: val}))
              }} >
                <Label>Color: {options.color.label}</Label>
                <div className='mt-3 flex items-center space-x-3'>
                  {
                    COLORS.map((color) =>(
                      <Radio 
                      key={color.label} 
                      value={color}
                      className={({checked}) => cn("relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2 border-transparent ", {
                        [`border-${color.tw}`]: checked
                      })}
                      >
                        <span className={cn(`bg-${color.tw}`, "h-8 w-8 rounded-full border border-black border-opacity-10")} />
                      </Radio>
                    ))
                  }
                </div>
              </RadioGroup>
              <div className='relative flex flex-col gap-3 w-full'>
                <Label>Model</Label>

                <DropdownMenu >
                  <DropdownMenuTrigger asChild >
                    <Button variant={'outline'} role='combobox' className='w-full justify-between'>
                      { options.model.label }
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50'/>
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent >
                    {
                      MODELS.options.map((model) => (
                        <DropdownMenuItem 
                        key={model.value}
                        className={cn(" flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100", {
                          "bg-zinc-100": model.value === options.model.value
                        })}
                        onClick={() => setOptions(prev => ({...prev, model}))}
                        >
                          <Check className={cn("mr-2 h-4 w-4", model.value === options.model.value ? "opacity-50" : "opacity-0" )} />
                          { model.label }
                        </DropdownMenuItem>
                      ))
                    }
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {
                [MATERIALS, FINISHES].map(({name, options: selectableOption}) => (
                  <RadioGroup 
                  key={name} 
                  value={options[name]} 
                  onChange={(val) => setOptions(prev => ({...prev, [name]: val}))}
                  >
                    <Label>{ name.slice(0,1).toUpperCase() + name.slice(1) }</Label>
                    <div className='mt-3 flex flex-col space-y-4'>
                      {
                        selectableOption.map((option) => (
                          <Radio 
                          key={option.value} 
                          value={option} 
                          className={({checked}) => cn("relative cursor-pointer rounded-lg bg-white px-6 py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none flex justify-between", {
                            "border-primary": checked
                          })}
                          >
                            <span className='flex items-center'>
                              <span className='flex flex-col text-sm'>
                                <RadioGroupLabel className='font-medium text-gray-900' as="span">
                                  {option.label}
                                </RadioGroupLabel>
                                {option.description && <RadioGroupDescription as ="span" className="text-gray-500">
                                    <span className='block sm:inline'>{option.description}</span>
                                  </RadioGroupDescription>}
                              </span>
                            </span>
                            <RadioGroupDescription as="span" className='mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right'>
                              <span className='font-medium text-gray-900'>
                                {formatPrice(option.price / 100)}
                              </span>
                            </RadioGroupDescription>
                          </Radio>
                        ))
                      }
                    </div>
                  </RadioGroup>
                ))
              }

            </div>
          </div>
        </div>
      </ScrollArea>
      <div className='w-full px-8 h-16 bg-white'>
        <div className='h-px w-full bg-zinc-200' />
        <div className='w-full h-full flex justify-end items-center'>
          <div className='w-full flex gap-6 items-center'>
            <p className='font-medium whitespace-nowrap'>
              {formatPrice((BASE_PRICE + options.material.price + options.finish.price) / 100)}
            </p>
            <Button 
            onClick={() => saveConfig({
              configId,
              color: options.color.value,
              material: options.material.value,
              finish: options.finish.value,
              model: options.model.value,
            })} 
            size="sm" 
            className='w-full'
            isLoading = {isLoading}
            loadingText='Saving Config...'
            >
              Continue <ArrowRight className='w-4 h-4 inline ml-1.5'/>

            </Button>
          </div>
        </div>
      </div>
      
    </div>

  </div>
}

export default DesignConfigurator
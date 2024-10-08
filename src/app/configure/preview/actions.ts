"use server";

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Order } from "@prisma/client";

export const createCheckoutSession = async ({configId}: {configId: string}) => {
  const configuration = await db.configuration.findUnique({
    where: {id: configId}
  });

  if(!configuration){
    throw new Error("No such configuration found");
  }

  const {getUser} = getKindeServerSession();
  const user = await getUser();

  if(!user) {
    throw new Error("You need to be logged in");
  }

  console.log(user);

  const {material, finish} = configuration;

  let price = BASE_PRICE;
  if(material === "polycarbonate") {
    price += PRODUCT_PRICES.material.polycarbonate;
  }
  if(finish === "textured"){
    price += PRODUCT_PRICES.finish.textured;
  }

  let order: Order | undefined = undefined;

  const existingOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      configurationId: configuration.id
    }
  })

// Invalid `prisma.order.create()` invocation:

// Foreign key constraint violated: `Order_userId_fkey (index)`
   

  if(existingOrder) {
    order = existingOrder;
  } else {
    order = await db.order.create({
      data: {
        amount: price / 100,
        userId: user.id,
        configurationId: configuration.id
      }
    })
  }

  const product = await stripe.products.create({
    name: "Custome iPhone Case",
    images: [configuration.imageUrl],
    default_price_data: {
      currency: "USD",
      unit_amount: price,
    },
  })

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVE_URL}/thank-you?orderId=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVE_URL}/configure/preview?id=${configuration.id}`,
    payment_method_types: ["card"],
    mode: "payment",
    shipping_address_collection: {allowed_countries: ["US", "BN"]},
    metadata: {
      userId: user.id,
      orderId: order.id,
    },
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  })
  
  return {url: stripeSession.url};

}
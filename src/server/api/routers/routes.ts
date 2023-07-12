import { apisKey, transactions } from "@/db/schema"
import { env } from "@/env.mjs"
import {
  createTRPCRouter,
  loggedProcedure,
  publicProcedure,
} from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

export const allRoutes = createTRPCRouter({
  products: publicProcedure.query(() => {
    return [
      {
        name: "Notebook",
        price: 1000,
        description: "A notebook for taking notes",
      },
      {
        name: "Pen",
        price: 20,
        description: "A pen for writing notes",
      },

      {
        name: "Pencil",
        price: 10,
        description: "A pencil for writing notes",
      },
      {
        name: "Eraser",
        price: 5,
        description: "An eraser for erasing notes",
      },
      {
        name: "Ruler",
        price: 50,
        description: "A ruler for measuring notes",
      },
    ]
  }),
  createCxPagOrder: loggedProcedure
    .input(
      z.object({
        products: z.array(
          z.object({
            name: z.string(),
            price: z.number(),
            description: z.string(),
            quantity: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const total = input.products.reduce((acc, product) => {
        return acc + product.price * product.quantity
      }, 0)

      const data = {
        amount: total,
        products: input.products,
        liquidation: true,
        returnLink: env.RETURN_LINK,
      }

      const apis = await ctx.db
        .select({
          apikey: apisKey.key,
          apisecret: apisKey.secret,
        })
        .from(apisKey)
        .where(eq(apisKey.userId, ctx.userId))
        .then((i) => i[0])
      if (!apis) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No api keys found",
        })
      }

      const res = await fetch(`${env.API_LINK}transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apis.apikey,
          apisecret: apis.apisecret,
        },
        body: JSON.stringify(data),
      })

      const json = (await res.json()) as unknown

      const parse = z.object({
        link: z.string(),
        transaction: z.string(),
      })

      const parsed = parse.safeParse(json)

      if (!parsed.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating order",
        })
      }

      await ctx.db.insert(transactions).values({
        products: JSON.stringify(input.products),
        value: total,
        status: "created",
        userId: ctx.userId,
        orderId: parsed.data.transaction,
      })

      return parsed.data.link
    }),

  getUserOrders: loggedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, ctx.userId))
      .orderBy(desc(transactions.createdAt))
  }),
  updateStatus: loggedProcedure.mutation(async ({ ctx }) => {
    const orders = await ctx.db
      .select({ orderId: transactions.orderId })
      .from(transactions)
      .where(eq(transactions.userId, "asdfasd"))
    if (orders.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No orders found",
      })
    }

    const apis = await ctx.db
      .select({
        apikey: apisKey.key,
        apisecret: apisKey.secret,
      })
      .from(apisKey)
      .where(eq(apisKey.userId, ctx.userId))
      .then((i) => i[0])
    if (!apis) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No api keys found",
      })
    }
    const res = await fetch(`${env.API_LINK}transactions/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apis.apikey,
        apisecret: apis.apisecret,
      },
      body: JSON.stringify({ transactions: orders.map((i) => i.orderId) }),
    })

    const parse = z.array(
      z.object({
        id: z.string(),
        status: z.enum([
          "created",
          "pending",
          "waiting liquidation",
          "done",
          "waiting new order",
        ]),
      })
    )

    const json = (await res.json()) as unknown

    const parsed = parse.safeParse(json)

    if (!parsed.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error getting order status",
      })
    }

    await Promise.all(
      parsed.data.map((i) =>
        ctx.db
          .update(transactions)
          .set({
            status: i.status,
          })
          .where(eq(transactions.orderId, i.id))
      )
    )

    return { status: "ok" }
  }),
  callback: publicProcedure
    .input(
      z.array(
        z.object({
          status: z.string(),
          transactionId: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      if (input.length === 0) {
        return { status: "ok" }
      }

      await Promise.all(
        input.map((i) =>
          ctx.db
            .update(transactions)
            .set({
              status: i.status,
            })
            .where(eq(transactions.orderId, i.transactionId))
        )
      )

      return { status: "ok" }
    }),
  linkPayment: loggedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const data = {
        returnLink: env.RETURN_LINK,
      }
      const apis = await ctx.db
        .select({
          apikey: apisKey.key,
          apisecret: apisKey.secret,
        })
        .from(apisKey)
        .where(eq(apisKey.userId, ctx.userId))
        .then((i) => i[0])
      if (!apis) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No api keys found",
        })
      }
      const res = await fetch(`${env.API_LINK}transaction/${input}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apis.apikey,
          apisecret: apis.apisecret,
        },
        body: JSON.stringify(data),
      })

      const json = (await res.json()) as unknown
      const parse = z.object({
        link: z.string(),
        transaction: z.string(),
      })

      const parsed = parse.safeParse(json)

      if (!parsed.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error linking order",
        })
      }

      await ctx.db
        .update(transactions)
        .set({
          status: "pending",
        })
        .where(
          and(
            eq(transactions.orderId, input),
            eq(transactions.userId, ctx.userId)
          )
        )

      return parsed.data.link
    }),
  registerApi: loggedProcedure
    .input(
      z.object({
        apikey: z.string().trim(),
        apisecret: z.string().trim(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.db
        .update(apisKey)
        .set({
          key: input.apikey,
          secret: input.apisecret,
        })
        .where(eq(apisKey.userId, ctx.userId))
      if (res.rowsAffected === 0) {
        await ctx.db.insert(apisKey).values({
          key: input.apikey,
          secret: input.apisecret,
          userId: ctx.userId,
        })
      }
      return { status: "ok" }
    }),
})

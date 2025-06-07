import "@opentelemetry/auto-instrumentations-node/register";

import { fastifyCors } from "@fastify/cors";
import { fastify } from "fastify";
import { trace } from "@opentelemetry/api";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { z } from "zod";
import { db } from "../db/client.ts";
import { schema } from "../db/schema/index.ts";
import { dispatchOrderCreated } from "../broker/messages/order-created.ts";
import { tracer } from "../trace/tracer.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifyCors, {
  origin: "*",
});

app.get("/health", () => {
  return "OK";
});

app.post(
  "/orders",
  {
    schema: {
      body: z.object({
        amount: z.coerce.number(),
      }),
    },
  },
  async (request, reply) => {
    const { amount } = request.body;

    console.log("Creating an order with amount", amount);

    const orderId = randomUUID();

    const customerId = "7214ebe9-f866-40dd-9459-0e5af0d820d9";

    await db.insert(schema.orders).values({
      id: orderId,
      customerId,
      amount,
    });

    const span = tracer.startSpan("possible-error");

    span.setAttribute("teste", "Hello world");

    await setTimeout(2000);

    span.end();

    trace.getActiveSpan()?.setAttribute("order_id", orderId);
    trace.getActiveSpan()?.setAttribute("amount", amount);
    trace.getActiveSpan()?.setAttribute("customer_id", customerId);

    dispatchOrderCreated({
      amount,
      orderId,
      customer: { id: "7214ebe9-f866-40dd-9459-0e5af0d820d9" },
    });

    return reply.status(201).send();
  }
);

app.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log("[Orders] HTTP server running!");
});

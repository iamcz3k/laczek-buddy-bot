import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { callUpstream, type UpstreamStatus } from "./pair.server";

const serverIdSchema = z
  .string()
  .regex(/^server([1-9]|[1-9][0-9]|100)$/, "Invalid server");

export const getServerStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ server: serverIdSchema }).parse(input))
  .handler(async ({ data }) => {
    const result = await callUpstream<UpstreamStatus>("status", data.server);
    return {
      count: typeof result.count === "number" ? result.count : 0,
      limit: typeof result.limit === "number" ? result.limit : 50,
      offline: Boolean(result.error),
    };
  });

export const generatePairCode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        server: serverIdSchema,
        number: z
          .string()
          .regex(/^\d+$/, "Numbers only")
          .min(10, "Enter a valid phone number (10-15 digits)")
          .max(15, "Enter a valid phone number (10-15 digits)"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const result = await callUpstream<{ c?: string }>("gen", {
      server: data.server,
      number: data.number,
    });

    if (!result.c) {
      throw new Error("Failed to generate code");
    }

    return { code: result.c };
  });

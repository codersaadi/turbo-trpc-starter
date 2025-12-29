import { createTRPCRouter, publicProcedure } from "../../trpc/edge";

export const systemRouter = createTRPCRouter({
    global: publicProcedure.query(() => ({

    })),
})
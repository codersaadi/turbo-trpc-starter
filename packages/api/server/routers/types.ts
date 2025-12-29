import type {
  inferRouterInputs,
  inferRouterOutputs,
  inferTRPCClientTypes,
} from "@trpc/server";
import type { AppRouter } from "./router";

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = inferRouterOutputs<AppRouter>;

type ClientTypes = inferTRPCClientTypes<AppRouter>;

export type { AppRouter, RouterInputs, RouterOutputs, ClientTypes };

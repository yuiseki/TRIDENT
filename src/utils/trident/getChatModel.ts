import { ChatOpenAI } from "@langchain/openai";

export type TridentRole = "inner" | "surface" | "deep";

const LLAMA_CPP_DEFAULT_PORTS: Record<TridentRole, number> = {
  inner: 18091,
  surface: 18092,
  deep: 18093,
};

// Mutual exclusion of USE_OPENAI_API / USE_LLAMA_CPP is enforced at boot by
// assertInferenceBackend(). USE_OPENAI_API=1 falls through to the final OpenAI
// branch (same as the no-flag default), so it doesn't need a dedicated case
// here.
export const getChatModel = (role?: TridentRole) => {
  if (process.env.USE_LLAMA_CPP === "1") {
    const port = role
      ? LLAMA_CPP_DEFAULT_PORTS[role]
      : Number(process.env.LLAMA_CPP_DEFAULT_PORT ?? 18091);
    const roleOverride = role
      ? process.env[`LLAMA_CPP_${role.toUpperCase()}_BASE_URL`]
      : undefined;
    const baseURL =
      roleOverride?.replace(/\/$/, "") ??
      process.env.LLAMA_CPP_BASE_URL?.replace(/\/$/, "") ??
      `http://127.0.0.1:${port}/v1`;
    const model = role ? `trident-${role}` : "local";
    console.log(`Using llama-server (${role ?? "default"}):`, baseURL, model);
    return new ChatOpenAI({
      configuration: { baseURL },
      model,
      apiKey: process.env.LLAMA_CPP_API_KEY ?? "dummy",
      temperature: 0,
    });
  } else if (process.env.CLOUDFLARE_AI_GATEWAY) {
    return new ChatOpenAI({
      configuration: {
        baseURL: process.env.CLOUDFLARE_AI_GATEWAY + "/openai",
      },
      model: "gpt-5.1",
      reasoning: {
        effort: "none",
      },
    });
  } else {
    return new ChatOpenAI({
      model: "gpt-5.1",
      reasoning: {
        effort: "none",
      },
    });
  }
};

type MessageRole = "user" | "assistant";

interface AnthropicResult {
  text: string;
}

const FALLBACK_TIMEOUT_MS = 2000;

const timeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const safeJson = <T,>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const callAnthropic = async (options: {
  apiKey?: string;
  model: string;
  system: string;
  messages: Array<{ role: MessageRole; content: string }>;
  maxTokens: number;
  temperature?: number;
  fallback: string;
  timeoutMs?: number;
}): Promise<{ text: string; source: "api" | "fallback" }> => {
  const apiKey = options.apiKey ?? (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined);
  if (!apiKey) {
    return { text: options.fallback, source: "fallback" };
  }

  try {
    const response = await timeout(
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: options.model,
          max_tokens: options.maxTokens,
          temperature: options.temperature ?? 0.3,
          system: options.system,
          messages: options.messages,
        }),
      }),
      options.timeoutMs ?? FALLBACK_TIMEOUT_MS,
    );

    if (!response.ok) {
      return { text: options.fallback, source: "fallback" };
    }

    const payload = (await response.json()) as { content?: AnthropicResult[] };
    const text = payload.content?.[0]?.text?.trim();
    if (!text) {
      return { text: options.fallback, source: "fallback" };
    }

    return { text, source: "api" };
  } catch {
    return { text: options.fallback, source: "fallback" };
  }
};

export const parseJsonOrFallback = <T,>(text: string, fallback: T): T => {
  const parsed = safeJson<T>(text);
  return parsed ?? fallback;
};

export interface ActionConverterResult {
  output: string;
  area: "career" | "health" | "mind" | "finance" | "relationships" | "creative";
  priority: "P1" | "P2" | "P3";
  source: "api" | "fallback";
}

const FALLBACK_MAP: Array<{ pattern: RegExp; area: ActionConverterResult["area"]; template: (text: string) => string }> = [
  {
    pattern: /(leetcode|dsa|backend|node|project|interview)/i,
    area: "career",
    template: (text) => `Complete one focused 45-minute career block for: ${text.slice(0, 80)}`,
  },
  {
    pattern: /(workout|sleep|run|gym|walk)/i,
    area: "health",
    template: (text) => `Schedule a 30-minute health action today: ${text.slice(0, 80)}`,
  },
  {
    pattern: /(money|saving|finance|budget|expense)/i,
    area: "finance",
    template: (text) => `Run a 20-minute money review and apply one change: ${text.slice(0, 80)}`,
  },
  {
    pattern: /(friend|family|relationship|call|text)/i,
    area: "relationships",
    template: (text) => `Reach out with one meaningful message: ${text.slice(0, 80)}`,
  },
  {
    pattern: /(write|design|music|creative|draw)/i,
    area: "creative",
    template: (text) => `Ship a small creative draft in 25 minutes: ${text.slice(0, 80)}`,
  },
];

const fallbackConvert = (input: string): ActionConverterResult => {
  const match = FALLBACK_MAP.find((entry) => entry.pattern.test(input));
  if (match) {
    return {
      output: match.template(input),
      area: match.area,
      priority: "P2",
      source: "fallback",
    };
  }

  return {
    output: `Define one 20-minute next step and schedule it today: ${input.slice(0, 80)}`,
    area: "mind",
    priority: "P2",
    source: "fallback",
  };
};

export const convertToAction = async (input: string): Promise<ActionConverterResult> => {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      output: "Write one clear action first.",
      area: "mind",
      priority: "P3",
      source: "fallback",
    };
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) {
    return fallbackConvert(trimmed);
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 220,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content:
              `Convert this vague thought into one concrete action task. Return strict JSON with keys output, area, priority. ` +
              `area must be one of career,health,mind,finance,relationships,creative. priority must be P1/P2/P3. Input: ${trimmed}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return fallbackConvert(trimmed);
    }

    const payload = (await response.json()) as { content?: Array<{ text?: string }> };
    const text = payload.content?.[0]?.text?.trim() ?? "";
    const parsed = JSON.parse(text) as { output?: string; area?: ActionConverterResult["area"]; priority?: ActionConverterResult["priority"] };

    if (!parsed.output || !parsed.area || !parsed.priority) {
      return fallbackConvert(trimmed);
    }

    return {
      output: parsed.output,
      area: parsed.area,
      priority: parsed.priority,
      source: "api",
    };
  } catch {
    return fallbackConvert(trimmed);
  }
};

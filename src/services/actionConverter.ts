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

  return fallbackConvert(trimmed);
};

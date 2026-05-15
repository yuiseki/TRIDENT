import { Ability } from "@/types/Ability";

export const parseSurfaceResJson = (surfaceResJson: {
  surface: string;
}): {
  ability?: Ability;
  reply: string;
  style?: string;
} => {
  const lines = surfaceResJson.surface.split("\n");
  let ability: Ability | undefined = undefined;
  let reply = "";
  let style: string | undefined = undefined;
  lines.map(async (line: string, idx: number) => {
    console.log(`surface line ${idx}:`, line);

    if (line.includes("Ability")) {
      const raw = line.split(": ")[1] as Ability;
      ability = raw.replace(/\s+/g, "") as Ability;
    }
    if (line.includes("Reply")) {
      reply = line.split(": ")[1];
    }
    if (line.includes("Style")) {
      const raw = line.split(": ")[1];
      if (raw) style = raw.replace(/\s+/g, "");
    }
  });

  return {
    ability,
    reply,
    style,
  };
};

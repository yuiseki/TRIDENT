import { Ability } from "@/types/Ability";

export const parseSurfaceResJson = (surfaceResJson: {
  surface: string;
}): {
  ability?: Ability;
  reply: string;
} => {
  const lines = surfaceResJson.surface.split("\n");
  let ability = undefined;
  let reply = "";
  lines.map(async (line: string, idx: number) => {
    console.log(`surface line ${idx}:`, line);

    if (line.includes("Ability")) {
      ability = line.split(": ")[1] as Ability;
    }
    if (line.includes("Reply")) {
      reply = line.split(": ")[1];
    }
  });

  return {
    ability,
    reply,
  };
};

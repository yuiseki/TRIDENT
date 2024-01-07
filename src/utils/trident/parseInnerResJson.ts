export const parseInnerResJson = (innerResJson: {
  inner: string;
}): {
  styles: {
    [key: string]: {
      emoji?: string;
      color?: string;
    };
  };
  linesWithTitle: string[];
  linesWithConfirm: string[];
  linesWithAreaAndOrConcern: string[];
} => {
  const styles: {
    [key: string]: {
      emoji?: string;
      color?: string;
    };
  } = {};
  const lines = innerResJson.inner.split("\n");
  lines.map(async (line: string, idx: number) => {
    console.log(`inner line ${idx}:`, line);

    if (line.includes("Emoji")) {
      const concern = line.split(":")[1].split(",")[0];
      const emoji = line.split(":")[1].split(",")[1];
      if (styles[concern] === undefined) {
        styles[concern] = {};
      }
      styles[concern].emoji = emoji;
    }
    if (line.includes("Color")) {
      const concern = line.split(":")[1].split(",")[0];
      const color = line.split(":")[1].split(", ")[1];
      if (styles[concern] === undefined) {
        styles[concern] = {};
      }
      styles[concern].color = color;
    }
  });

  const linesWithTitle = lines.filter((line: string) =>
    line.includes("TitleOfMap:")
  );

  // determine confirm message
  const linesWithConfirm = lines.filter((line: string) =>
    line.includes("ConfirmHelpful:")
  );

  const linesWithAreaAndOrConcern = lines.filter((line: string) =>
    line.includes("Area")
  );

  return {
    styles,
    linesWithTitle,
    linesWithConfirm,
    linesWithAreaAndOrConcern,
  };
};

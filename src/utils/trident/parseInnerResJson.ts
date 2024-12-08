export const parseInnerResJson = (innerResJson: {
  inner: string;
}): {
  styles: {
    [key: string]: {
      emoji?: string;
      color?: string;
    };
  };
  mapTitle?: string;
  confirmMessage: string;
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
  let mapTitle = undefined;
  if (linesWithTitle.length > 0) {
    mapTitle = linesWithTitle[0].split(":")[1];
  }

  // determine confirm message
  const linesWithConfirm = lines.filter((line: string) =>
    line.includes("ConfirmHelpful:")
  );
  let confirmMessage = undefined;
  if (linesWithConfirm.length > 0) {
    confirmMessage = linesWithConfirm[0].split(":")[1];
  }
  if (!confirmMessage) {
    confirmMessage = "Mapping has been completed. Have we been helpful to you? Do you have any other requests?";
  }

  const linesWithAreaAndOrConcern = lines.filter((line: string) =>
    line.includes("Area")
  );

  return {
    styles,
    mapTitle,
    confirmMessage,
    linesWithAreaAndOrConcern,
  };
};

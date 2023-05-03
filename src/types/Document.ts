export type Document = {
  pageContent: string;
  metadata: {
    source: string;
    title: string;
    "pdf.metadata._metadata.xmp:modifydate": string;
  };
};

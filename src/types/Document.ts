export type Document = {
  pageContent: string;
  metadata: {
    id: string;
    source: string;
    title: string;
    created_at: number;
    updated_at: number;
    "pdf.metadata._metadata.xmp:modifydate": string;
  };
};

export type Document = {
  pageContent: string;
  metadata: {
    id: string;
    source: string;
    title?: string;
    name: string;
    created_at?: number;
    updated_at: number;
    date_created: number;
    "pdf.metadata._metadata.xmp:modifydate": string;
  };
};

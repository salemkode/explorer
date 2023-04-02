export interface tableColumn {
  text: string | number;
  short?: boolean;
  copy?: boolean;
  url?: string;
  token?: {
    category: string;
    url: string;
  };
  warp?: boolean;
}

export interface contentWarp {
  title: string;
  text?: string | number;
  copy?: boolean;
  url?: string;
}

export * from "./bcmr-v1.schema";

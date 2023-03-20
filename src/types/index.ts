export interface tableColumn {
  text: string | number;
  short?: boolean;
  copy?: boolean;
  url?: string;
  tokenIcon?: string;
  warp?: boolean;
}

export interface contentWarp {
  title: string;
  text?: string | number;
  copy?: boolean;
}

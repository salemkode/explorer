import { toSvg } from "jdenticon";

export const createIdenticon = (tokenCategory: string, size = 128) => {
  return toSvg(tokenCategory, size, {
    lightness: {
      color: [0.39, 0.75],
      grayscale: [0.27, 0.9],
    },
    saturation: {
      color: 0.8,
      grayscale: 0.1,
    },
    padding: 0,
    replaceMode: "observe",
  });
};

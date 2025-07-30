import { createDefaultPreset } from "ts-jest";

const { transform } = createDefaultPreset();

/** @type {import('jest').Config} */
export default {
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    ...transform,
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  roots: ["<rootDir>/src", "<rootDir>/tests"],
};

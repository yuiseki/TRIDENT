import { assertInferenceBackend } from "@/lib/env/assertInferenceBackend";

export const register = (): void => {
  assertInferenceBackend();
};

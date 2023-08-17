import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(() => cleanup());

import { expect } from "vitest";
import matchers from "@testing-library/jest-dom/matchers";
expect.extend(matchers);

"use client";

import React, { createContext } from "react";

export const NetworkContext = createContext({
  token: "ML",
});

export default function NetworkProvider({ children }: any) {
  return <NetworkContext.Provider value={{ token: "ML" }}>{children}</NetworkContext.Provider>;
}

export {};

declare global {
  interface Window {
    __ENV__?: {
      NETWORK?: string;
    };
  }
}

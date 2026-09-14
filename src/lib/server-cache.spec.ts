jest.mock("server-only", () => ({}), { virtual: true });

import { withCache } from "./server-cache";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("withCache", () => {
  beforeEach(() => {
    (globalThis as any).__mintlayerExplorerServerCache = undefined;
  });

  it("should trigger exactly one load for concurrent cold calls and share the value", async () => {
    let loadCount = 0;
    const load = async () => {
      loadCount += 1;
      await sleep(20);
      return "cold-value";
    };

    const results = await Promise.all(
      Array.from({ length: 8 }, () => withCache("cold-key", 60_000, load)),
    );

    expect(loadCount).toEqual(1);
    expect(results).toEqual(Array.from({ length: 8 }, () => "cold-value"));
  });

  it("should not re-invoke the loader while the entry is within the TTL", async () => {
    let loadCount = 0;
    const load = async () => {
      loadCount += 1;
      return "fresh-value";
    };

    const first = await withCache("fresh-key", 60_000, load);
    const second = await withCache("fresh-key", 60_000, load);

    expect(loadCount).toEqual(1);
    expect(first).toEqual("fresh-value");
    expect(second).toEqual("fresh-value");
  });

  it("should serve the stale value immediately and refresh in the background after the TTL expires", async () => {
    let loadCount = 0;
    const load = async (value: string) => {
      loadCount += 1;
      await sleep(40);
      return value;
    };

    // Populate the cache with the initial value.
    const initial = await withCache("swr-key", 20, () => load("v1"));
    expect(initial).toEqual("v1");

    // Let the TTL expire.
    await sleep(30);

    // The entry is stale now: the stale value must come back without waiting
    // for the (40ms) background load to finish.
    const start = Date.now();
    const stale = await withCache("swr-key", 20, () => load("v2"));
    const elapsed = Date.now() - start;

    expect(stale).toEqual("v1");
    expect(elapsed).toBeLessThan(30);
    // The stale call triggered exactly one background refresh (initial load + 1).
    expect(loadCount).toEqual(2);

    // Calls during the background refresh still get the stale value and must
    // not trigger additional loads (they share the same refresh).
    const duringRefresh = await Promise.all([
      withCache("swr-key", 20, () => load("v2")),
      withCache("swr-key", 20, () => load("v2")),
      withCache("swr-key", 20, () => load("v2")),
    ]);

    expect(duringRefresh).toEqual(["v1", "v1", "v1"]);
    expect(loadCount).toEqual(2);

    // During the refresh, calls keep returning the stale value without new loads.
    // Once the refresh completes, the new value is served fresh.
    let revalidated = "";
    for (let i = 0; i < 100; i += 1) {
      revalidated = await withCache("swr-key", 20, () => load("v2"));
      if (revalidated === "v2") {
        break;
      }
      await sleep(5);
    }

    expect(revalidated).toEqual("v2");
    expect(loadCount).toEqual(2);
  });

  it("should not cache a rejected load and allow a subsequent successful call", async () => {
    let loadCount = 0;
    const failingLoad = async () => {
      loadCount += 1;
      throw new Error("load failed");
    };
    const succeedingLoad = async () => {
      loadCount += 1;
      return "recovered-value";
    };

    await expect(withCache("failing-key", 60_000, failingLoad)).rejects.toThrow("load failed");
    expect(loadCount).toEqual(1);

    const recovered = await withCache("failing-key", 60_000, succeedingLoad);
    expect(recovered).toEqual("recovered-value");
    expect(loadCount).toEqual(2);
  });
});

import { describe, expect, it } from "vitest";
import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import type { SurfaceMetrics } from "@clockwyrks/simple-2d";
import { game } from "./game";
import { BALL_R, HOLD_TIME } from "./constants";

type Snapshot = {
  ball: { x: number; y: number; held: boolean; holdTimer: number } | null;
  paddles: { left: { cy: number; vy: number; driven: boolean } };
};
const surface: SurfaceMetrics = {
  cssWidth: () => 1280,
  cssHeight: () => 720,
  dpr: () => 1,
  events: () => new EventTarget(),
};

describe("Carom state and simulation", () => {
  it("initializes a complete title state and exposes pose/read operations", async () => {
    const engine = createEngine({
      canvas: createCanvas(1280, 720) as never,
      surface,
      width: 1280,
      height: 720,
      game,
      clock: new ConstantClock(10),
    });
    await engine.initialize();
    const d = engine.debug;
    expect(d.snapshot(engine.state)).toMatchObject({
      screen: "title",
      mode: "solo",
      score: { p1: 0, p2: 0 },
      ball: { x: 640, y: 360, held: true, holdTimer: HOLD_TIME },
      obstacles: [{ index: 0 }, { index: 1 }],
    });
    engine.apply((s) => d.setBallPosition(s, 222, 333));
    expect(d.snapshot(engine.state)).toMatchObject({
      ball: { x: 222, y: 333 },
    });
    engine.destroy();
  });

  it("serves after the hold and advances the ball in logical units", async () => {
    const engine = createEngine({
      canvas: createCanvas(1280, 720) as never,
      surface,
      width: 1280,
      height: 720,
      game,
      clock: new ConstantClock(10),
    });
    await engine.initialize();
    const d = engine.debug;
    engine.apply((s) => d.setScreen(s, "countdown"));
    await engine.advance(101);
    expect(d.snapshot(engine.state)).toMatchObject({
      screen: "playing",
      ball: { held: false, holdTimer: 0 },
    });
    const before = (d.snapshot(engine.state) as Snapshot).ball!;
    await engine.advance(1);
    const after = (d.snapshot(engine.state) as Snapshot).ball!;
    expect(after.x).not.toBe(before.x);
    expect(after.y).toBeGreaterThan(BALL_R);
    engine.destroy();
  });

  it("applies driven paddle motion with boundary clamping", async () => {
    const engine = createEngine({
      canvas: createCanvas(1280, 720) as never,
      surface,
      width: 1280,
      height: 720,
      game,
      clock: new ConstantClock(100),
    });
    await engine.initialize();
    const d = engine.debug;
    engine.apply((s) =>
      d.setPaddleDriven(
        d.setScreen(
          d.setPaddleVy(d.setPaddleCy(s, "left", 56), "left", -900),
          "countdown",
        ),
        "left",
        true,
      ),
    );
    await engine.advance(2);
    expect((d.snapshot(engine.state) as Snapshot).paddles.left).toMatchObject({
      cy: 55,
      vy: 0,
      driven: true,
    });
    engine.destroy();
  });
});

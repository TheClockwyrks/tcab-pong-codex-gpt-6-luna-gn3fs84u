import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CAROM_DEBUG_VERSION,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  MATCHOVER_ITEMS,
  OBSTACLE_CENTERS,
  OBSTACLES,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PAUSE_ITEMS,
  PADDLE_HALF,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  PADDLE_H,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  SPEED_CAP,
  SPEED_MULT,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
  readonly muted: boolean;
}
export interface CaromDebugApi {
  version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, index: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, cy: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, vy: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, seconds: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, muted: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): unknown;
  menuItemRect(
    s: DeepReadonly<CaromState>,
    index: number,
  ): { x: number; y: number; w: number; h: number } | null;
}
export const BACKGROUND = "#080d18";
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const sign = () => (Math.random() < 0.5 ? -1 : 1);
const parked = (): BallState => ({
  x: FIELD_CX,
  y: FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: HOLD_TIME,
  serveSign: sign(),
  trail: [],
});
const initial = (muted = false): CaromState => ({
  screen: "title",
  mode: "solo",
  menuIndex: 0,
  titleIndex: 0,
  resumeScreen: "playing",
  score: { p1: 0, p2: 0 },
  winner: null,
  paddles: {
    left: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
    right: { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 },
  },
  ai: { tracking: true, movement: true },
  receiver: "left",
  ball: parked(),
  obstacles: OBSTACLE_CENTERS.map((p, index) => ({ index, cx: p.x, cy: p.y })),
  simTime: 0,
  muted,
});
const menu = (s: DeepReadonly<CaromState>) =>
  s.screen === "title"
    ? TITLE_ITEMS
    : s.screen === "paused"
      ? PAUSE_ITEMS
      : s.screen === "matchover"
        ? MATCHOVER_ITEMS
        : s.screen === "howto"
          ? ["BACK TO TITLE"]
          : [];
const rect = (index: number) => ({
  x: FIELD_CX - 170,
  y: 392 + index * 58,
  w: 340,
  h: 42,
});
const ballRequired = (s: DeepReadonly<CaromState>) => {
  if (!s.ball) throw new Error("Carom: no ball is present");
  return s.ball;
};
const replaceP = (
  s: DeepReadonly<CaromState>,
  side: Side,
  p: PaddleState,
): CaromState => ({ ...s, paddles: { ...s.paddles, [side]: p } });
function serveSign(): 1 | -1 {
  return sign() as 1 | -1;
}
function start(s: DeepReadonly<CaromState>, mode: Mode = s.mode): CaromState {
  return {
    ...s,
    screen: "countdown",
    mode,
    menuIndex: 0,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    receiver: "left",
    ball: parked(),
    paddles: {
      left: { ...s.paddles.left, cy: FIELD_CY, vy: 0 },
      right: { ...s.paddles.right, cy: FIELD_CY, vy: 0 },
    },
  };
}
function title(s: DeepReadonly<CaromState>): CaromState {
  const n = initial(s.muted);
  return {
    ...n,
    titleIndex: s.titleIndex,
    menuIndex: s.titleIndex,
    simTime: s.simTime,
    muted: s.muted,
  };
}
function hitRect(
  x: number,
  y: number,
  r: { x: number; y: number; w: number; h: number },
) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}
function commitMenu(s: CaromState): CaromState {
  if (s.screen === "title") {
    if (s.menuIndex === 0) return start({ ...s, titleIndex: 0 }, "solo");
    if (s.menuIndex === 1) return start({ ...s, titleIndex: 1 }, "versus");
    return { ...s, titleIndex: 2, screen: "howto", menuIndex: 0 };
  }
  if (s.screen === "howto") return title(s);
  if (s.screen === "paused") {
    if (s.menuIndex === 0) return { ...s, screen: s.resumeScreen };
    if (s.menuIndex === 1) return start(s);
    return title(s);
  }
  if (s.screen === "matchover") {
    if (s.menuIndex === 0) return start(s);
    return title(s);
  }
  return s;
}
export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>) {
    for (const action of ACTIONS)
      api.input.register(action, { keys: [...BINDINGS[action]] });
    api.audio.define(CUES.paddleHit, {
      wave: "square",
      freq: 420,
      freqTo: 250,
      durationMs: 55,
      gain: 0.1,
    });
    api.audio.define(CUES.wallBounce, {
      freq: 300,
      freqTo: 220,
      durationMs: 45,
      gain: 0.08,
    });
    api.audio.define(CUES.obstacleBounce, {
      wave: "triangle",
      freq: 540,
      freqTo: 330,
      durationMs: 75,
      gain: 0.1,
    });
    api.audio.define(CUES.score, {
      wave: "sawtooth",
      freq: 220,
      freqTo: 660,
      durationMs: 240,
      gain: 0.14,
    });
    for (const [name, source] of Object.entries({
      screen: (s: DeepReadonly<CaromState>) => s.screen,
      mode: (s: DeepReadonly<CaromState>) => s.mode,
      score: (s: DeepReadonly<CaromState>) => `${s.score.p1} : ${s.score.p2}`,
      ball: (s: DeepReadonly<CaromState>) =>
        s.ball ? `${s.ball.x.toFixed(1)},${s.ball.y.toFixed(1)}` : "none",
      velocity: (s: DeepReadonly<CaromState>) =>
        s.ball ? `${s.ball.vx.toFixed(1)},${s.ball.vy.toFixed(1)}` : "none",
      speed: (s: DeepReadonly<CaromState>) =>
        s.ball ? Math.hypot(s.ball.vx, s.ball.vy) : 0,
      spin: (s: DeepReadonly<CaromState>) => s.ball?.spin ?? 0,
      left: (s: DeepReadonly<CaromState>) =>
        `${s.paddles.left.cy.toFixed(1)} / ${s.paddles.left.vy.toFixed(1)}`,
      right: (s: DeepReadonly<CaromState>) =>
        `${s.paddles.right.cy.toFixed(1)} / ${s.paddles.right.vy.toFixed(1)}`,
    }))
      api.diagnostics.register(name, source);
    const debug: CaromDebugApi = {
      version: CAROM_DEBUG_VERSION,
      clearWorld: (s) => ({ ...s, ball: null, obstacles: [] }),
      spawnBall: (s) => ({ ...s, ball: parked() }),
      spawnObstacle: (s, i) => {
        if (i !== 0 && i !== 1)
          throw new RangeError(`invalid obstacle index ${i}`);
        return {
          ...s,
          obstacles: [
            ...s.obstacles.filter((o) => o.index !== i),
            {
              index: i,
              cx: OBSTACLE_CENTERS[i]!.x,
              cy: OBSTACLE_CENTERS[i]!.y,
            },
          ].sort((a, b) => a.index - b.index),
        };
      },
      reset: (s) => ({ ...initial(s.muted), simTime: 0 }),
      reconcile: (s) => ({ ...s }),
      setScreen: (s, screen) => ({ ...s, screen }),
      setMode: (s, mode) => ({ ...s, mode }),
      setMenuIndex: (s, menuIndex) => ({ ...s, menuIndex }),
      setTitleIndex: (s, titleIndex) => ({ ...s, titleIndex }),
      setResumeScreen: (s, resumeScreen) => ({ ...s, resumeScreen }),
      setScore: (s, p1, p2) => ({ ...s, score: { p1, p2 } }),
      setWinner: (s, winner) => ({ ...s, winner }),
      setReceiver: (s, receiver) => ({ ...s, receiver }),
      setPaddleCy: (s, side, cy) =>
        replaceP(s, side, { ...s.paddles[side], cy }),
      setPaddleVy: (s, side, drivenVy) =>
        replaceP(s, side, { ...s.paddles[side], drivenVy }),
      setPaddleDriven: (s, side, driven) =>
        replaceP(s, side, { ...s.paddles[side], driven }),
      setBallPosition: (s, x, y) => ({
        ...s,
        ball: { ...ballRequired(s), x, y },
      }),
      setBallVelocity: (s, vx, vy) => ({
        ...s,
        ball: { ...ballRequired(s), vx, vy },
      }),
      setBallSpin: (s, spin) => ({ ...s, ball: { ...ballRequired(s), spin } }),
      setBallHeld: (s, held) => ({ ...s, ball: { ...ballRequired(s), held } }),
      setBallHoldTimer: (s, holdTimer) => ({
        ...s,
        ball: { ...ballRequired(s), holdTimer },
      }),
      setBallServeSign: (s, serveSign) => ({
        ...s,
        ball: { ...ballRequired(s), serveSign },
      }),
      drawBallServeSign: (s) => ({
        ...s,
        ball: { ...ballRequired(s), serveSign: serveSign() },
      }),
      setAiTracking: (s, tracking) => ({ ...s, ai: { ...s.ai, tracking } }),
      setAiMovement: (s, movement) => ({ ...s, ai: { ...s.ai, movement } }),
      setMuted: (s, muted) => ({ ...s, muted }),
      snapshot: (s) => ({
        ...s,
        version: CAROM_DEBUG_VERSION,
        ball: s.ball
          ? { ...s.ball, speed: Math.hypot(s.ball.vx, s.ball.vy) }
          : null,
      }),
      menuItemRect: (s, i) => (i >= 0 && i < menu(s).length ? rect(i) : null),
    };
    return [initial(), debug];
  },
  update(state, api: UpdateApi, dt) {
    let s = { ...state, simTime: state.simTime + dt };
    const input = api.input as unknown as {
      pressed(name: string): boolean;
      value(name: string): number;
      pointerSamples(): { x: number; y: number; type: string }[];
    };
    const mute = input.pressed("mute");
    if (mute) api.audio.setMuted(!api.audio.muted());
    s = { ...s, muted: api.audio.muted() };
    const edge = (...names: string[]) => names.some((n) => input.pressed(n));
    if (
      s.screen === "title" ||
      s.screen === "howto" ||
      s.screen === "paused" ||
      s.screen === "matchover"
    ) {
      const up = edge("p1-up", "p2-up"),
        down = up ? false : edge("p1-down", "p2-down");
      const items = menu(s);
      if (
        s.screen === "title" ||
        s.screen === "paused" ||
        s.screen === "matchover"
      ) {
        if (up)
          s = {
            ...s,
            menuIndex: (s.menuIndex + items.length - 1) % items.length,
          };
        else if (down)
          s = { ...s, menuIndex: (s.menuIndex + 1) % items.length };
      }
      const samples = input.pointerSamples();
      for (const p of samples) {
        const idx = menu(s).findIndex((_, i) => hitRect(p.x, p.y, rect(i)));
        if (idx >= 0) s = { ...s, menuIndex: idx };
        if (p.type === "up" && idx >= 0) s = commitMenu(s);
      }
      const confirm = edge("confirm");
      const back = edge("back");
      if (s.screen === "title" && confirm) {
        s = { ...s, titleIndex: s.menuIndex };
        s = commitMenu(s);
      } else if (s.screen === "howto" && (confirm || back)) s = title(s);
      else if (s.screen === "paused" && (edge("pause") || back))
        s = { ...s, screen: s.resumeScreen };
      else if (s.screen === "paused" && confirm) s = commitMenu(s);
      else if (s.screen === "matchover" && back) s = title(s);
      else if (s.screen === "matchover" && confirm) s = commitMenu(s);
    } else if (s.screen === "countdown" || s.screen === "playing") {
      if (input.pressed("pause")) {
        s = { ...s, resumeScreen: s.screen, screen: "paused", menuIndex: 0 };
      }
    }
    if (s.screen !== "countdown" && s.screen !== "playing") return s;
    const move = (
      side: Side,
      upNames: string[],
      downNames: string[],
      ai = false,
    ): PaddleState => {
      const p = s.paddles[side];
      let vy = 0;
      if (p.driven) vy = p.drivenVy;
      else if (ai) {
        if (s.ai.movement) {
          let target = AI_HOME_Y,
            zone = AI_HOME_DEADZONE;
          if (
            s.ai.tracking &&
            s.screen === "playing" &&
            s.ball &&
            s.ball.vx > 0
          ) {
            target = s.ball.y - s.ball.vy * AI_REACT;
            zone = AI_DEADZONE;
          }
          const diff = target - p.cy;
          if (Math.abs(diff) > zone)
            vy =
              Math.sign(diff) *
              Math.min(AI_SPEED, dt > 0 ? Math.abs(diff) / dt : AI_SPEED);
        }
      } else {
        const u = upNames.reduce((a, n) => a + input.value(n), 0),
          d = downNames.reduce((a, n) => a + input.value(n), 0);
        vy = (d > u ? 1 : d < u ? -1 : 0) * PADDLE_SPEED;
      }
      const cy = clamp(p.cy + vy * dt, PADDLE_MIN_CY, PADDLE_MAX_CY);
      if (dt > 0) vy = (cy - p.cy) / dt;
      return { ...p, cy, vy };
    };
    s = {
      ...s,
      paddles: {
        left: move(
          "left",
          s.mode === "solo" ? ["p1-up", "p2-up"] : ["p1-up"],
          s.mode === "solo" ? ["p1-down", "p2-down"] : ["p1-down"],
        ),
        right: move("right", ["p2-up"], ["p2-down"], s.mode === "solo"),
      },
    };
    let b = s.ball;
    if (!b) return s;
    if (s.screen === "countdown") {
      const timer = b.holdTimer - dt;
      if (timer <= 0) {
        const dir = s.receiver === "left" ? -1 : 1;
        b = {
          ...b,
          held: false,
          holdTimer: 0,
          vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
          vy: b.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
          trail: [],
        };
        s = { ...s, screen: "playing" };
      } else b = { ...b, holdTimer: timer };
    }
    if (s.screen === "playing" && !b.held) {
      let x = b.x,
        y = b.y,
        vx = b.vx,
        vy = b.vy,
        spin = b.spin;
      let wall = false,
        paddle = false,
        obstacle = false;
      const speed = Math.hypot(vx, vy),
        n = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP)),
        h = dt / n;
      for (let k = 0; k < n; k++) {
        const sp = Math.hypot(vx, vy);
        if (sp > 0) {
          const a = (spin / sp) * h,
            c = Math.cos(a),
            sn = Math.sin(a);
          [vx, vy] = [vx * c - vy * sn, vx * sn + vy * c];
        }
        spin *= Math.pow(0.5, h / SPIN_HALFLIFE);
        x += vx * h;
        y += vy * h;
        if (y - BALL_R < 0 && vy < 0) {
          y = BALL_R;
          vy = -vy;
          wall = true;
        } else if (y + BALL_R > FIELD_H && vy > 0) {
          y = FIELD_H - BALL_R;
          vy = -vy;
          wall = true;
        }
        const collide = (
          x0: number,
          y0: number,
          x1: number,
          y1: number,
          kind: "left" | "right" | "obstacle",
          cy: number,
        ) => {
          if (
            x <= x0 - BALL_R ||
            x >= x1 + BALL_R ||
            y <= y0 - BALL_R ||
            y >= y1 + BALL_R
          )
            return;
          const ds = [
              x - (x0 - BALL_R),
              x1 + BALL_R - x,
              y - (y0 - BALL_R),
              y1 + BALL_R - y,
            ],
            m = Math.min(...ds),
            face = ds.indexOf(m);
          if (face === 0) {
            x = x0 - BALL_R;
            if (vx > 0) vx = -vx;
          } else if (face === 1) {
            x = x1 + BALL_R;
            if (vx < 0) vx = -vx;
          } else if (face === 2) {
            y = y0 - BALL_R;
            if (vy > 0) vy = -vy;
          } else {
            y = y1 + BALL_R;
            if (vy < 0) vy = -vy;
          }
          if (kind !== "obstacle" && (face === 0 || face === 1)) {
            const dir = kind === "left" ? 1 : -1,
              theta = clamp((y - cy) / PADDLE_HALF, -1, 1) * MAX_BOUNCE_ANGLE,
              ns = Math.min(Math.hypot(vx, vy) * SPEED_MULT, SPEED_CAP);
            vx = dir * ns * Math.cos(theta);
            vy = ns * Math.sin(theta);
            spin = clamp(
              spin + s.paddles[kind].vy * SPIN_FROM_PADDLE,
              -SPIN_CLAMP,
              SPIN_CLAMP,
            );
            x = kind === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R;
            paddle = true;
          } else if (kind === "obstacle") obstacle = true;
          else wall = true;
        };
        collide(
          P1_X0,
          s.paddles.left.cy - PADDLE_HALF,
          P1_X1,
          s.paddles.left.cy + PADDLE_HALF,
          "left",
          s.paddles.left.cy,
        );
        collide(
          P2_X0,
          s.paddles.right.cy - PADDLE_HALF,
          P2_X1,
          s.paddles.right.cy + PADDLE_HALF,
          "right",
          s.paddles.right.cy,
        );
        for (const o of s.obstacles) {
          const r = OBSTACLES[o.index];
          if (r) collide(r.x0, r.y0, r.x1, r.y1, "obstacle", o.cy);
        }
      }
      if (paddle) api.audio.play(CUES.paddleHit);
      if (wall) api.audio.play(CUES.wallBounce);
      if (obstacle) api.audio.play(CUES.obstacleBounce);
      b = { ...b, x, y, vx, vy, spin };
      if (x - BALL_R > FIELD_W || x + BALL_R < 0) {
        const p1 = x - BALL_R > FIELD_W,
          score = {
            p1: s.score.p1 + (p1 ? 1 : 0),
            p2: s.score.p2 + (p1 ? 0 : 1),
          },
          win = p1
            ? score.p1 >= WIN_SCORE && score.p1 - score.p2 >= WIN_LEAD
            : score.p2 >= WIN_SCORE && score.p2 - score.p1 >= WIN_LEAD;
        api.audio.play(CUES.score);
        s = {
          ...s,
          score,
          winner: win ? (p1 ? "left" : "right") : null,
          screen: win ? "matchover" : "countdown",
          menuIndex: 0,
          receiver: p1 ? "right" : "left",
          ball: win ? b : parked(),
        };
        b = s.ball;
      }
    }
    if (b && (s.screen === "playing" || s.screen === "countdown")) {
      const trail = [...b.trail, { x: b.x, y: b.y, t: s.simTime }].filter(
        (q) => s.simTime - q.t <= TRAIL_TIME,
      );
      b = { ...b, trail };
    }
    return { ...s, ball: b };
  },
  render(state, api: RenderApi) {
    const c = api.ctx;
    c.fillStyle = BACKGROUND;
    c.fillRect(0, 0, FIELD_W, FIELD_H);
    const glow = (x: number, y: number, r: number, color: string) => {
      c.shadowColor = color;
      c.shadowBlur = 24;
      c.fillStyle = color;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
    };
    c.strokeStyle = "#263449";
    c.lineWidth = 2;
    c.setLineDash([12, 14]);
    c.beginPath();
    c.moveTo(FIELD_CX, 38);
    c.lineTo(FIELD_CX, FIELD_H - 38);
    c.stroke();
    c.setLineDash([]);
    for (const o of state.obstacles) {
      c.fillStyle = "#f5a84b";
      c.shadowColor = "#f5a84b";
      c.shadowBlur = 18;
      c.beginPath();
      c.roundRect(o.cx - 10, o.cy - 70, 20, 140, 10);
      c.fill();
    }
    c.shadowBlur = 0;
    for (const [side, p] of Object.entries(state.paddles) as [
      Side,
      PaddleState,
    ][]) {
      c.fillStyle = side === "left" ? "#62e7ff" : "#ff6085";
      c.shadowColor = c.fillStyle;
      c.shadowBlur = 20;
      c.beginPath();
      c.roundRect(
        side === "left" ? P1_X0 : P2_X0,
        p.cy - PADDLE_HALF,
        PADDLE_W,
        PADDLE_H,
        8,
      );
      c.fill();
    }
    c.shadowBlur = 0;
    if (state.ball) {
      const b = state.ball;
      if (!b.held) {
        for (let i = 1; i < b.trail.length; i++) {
          const a = b.trail[i - 1]!,
            d = b.trail[i]!;
          c.strokeStyle = `rgba(101,231,255,${0.12 + (0.48 * i) / b.trail.length})`;
          c.lineWidth = 2 + (4 * i) / b.trail.length;
          c.beginPath();
          c.moveTo(a.x, a.y);
          c.lineTo(d.x, d.y);
          c.stroke();
        }
      }
      glow(b.x, b.y, BALL_R, "#eaffff");
    }
    if (
      state.screen === "playing" ||
      state.screen === "countdown" ||
      state.screen === "paused" ||
      state.screen === "matchover"
    ) {
      c.textAlign = "center";
      c.font = "700 56px system-ui";
      c.fillStyle = "#dce8f7";
      c.fillText(String(state.score.p1), FIELD_CX - 95, 84);
      c.fillText(String(state.score.p2), FIELD_CX + 95, 84);
      c.font = "600 13px system-ui";
      c.fillStyle = "#8294aa";
      c.fillText(
        state.mode === "solo"
          ? "SOLO • FIRST TO 11"
          : "LOCAL VERSUS • FIRST TO 11",
        FIELD_CX,
        112,
      );
    }
    if (state.screen === "title") {
      c.textAlign = "center";
      c.font = "900 112px system-ui";
      c.fillStyle = "#f1f7ff";
      c.shadowColor = "#62e7ff";
      c.shadowBlur = 32;
      c.fillText(TITLE_TEXT, FIELD_CX, 250);
      c.shadowBlur = 0;
      c.font = "600 15px system-ui";
      c.fillStyle = "#8ea3bb";
      c.fillText("THE ART OF THE BANK SHOT", FIELD_CX, 292);
      drawMenu(c, state, TITLE_ITEMS);
      c.font = "13px system-ui";
      c.fillStyle = "#61738a";
      c.fillText("W / S OR ↑ / ↓ TO SELECT     ENTER TO PLAY", FIELD_CX, 648);
    }
    if (state.screen === "howto") {
      c.textAlign = "center";
      c.fillStyle = "#eef5ff";
      c.font = "800 48px system-ui";
      c.fillText("HOW TO PLAY", FIELD_CX, 150);
      c.font = "20px system-ui";
      c.fillStyle = "#a9bad0";
      c.fillText(
        "Move your paddle to meet the ball. A centered hit flies straight.",
        FIELD_CX,
        240,
      );
      c.fillText(
        "Paddle motion adds spin: moving down bends the flight down.",
        FIELD_CX,
        281,
      );
      c.fillText(
        "Use the amber bumpers for bank shots and unexpected angles.",
        FIELD_CX,
        322,
      );
      c.fillStyle = "#62e7ff";
      c.fillText("PLAYER 1   W / S", FIELD_CX - 180, 390);
      c.fillStyle = "#ff6085";
      c.fillText("PLAYER 2   ↑ / ↓", FIELD_CX + 180, 390);
      drawMenu(c, state, ["BACK TO TITLE"]);
    }
    if (state.screen === "paused") {
      overlay(c);
      c.textAlign = "center";
      c.fillStyle = "#f4f8ff";
      c.font = "800 58px system-ui";
      c.fillText("PAUSED", FIELD_CX, 265);
      drawMenu(c, state, PAUSE_ITEMS);
    }
    if (state.screen === "countdown") {
      c.textAlign = "center";
      c.font = "700 22px system-ui";
      c.fillStyle = "#d4e3f4";
      c.fillText("GET READY", FIELD_CX, FIELD_CY + 118);
    }
    if (state.screen === "matchover") {
      overlay(c);
      c.textAlign = "center";
      c.fillStyle = "#f3f8ff";
      c.font = "800 58px system-ui";
      c.fillText(
        state.winner === "left" ? "PLAYER ONE WINS" : "PLAYER TWO WINS",
        FIELD_CX,
        244,
      );
      c.font = "22px system-ui";
      c.fillStyle = "#9db0c7";
      c.fillText(`${state.score.p1}  —  ${state.score.p2}`, FIELD_CX, 290);
      drawMenu(c, state, MATCHOVER_ITEMS);
    }
  },
};
function overlay(c: CanvasRenderingContext2D) {
  c.fillStyle = "rgba(4,8,16,.72)";
  c.fillRect(0, 0, FIELD_W, FIELD_H);
}
function drawMenu(
  c: CanvasRenderingContext2D,
  s: DeepReadonly<CaromState>,
  items: readonly string[],
) {
  c.textAlign = "center";
  c.font = "700 22px system-ui";
  items.forEach((item, i) => {
    const r = rect(i),
      active = i === s.menuIndex;
    c.fillStyle = active ? "#112d40" : "rgba(255,255,255,.04)";
    c.strokeStyle = active ? "#62e7ff" : "#344257";
    c.lineWidth = active ? 2 : 1;
    c.beginPath();
    c.roundRect(r.x, r.y, r.w, r.h, 12);
    c.fill();
    c.stroke();
    c.fillStyle = active ? "#eafaff" : "#94a4b8";
    c.fillText(item, FIELD_CX, r.y + 28);
  });
}

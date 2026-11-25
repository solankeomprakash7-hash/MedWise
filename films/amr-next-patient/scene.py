"""Koi Aur Dawai? -- an AMR stewardship film for Indian clinicians.

Everything is drawn in code (no photos). The NICU, the mother and the OPD are an ILLUSTRATIVE story:
they are drawn as simple line illustrations, tagged as such, never as real patients.

Clusters on the board (world x):
  NICU        0       incubator, monitor, lab report, the glass, the title
  OPD         22000   token slip, the ask, the ten-second clock, the prescription
  COUNT       44000   beds (NCDC survey), prophylaxis, imipenem bar (ICMR)
  WHO PAYS    66000   crumpled slip, home/ward/water, NICU/post-op/ICU
  STEWARD     88000   five habits, the red line strip
  CLOSE       88000+  the week, WhatsApp, back to the clock, back to the NICU
"""
import math

import skia

from engine import (BigText, Card, Counter, Film, Item, PenMark, Stamp, StringLine, HILITE, WHITE,
                    clamp, draw_text, ease_in_out, ease_out_back, ease_out_cubic, paint, partial_path, ramp,
                    text_width)

RED = (214, 52, 44)
AMBER = (246, 190, 70)
TEAL = (90, 214, 190)
SOFT = (200, 208, 224)
PAPER = (244, 240, 230)
INK = (30, 30, 36)

NICU_X, OPD_X, COUNT_X, PAY_X, STEW_X = 0, 22000, 44000, 66000, 88000


# ---------------------------------------------------------------- custom illustrations
class Box(Item):
    """Base for simple line illustrations: fades in, optional dim factor over time."""
    z = 10

    def __init__(self, x, y, w, h, t_in, t_out=None, z=None, sfx=False):
        super().__init__(t_in, t_out, z, sfx)
        self.x, self.y, self.w, self.h = x, y, w, h

    def bounds(self, res):
        return skia.Rect.MakeXYWH(self.x - self.w, self.y - self.h, self.w * 2, self.h * 2)

    def alpha(self, t, dur=0.6):
        return ramp(t, self.t_in, dur) * self.fade(t)


class Incubator(Box):
    """A neonatal incubator in thin glowing lines, a tiny swaddled baby inside."""

    def draw(self, c, res, t):
        a = self.alpha(t, 1.2)
        if a <= 0:
            return
        x, y, w, h = self.x, self.y, self.w, self.h
        line = paint(SOFT, 0.85 * a, stroke=18)
        glow = paint((140, 190, 255), 0.18 * a, stroke=60, blur=40)
        dome = skia.Path()
        dome.moveTo(x - w / 2, y); dome.lineTo(x - w / 2, y - h * 0.45)
        dome.cubicTo(x - w / 2, y - h, x + w / 2, y - h, x + w / 2, y - h * 0.45); dome.lineTo(x + w / 2, y)
        dome.close()
        c.drawPath(dome, paint((120, 160, 220), 0.07 * a))
        c.drawPath(dome, glow); c.drawPath(dome, line)
        # porthole
        c.drawCircle(x - w * 0.28, y - h * 0.38, h * 0.11, paint(SOFT, 0.6 * a, stroke=12))
        # base and stand
        c.drawRoundRect(skia.Rect.MakeXYWH(x - w * 0.56, y, w * 1.12, h * 0.16), 30, 30, paint((60, 66, 84), a))
        c.drawRoundRect(skia.Rect.MakeXYWH(x - w * 0.56, y, w * 1.12, h * 0.16), 30, 30, line)
        c.drawLine(x - w * 0.35, y + h * 0.16, x - w * 0.35, y + h * 0.6, line)
        c.drawLine(x + w * 0.35, y + h * 0.16, x + w * 0.35, y + h * 0.6, line)
        c.drawLine(x - w * 0.5, y + h * 0.6, x + w * 0.5, y + h * 0.6, line)
        # the baby: a small swaddle and head, breathing
        br = 1 + 0.025 * math.sin(t * 2.4)
        c.save(); c.translate(x + w * 0.05, y - h * 0.12); c.scale(br, br)
        c.drawOval(skia.Rect.MakeXYWH(-w * 0.17, -h * 0.07, w * 0.30, h * 0.14), paint((236, 222, 214), 0.9 * a))
        c.drawCircle(-w * 0.20, -h * 0.01, h * 0.07, paint((222, 190, 170), 0.95 * a))
        c.drawLine(w * 0.02, -h * 0.09, w * 0.10, -h * 0.25, paint((250, 250, 250), 0.6 * a, stroke=8))  # a line to her arm
        c.restore()


class Monitor(Box):
    """Patient monitor: an ECG trace that sweeps and a heart rate that climbs (sepsis)."""

    def __init__(self, x, y, w, h, t_in, hr_from=150, hr_to=182, t_rise=None, **kw):
        super().__init__(x, y, w, h, t_in, **kw)
        self.hr_from, self.hr_to, self.t_rise = hr_from, hr_to, t_rise

    def draw(self, c, res, t):
        a = self.alpha(t)
        if a <= 0:
            return
        x, y, w, h = self.x, self.y, self.w, self.h
        r = skia.Rect.MakeXYWH(x - w / 2, y - h / 2, w, h)
        c.drawRoundRect(r, 40, 40, paint((10, 14, 20), 0.95 * a))
        c.drawRoundRect(r, 40, 40, paint((90, 100, 120), a, stroke=14))
        # trace
        tx0, tx1, ty = x - w * 0.45, x + w * 0.2, y + h * 0.05
        period = 60 / self.hr_now(t)
        p = skia.Path(); first = True
        n = 240
        sweep = (t * 0.6) % 1.0
        for i in range(n + 1):
            u = i / n
            if abs(u - sweep) < 0.03:
                first = True; continue
            ph = ((u * 2.4) / period * 0.42) % 1.0
            v = 0.0
            if 0.18 < ph < 0.22: v = -0.12
            elif 0.30 < ph < 0.33: v = 0.9 * (1 - abs(ph - 0.315) / 0.015)
            elif 0.33 < ph < 0.36: v = -0.3
            elif 0.5 < ph < 0.62: v = -0.18 * math.sin((ph - 0.5) / 0.12 * math.pi)
            px, py = tx0 + (tx1 - tx0) * u, ty - v * h * 0.32
            if first: p.moveTo(px, py); first = False
            else: p.lineTo(px, py)
        c.drawPath(p, paint(TEAL, 0.35 * a, stroke=26, blur=14))
        c.drawPath(p, paint(TEAL, a, stroke=9))
        hr = int(self.hr_now(t))
        col = RED if hr > 170 else TEAL
        draw_text(c, res, "HR", x + w * 0.27, y - h * 0.22, h * 0.13, "cond", col, a, 0.05)
        draw_text(c, res, str(hr), x + w * 0.27, y + h * 0.18, h * 0.42, "cond", col, a, 0.02)
        draw_text(c, res, "SpO2 91", x + w * 0.27, y + h * 0.38, h * 0.11, "cond", SOFT, 0.8 * a, 0.05)

    def hr_now(self, t):
        if self.t_rise is None:
            return self.hr_from
        return self.hr_from + (self.hr_to - self.hr_from) * ease_in_out(ramp(t, self.t_rise, 6))


class LabReport(Box):
    """A culture and sensitivity sheet (illustrative): drug rows, results revealed one by one."""
    z = 14

    def __init__(self, x, y, w, h, t_in, rows, times, title="CULTURE & SENSITIVITY", sub="Blood · Klebsiella pneumoniae", **kw):
        super().__init__(x, y, w, h, t_in, **kw)
        self.rows, self.times, self.title, self.sub = rows, times, title, sub

    def draw(self, c, res, t):
        a = self.alpha(t, 0.4)
        if a <= 0:
            return
        x, y, w, h = self.x, self.y, self.w, self.h
        u = ease_out_cubic(ramp(t, self.t_in, 0.6))
        c.save(); c.translate(0, (1 - u) * 200); c.rotate(-1.2)
        r = skia.Rect.MakeXYWH(x - w / 2, y - h / 2, w, h)
        c.save(); c.translate(20, 40); c.drawRect(r, paint((0, 0, 0), 0.4 * a, blur=40)); c.restore()
        c.drawRect(r, paint(PAPER, a))
        pad = w * 0.08
        draw_text(c, res, self.title, x - w / 2 + pad, y - h / 2 + pad + 150, 150, "cond", INK, a, 0.04)
        draw_text(c, res, self.sub, x - w / 2 + pad, y - h / 2 + pad + 290, 92, "labelm", (90, 90, 96), a)
        c.drawLine(x - w / 2 + pad, y - h / 2 + pad + 360, x + w / 2 - pad, y - h / 2 + pad + 360, paint(INK, 0.5 * a, stroke=6))
        rh = (h - pad * 2 - 420) / max(1, len(self.rows))
        for i, (drug, verdict) in enumerate(self.rows):
            yy = y - h / 2 + pad + 420 + rh * (i + 0.7)
            draw_text(c, res, drug, x - w / 2 + pad, yy, rh * 0.26, "labelm", INK, a * 0.9)
        draw_text(c, res, "ILLUSTRATIVE", x + w / 2 - pad, y + h / 2 - pad * 0.5, 70, "cond", (140, 140, 146), a, 0.1, "right")
        c.restore()


class Glass(Box):
    """The NICU window: a pane of glass with two palm prints fogging onto it."""

    def draw(self, c, res, t):
        a = self.alpha(t, 1.0)
        if a <= 0:
            return
        x, y, w, h = self.x, self.y, self.w, self.h
        r = skia.Rect.MakeXYWH(x - w / 2, y - h / 2, w, h)
        c.drawRect(r, paint((150, 180, 220), 0.06 * a))
        c.drawRect(r, paint(SOFT, 0.7 * a, stroke=22))
        for k in range(3):  # reflections
            xx = x - w * 0.3 + k * w * 0.12
            c.drawLine(xx, y - h * 0.42, xx + w * 0.25, y - h * 0.1, paint((255, 255, 255), 0.08 * a, stroke=40 - k * 10))
        fog = ease_out_cubic(ramp(t, self.t_in + 0.8, 2.0))
        for side in (-1, 1):
            px, py = x + side * w * 0.14, y + h * 0.02
            pp = paint((230, 236, 246), 0.38 * a * fog, blur=8)
            c.drawOval(skia.Rect.MakeXYWH(px - 190, py - 120, 380, 430), pp)               # palm
            for i, (dx, ln) in enumerate([(-150, 300), (-55, 380), (45, 390), (140, 330)]):  # fingers
                fx = px + dx * (1 if side > 0 else -1)
                c.drawRoundRect(skia.Rect.MakeXYWH(fx - 42, py - 120 - ln, 84, ln + 40), 42, 42, pp)
            tx = px + (240 if side > 0 else -240)
            c.save(); c.translate(tx, py + 120); c.rotate(-35 * side)
            c.drawRoundRect(skia.Rect.MakeXYWH(-45, -200, 90, 230), 45, 45, pp)               # thumb
            c.restore()
        draw_text(c, res, "ILLUSTRATIVE STORY", x, y + h / 2 + 170, 90, "cond", SOFT, 0.55 * a, 0.18, "center")


class Rx(Box):
    """A handwritten OPD prescription slip (a recreation), written as the line is spoken."""
    z = 16

    def __init__(self, x, y, w, h, t_in, writes, sign_t, crumple_t=None, **kw):
        super().__init__(x, y, w, h, t_in, **kw)
        self.writes, self.sign_t, self.crumple_t = writes, sign_t, crumple_t

    def draw(self, c, res, t):
        a = self.alpha(t, 0.4)
        if a <= 0:
            return
        x, y, w, h = self.x, self.y, self.w, self.h
        cr = ease_out_cubic(ramp(t, self.crumple_t, 0.8)) if self.crumple_t else 0
        c.save(); c.translate(x, y); c.rotate(2 - 9 * cr); c.scale(1 - 0.12 * cr, 1 - 0.12 * cr)
        r = skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h)
        c.save(); c.translate(24, 44); c.drawRect(r, paint((0, 0, 0), 0.45 * a, blur=40)); c.restore()
        c.drawRect(r, paint(PAPER, a))
        if cr > 0:  # crease lines
            cp = paint((150, 140, 130), 0.5 * a * cr, stroke=8)
            c.drawLine(-w / 2, -h * 0.1, w / 2, h * 0.15, cp); c.drawLine(-w * 0.1, -h / 2, w * 0.2, h / 2, cp)
            c.drawLine(-w / 2, h * 0.3, w * 0.3, -h / 2, cp)
        pad = w * 0.09
        c.drawRect(skia.Rect.MakeXYWH(-w / 2, -h / 2, w, 150), paint((40, 80, 140), a))
        draw_text(c, res, "OPD  ·  GENERAL MEDICINE", -w / 2 + pad, -h / 2 + 108, 82, "cond", (240, 240, 245), a, 0.12)
        draw_text(c, res, "Rx", -w / 2 + pad, -h / 2 + 430, 220, "serif", INK, a)
        yy = -h / 2 + 720
        for txt, t0, size in self.writes:
            n = len(txt) * ramp(t, t0, 0.15 + 0.035 * len(txt))
            if n > 0:
                draw_text(c, res, txt, -w / 2 + pad + 60, yy, size, "hand", (24, 40, 110), a, 0, "left", reveal=n + 0.999)
            yy += size * 1.7
        # signature: a quick looping scrawl
        su = ease_in_out(ramp(t, self.sign_t, 0.55))
        if su > 0:
            p = skia.Path(); sx, sy = w * 0.05, h / 2 - pad - 120
            p.moveTo(sx, sy)
            for i in range(1, 40):
                q = i / 39
                p.lineTo(sx + q * w * 0.33, sy - 60 * math.sin(q * 17) * (1 - q * 0.5) - 30 * q)
            c.drawPath(partial_path(p, su), paint((24, 40, 110), a, stroke=11))
        draw_text(c, res, "RECREATION", w / 2 - pad * 0.6, h / 2 - 50, 64, "cond", (150, 140, 130), a, 0.1, "right")
        c.restore()


class Clock(Box):
    """A ten-second ring timer. Runs from t_in for `run` seconds, then holds; can be stopped."""
    z = 18

    def __init__(self, x, y, r, t_in, run=10.0, stop_t=None, **kw):
        super().__init__(x, y, r, r, t_in, **kw)
        self.r, self.run, self.stop_t = r, run, stop_t

    def draw(self, c, res, t):
        a = self.alpha(t, 0.4)
        if a <= 0:
            return
        x, y, r = self.x, self.y, self.r
        tt = min(t, self.stop_t) if self.stop_t and t >= self.stop_t else t
        el = clamp((tt - self.t_in) / self.run, 0, 1)
        if self.stop_t and t >= self.stop_t:
            el = 0.0  # the stopped clock: ten seconds, unspent
        c.drawCircle(x, y, r, paint((20, 24, 34), 0.9 * a))
        c.drawCircle(x, y, r, paint((80, 90, 110), a, stroke=24))
        oval = skia.Rect.MakeXYWH(x - r, y - r, 2 * r, 2 * r)
        arc = skia.Path(); arc.addArc(oval, -90, 360 * (1 - el))
        col = AMBER if (self.stop_t and t >= self.stop_t) else (RED if el > 0.7 else WHITE)
        c.drawPath(arc, paint(col, 0.3 * a, stroke=70, blur=20))
        c.drawPath(arc, paint(col, a, stroke=40))
        secs = int(math.ceil(10 * (1 - el)))
        draw_text(c, res, f"0:{secs:02d}", x, y + r * 0.2, r * 0.6, "cond", col, a, 0.02, "center")


class Beds(Box):
    """Ten hospital beds; `n_red` of them turn red one after another from t_red."""
    z = 14

    def __init__(self, x, y, w, t_in, t_red, n_red=7, **kw):
        super().__init__(x, y, w, w * 0.45, t_in, **kw)
        self.t_red, self.n_red = t_red, n_red

    def draw(self, c, res, t):
        a = self.alpha(t, 0.5)
        if a <= 0:
            return
        cols, bw = 5, self.w / 5
        for i in range(10):
            cx = self.x - self.w / 2 + bw * (i % cols + 0.5)
            cy = self.y + (i // cols - 0.5) * bw * 0.95
            ia = a * ramp(t, self.t_in + i * 0.05, 0.3)
            red = i < self.n_red and t >= self.t_red + i * 0.12
            col = RED if red else SOFT
            s = bw * 0.36
            c.drawRoundRect(skia.Rect.MakeXYWH(cx - s, cy - s * 0.1, s * 2, s * 0.42), 20, 20, paint(col, ia))   # mattress
            c.drawRoundRect(skia.Rect.MakeXYWH(cx - s, cy - s * 0.55, s * 0.2, s * 1.2), 14, 14, paint(col, ia))  # headboard
            c.drawLine(cx + s * 0.92, cy + s * 0.3, cx + s * 0.92, cy + s * 0.62, paint(col, ia, stroke=24))
            c.drawLine(cx - s * 0.9, cy + s * 0.3, cx - s * 0.9, cy + s * 0.62, paint(col, ia, stroke=24))
            c.drawCircle(cx - s * 0.52, cy - s * 0.3, s * 0.2, paint(col, ia))                                    # patient's head
            if red:
                c.drawCircle(cx, cy, s * 1.1, paint(RED, 0.12 * ia, blur=60))


class Bar(Box):
    """A single susceptibility bar: fills to v1 at t1, falls to v2 at t2, with a 50% guide."""
    z = 14

    def __init__(self, x, y, w, h, t_in, v1, t1, v2, t2, label, **kw):
        super().__init__(x, y, w, h, t_in, **kw)
        self.v1, self.t1, self.v2, self.t2, self.label = v1, t1, v2, t2, label

    def draw(self, c, res, t):
        a = self.alpha(t, 0.5)
        if a <= 0:
            return
        x, y, w, h = self.x, self.y, self.w, self.h
        bot = y + h / 2
        c.drawRect(skia.Rect.MakeXYWH(x - w / 2, y - h / 2, w, h), paint((255, 255, 255), 0.06 * a))
        c.drawRect(skia.Rect.MakeXYWH(x - w / 2, y - h / 2, w, h), paint(SOFT, 0.5 * a, stroke=10))
        v = self.v1 * ease_out_cubic(ramp(t, self.t1, 1.2))
        if t >= self.t2:
            v = self.v1 + (self.v2 - self.v1) * ease_in_out(ramp(t, self.t2, 0.9))
        col = TEAL if v > 50 else (AMBER if v > 40 else RED)
        c.drawRect(skia.Rect.MakeXYWH(x - w / 2 + 30, bot - h * v / 100, w - 60, h * v / 100), paint(col, 0.92 * a))
        if t >= self.t2:  # ghost of where it was
            c.drawLine(x - w / 2 - 60, bot - h * self.v1 / 100, x + w / 2 + 60, bot - h * self.v1 / 100,
                       paint(SOFT, 0.6 * a * ramp(t, self.t2, 0.4), stroke=10))
        draw_text(c, res, self.label, x, bot + 200, 130, "cond", SOFT, a, 0.08, "center")


class Strip(Box):
    """A blister strip of tablets with the red vertical line drawing on."""
    z = 16

    def __init__(self, x, y, w, h, t_in, line_t, **kw):
        super().__init__(x, y, w, h, t_in, **kw)
        self.line_t = line_t

    def draw(self, c, res, t):
        a = self.alpha(t, 0.5)
        if a <= 0:
            return
        x, y, w, h = self.x, self.y, self.w, self.h
        r = skia.Rect.MakeXYWH(x - w / 2, y - h / 2, w, h)
        c.save(); c.translate(20, 40); c.drawRoundRect(r, 40, 40, paint((0, 0, 0), 0.45 * a, blur=40)); c.restore()
        c.drawRoundRect(r, 40, 40, paint((206, 210, 218), a))
        for i in range(5):
            for j in range(2):
                cx = x - w * 0.3 + i * w * 0.15; cy = y + (j - 0.5) * h * 0.42
                c.drawOval(skia.Rect.MakeXYWH(cx - w * 0.055, cy - h * 0.14, w * 0.11, h * 0.28), paint((236, 238, 242), a))
                c.drawOval(skia.Rect.MakeXYWH(cx - w * 0.055, cy - h * 0.14, w * 0.11, h * 0.28), paint((150, 154, 164), a, stroke=6))
        u = ease_out_cubic(ramp(t, self.line_t, 0.7))
        lx = x - w * 0.42
        c.drawRect(skia.Rect.MakeXYWH(lx - 34, y - h / 2 + 30, 68, (h - 60) * u), paint((206, 30, 30), a))
        if u > 0:
            c.drawRect(skia.Rect.MakeXYWH(lx - 34, y - h / 2 + 30, 68, (h - 60) * u), paint((255, 40, 40), 0.35 * a, blur=40))


class Glow(Box):
    """The last card: one antibiotic, face up, glowing amber -- the drug that still works."""
    z = 30

    def draw(self, c, res, t):
        a = self.alpha(t, 1.6)
        if a <= 0:
            return
        x, y, w, h = self.x, self.y, self.w, self.h
        pulse = 0.85 + 0.15 * math.sin(t * 2.0)
        c.drawCircle(x, y, w * 1.4, paint(AMBER, 0.22 * a * pulse, blur=w * 0.5))
        r = skia.Rect.MakeXYWH(x - w / 2, y - h / 2, w, h)
        c.drawRoundRect(r, 50, 50, paint((255, 248, 232), a))
        c.drawRoundRect(r, 50, 50, paint(AMBER, a, stroke=24))
        cap = skia.Rect.MakeXYWH(x - w * 0.3, y - h * 0.16, w * 0.6, h * 0.32)
        c.drawRoundRect(cap, h * 0.16, h * 0.16, paint(AMBER, a))
        c.drawRect(skia.Rect.MakeXYWH(x, y - h * 0.16, w * 0.3 - h * 0.08, h * 0.32), paint((255, 255, 255), a))
        c.drawRoundRect(cap, h * 0.16, h * 0.16, paint((120, 80, 20), a, stroke=12))


# ---------------------------------------------------------------- the film
def build_film(doc):
    L, E, W = doc.L, doc.E, doc.W
    film = Film(doc.duration, fps=30, look="night")
    film.look["grain"] = 0.03

    def hold(t0, t1, x, y, z, rot=0.0, **kw):
        """Land on a hero at t0 and drift a touch until t1 (a hold is two keys close together)."""
        film.shot(t0, x, y, z, rot, **kw)
        film.shot(t1, x + 120, y + 60, z * 1.04, rot * 0.5, **kw)

    # ============ 1-6  NICU cold open
    film.add(BigText("2:00 AM", NICU_X, -3300, 520, W(1, "Two") - 0.1, rgb=WHITE, grunge=False, type_on=0.4, hit=0.4))
    film.add(BigText("NICU", NICU_X, -2750, 280, W(1, "N") - 0.05, rgb=SOFT, grunge=False, track=0.3))
    film.add(Incubator(NICU_X, 0, 3400, 2100, L(1) + 0.4))
    film.add(Monitor(NICU_X + 3700, -1200, 1900, 1050, L(2) - 0.2, t_rise=L(2) + 1))
    film.add(BigText("DAY 9", NICU_X, 2000, 300, W(2, "nine") - 0.05, rgb=AMBER, grunge=False))
    rep_x = NICU_X + 8200
    rtimes = [W(3, "Resistant"), W(3, "Resistant", 1), W(3, "Resistant", 2)]
    film.add(LabReport(rep_x, 0, 2700, 3500, L(3) - 0.1,
                       rows=[("Meropenem", "R"), ("Piperacillin-tazo", "R"), ("Amikacin", "R")], times=rtimes))
    for i, (tt, yy) in enumerate(zip(rtimes, (-590, 290, 1170))):
        film.add(Stamp("RESISTANT", rep_x + 620, yy, size=150, rot=-8 + i * 4, t_in=tt + 0.02, rgb=RED))
    glass_x = NICU_X - 6600
    film.add(Glass(glass_x, -200, 3200, 3400, L(4) - 0.2))
    film.add(StringLine((glass_x + 1650, -200), (NICU_X - 1800, -200), W(4, "glass"), dur=0.9, persist=True, sfx=False))
    title_y = 5400
    film.add(BigText("KOI AUR DAWAI?", NICU_X, title_y, 900, E(6) + 0.6, rgb=WHITE, hit=1.0, t_out=W(37, "Haan") - 0.5))

    film.shot(0.0, NICU_X, -2200, 0.4)
    hold(L(1) + 1.6, E(1), NICU_X, -1500, 0.46, -0.4)
    hold(L(2) + 0.5, W(2, "Fighting"), NICU_X + 1800, -800, 0.5, 0.4)
    film.shot(E(2) - 0.1, NICU_X + 3500, -1100, 0.75)
    hold(L(3) + 0.5, E(3), rep_x, 0, 0.56, -0.5)
    hold(L(4) + 0.9, E(4), glass_x, -100, 0.56, 0.5)
    hold(L(5) + 0.3, E(5) - 0.2, glass_x + 150, -100, 0.66, strength=0.7)
    film.shot(L(6) + 0.4, NICU_X - 2600, 300, 0.3, strength=0.7)           # wide and dark: no answer
    film.shot(E(6) + 0.3, NICU_X - 2200, 1500, 0.3, strength=0.75)
    hold(E(6) + 1.1, L(8) + 0.4, NICU_X, title_y - 300, 0.5, strength=0.85)

    # ============ 8-13  the OPD
    film.add(StringLine((NICU_X + 4300, title_y - 400), (OPD_X - 1500, 0), W(8, "begin", 1) - 0.4, dur=1.3, sfx=False))
    film.add(Card(OPD_X, 0, 2300, 2700, L(9) + 0.2, title="TOKEN 47",
                  lines=["Fever × 3 days", "Body ache", "Runny nose", "", "Waiting: 40"],
                  accent=(40, 80, 140), title_size=300, body_size=170))
    film.add(BigText("“", OPD_X + 2700, -300, 1600, L(10) - 0.1, rgb=AMBER, grunge=False, shadow=False))
    film.add(Clock(OPD_X + 3300, 1000, 850, L(11) + 0.2, run=10.0))
    rx_x = OPD_X + 7400
    film.add(Rx(rx_x, 0, 2600, 3600, L(12) - 0.2,
                writes=[("Tab. Azithro 500", W(12, "Azithromycin"), 230), ("OD  x  3 days", W(12, "Three"), 230)],
                sign_t=W(12, "Next") - 0.1))
    film.shot(W(8, "begin", 1) + 0.6, OPD_X - 6000, 500, 0.3, strength=0.2)
    hold(L(9) + 0.3, E(9), OPD_X, 0, 0.6, -0.4)
    hold(L(10) + 0.3, E(10), OPD_X + 1400, 0, 0.52, 0.3)
    hold(L(11) + 0.4, E(11), OPD_X + 2600, 600, 0.55)
    hold(L(12) + 0.3, E(12), rx_x, 0, 0.52, -0.5)
    hold(L(13) + 0.3, E(13), rx_x + 150, 100, 0.55)

    # ============ 14-19  the count
    film.add(StringLine((rx_x + 1400, 0), (COUNT_X - 2900, -1600), L(14) - 0.2, dur=1.2, sfx=False))
    film.add(BigText("ACROSS INDIA", COUNT_X, -2800, 380, L(14) + 0.3, rgb=SOFT, grunge=False, track=0.2))
    film.add(Beds(COUNT_X, -1100, 5000, L(15), W(15, "seven"), n_red=7))
    film.add(Counter(COUNT_X, 1500, 900, 72, W(15, "seven") + 0.2, suffix="%", caption="OF ADMITTED PATIENTS ON ANTIBIOTICS", rgb=RED))
    film.add(BigText("NCDC POINT PREVALENCE SURVEY · 20 HOSPITALS", COUNT_X, 2450, 130, W(15, "survey"), rgb=SOFT, grunge=False, shadow=False))
    c55 = (COUNT_X + 6000, 0)
    film.add(Counter(c55[0], c55[1], 1000, 55, W(16, "half") - 0.2, suffix="%", caption="OF THEM “JUST IN CASE”", rgb=AMBER))
    bar_x = COUNT_X + 11500
    film.add(Bar(bar_x, -300, 1300, 3600, L(18) - 0.3, 58.5, W(18, "six") - 0.3, 35.6, W(19, "three") - 0.25,
                 label="IMIPENEM vs KLEBSIELLA"))
    film.add(Counter(bar_x + 2100, -900, 700, 58, W(18, "six") - 0.1, suffix="%", caption="WORKED · 2017", rgb=TEAL))
    film.add(Counter(bar_x + 2100, 900, 800, 36, W(19, "three") - 0.1, suffix="%", caption="WORKED · 2023", rgb=RED, start=58))
    film.add(BigText("ICMR AMRSN · TERTIARY-CARE ISOLATES", bar_x + 900, 2350, 120, L(18), rgb=SOFT, grunge=False, shadow=False))
    film.add(StringLine((COUNT_X + 1800, 1300), (bar_x - 900, -1500), W(17, "lesson") - 0.1, dur=1.2, sfx=False))
    film.add(StringLine((c55[0] + 600, 300), (bar_x - 900, -1500), W(17, "never") - 0.1, dur=1.0, sfx=False))
    film.shot(L(14) + 0.4, COUNT_X - 800, -1800, 0.48, 0.4)
    film.shot(E(14), COUNT_X, -1300, 0.46)
    hold(L(15) + 0.4, E(15), COUNT_X, 300, 0.44)
    hold(L(16) + 0.3, E(16), c55[0], -150, 0.6, -0.4)
    hold(L(17) + 0.4, E(17), (COUNT_X + bar_x) / 2, 0, 0.25, strength=0.25)
    hold(L(18) + 0.4, E(18), bar_x + 1000, 0, 0.5)
    hold(L(19) + 0.2, E(19) + 0.6, bar_x + 1100, 200, 0.55, 0.5)

    # ============ 20-24  who pays
    slip = (PAY_X - 4500, 0)
    film.add(Rx(slip[0], slip[1], 2200, 3000, L(20) - 0.3, writes=[("Tab. Azithro 500", L(20) - 0.4, 200), ("OD  x  3 days", L(20) - 0.4, 200)],
                sign_t=L(20) - 0.4, crumple_t=W(20, "better") - 0.1, sfx=False))
    for i, (word, txt) in enumerate([("families", "HOME"), ("wards", "WARD"), ("water", "WATER")]):
        film.add(Card(PAY_X + i * 2700, -1900, 2300, 1200, W(21, word) - 0.1, title=txt, lines=[], rgb=(34, 40, 58),
                      text_rgb=WHITE, accent=RED, title_size=380, t_out=E(22)))
    people = [("newborn", "NEWBORN", "NICU"), ("mother", "MOTHER", "POST-OP"), ("grandfather", "GRANDFATHER", "ICU")]
    for i, (word, title, sub) in enumerate(people):
        cx = PAY_X + i * 3000
        film.add(Card(cx, 1300, 2700, 1700, W(23, word) - 0.1, title=title, lines=[sub, "illustration"], rgb=PAPER,
                      text_rgb=INK, accent=AMBER, title_size=300, body_size=170))
        film.add(StringLine((slip[0] + 900, 300), (cx - 1100, 900), W(24, "inherited") - 0.3 + i * 0.25, dur=0.9, persist=True, sfx=(i == 0)))
    hold(L(20) + 0.4, E(20), slip[0], 0, 0.62, -0.5)
    hold(L(21) + 0.4, E(21), PAY_X + 2700, -1500, 0.45)
    hold(L(22) + 0.3, E(22), PAY_X + 2700, -300, 0.36, strength=0.7)
    hold(L(23) + 0.3, E(23), PAY_X + 3000, 1300, 0.4)
    hold(L(24) + 0.4, E(24) + 0.5, PAY_X + 1200, 700, 0.3)

    # ============ 25-26  back to her
    pad_y = 4000
    film.add(Card(glass_x, pad_y, 2400, 3000, L(26) - 0.1, title="Rx", lines=[], rgb=PAPER, text_rgb=INK, title_size=380))
    film.shot(L(25) + 0.4, (PAY_X + glass_x) / 2, 0, 0.06, strength=0.1)   # the long road back
    hold(L(25) + 1.8, E(25), glass_x, -150, 0.6, strength=0.75)
    hold(L(26) + 0.4, E(26) + 0.4, glass_x, pad_y, 0.55, strength=0.8)

    # ============ 27-32  stewardship
    film.add(BigText("STEWARDSHIP", STEW_X, -2600, 900, W(27, "stewardship") - 0.1, rgb=AMBER, hit=0.7))
    film.add(BigText("A DAILY HABIT", STEW_X, -1800, 300, W(27, "answer") - 0.1, rgb=SOFT, grunge=False, track=0.25))
    habits = [(28, "Pause", "1 · PAUSE", ["Is it really bacterial?"]),
              (29, "culture", "2 · CULTURE FIRST", ["Before the first dose"]),
              (30, "narrow", "3 · NARROW & STOP", ["De-escalate on the report", "Stop on time"]),
              (31, "one", "4 · ONE DOSE", ["Surgical prophylaxis", "Not five days"])]
    hx = [STEW_X - 7200, STEW_X - 2400, STEW_X + 2400, STEW_X + 7200]
    for (line, word, title, lines), x in zip(habits, hx):
        film.add(Card(x, 900, 4300, 2200, W(line, word) - 0.15, title=title, lines=lines, rgb=PAPER, text_rgb=INK,
                      accent=AMBER, title_size=330, body_size=220))
    strip_x = STEW_X + 12600
    film.add(Strip(strip_x, 500, 3600, 2000, L(32) - 0.1, W(32, "red") - 0.05))
    film.add(BigText("5 · RED LINE = Rx ONLY", strip_x, 2200, 300, W(32, "prescription") - 0.4, rgb=WHITE, grunge=False))
    hold(L(27) + 0.3, E(27), STEW_X, -1500, 0.45)
    for (line, *_), x in zip(habits, hx):
        hold(L(line) + 0.3, E(line), x, 800, 0.62, 0.4 if line % 2 else -0.4)
    hold(L(32) + 0.4, E(32) + 0.5, strip_x, 900, 0.55)

    # ============ 33-37  close
    week_y = 5800
    film.add(Card(STEW_X, week_y, 6000, 2000, L(33) - 0.1, title="WORLD AMR AWARENESS WEEK", lines=["18–24 November · One Health, one action"],
                  rgb=(34, 40, 58), text_rgb=WHITE, accent=AMBER, title_size=330, body_size=200, t_out=E(33)))
    film.add(Stamp("ENDED", STEW_X + 2200, week_y + 500, size=260, rot=-8, t_in=W(33, "ended") - 0.05, rgb=RED, t_out=E(33)))
    wa_x = STEW_X + 7600
    film.add(Card(wa_x, week_y, 4200, 1800, L(34) - 0.1, title="Forwarded", lines=["AMR guidelines.pdf", "Seen ✓✓"],
                  rgb=(30, 46, 40), text_rgb=(220, 240, 226), accent=(37, 211, 102), title_size=260, body_size=200, t_out=W(34, "forget") - 0.2))
    clk_x = STEW_X + 14000
    film.add(Clock(clk_x, week_y, 1100, L(35) - 0.2, run=99, stop_t=L(35) - 0.2))
    film.add(BigText("TEN SECONDS OF COURAGE", clk_x, week_y + 1700, 240, W(35, "courage") - 0.1, rgb=AMBER, grunge=False, track=0.12))
    film.add(Glow(NICU_X, 3300, 900, 1200, W(37, "Haan") - 0.1))
    film.add(BigText("HAAN. HAI.", NICU_X, title_y, 900, W(37, "Hai") + 0.05, rgb=AMBER, grunge=False))
    hold(L(33) + 0.4, E(33), STEW_X, week_y, 0.5)
    hold(L(34) + 0.3, E(34) - 0.2, wa_x, week_y, 0.58, 0.5)
    hold(L(35) + 0.4, E(35), clk_x, week_y + 400, 0.55, strength=0.7)
    film.shot(L(36) + 0.9, (clk_x + NICU_X) / 2, 2000, 0.07, strength=0.1)
    film.shot(E(36), NICU_X - 1500, 1200, 0.3, strength=0.5)
    film.shot(L(37) + 0.5, NICU_X, 3900, 0.42, strength=0.4)
    film.shot(E(37) + 1.0, NICU_X, 3700, 0.4, strength=0.4)
    film.shot(E(37) + 3.0, NICU_X + 500, 1400, 0.19, radius=16000, strength=0.12)
    film.shot(film.duration, NICU_X + 500, 1400, 0.18, radius=16000, strength=0.1)
    return film

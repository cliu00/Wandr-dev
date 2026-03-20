import pptxgen from "pptxgenjs";

const prs = new pptxgen();

// ─── Design tokens ────────────────────────────────────────────────────────────
const GREEN       = "1E4D3A";  // deep forest green (primary)
const GOLD        = "B8965A";  // warm gold (accent)
const OFF_WHITE   = "F7F4EF";  // warm off-white (background)
const DARK        = "1A1A1A";  // near-black for body text
const LIGHT_GREEN = "D6E8DF";  // soft green for accents

prs.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in

// ─── Slide 1: Cover / Team ────────────────────────────────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: GREEN };

  // Gold top bar
  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.08, fill: { color: GOLD } });

  // App name
  s.addText("Wandr", {
    x: 0.6, y: 1.4, w: 12, h: 1.4,
    fontSize: 80, fontFace: "Georgia", bold: true,
    color: OFF_WHITE, align: "center",
    charSpacing: 8,
  });

  // Tagline
  s.addText("AI-Powered Travel Planning for Short Escapes", {
    x: 0.6, y: 2.9, w: 12, h: 0.6,
    fontSize: 20, fontFace: "Calibri",
    color: GOLD, align: "center", italic: true,
  });

  // Divider
  s.addShape(prs.ShapeType.rect, { x: 4.5, y: 3.7, w: 4.3, h: 0.03, fill: { color: GOLD } });

  // Team section
  s.addText("TEAM", {
    x: 0.6, y: 4.0, w: 12, h: 0.4,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: GOLD, align: "center", charSpacing: 4,
  });

  s.addText("Shruti Suresh", {
    x: 0.6, y: 4.5, w: 12, h: 0.5,
    fontSize: 22, fontFace: "Calibri",
    color: OFF_WHITE, align: "center",
  });

  // Event label
  s.addText("Product BC Build-A-Thon  ·  2026", {
    x: 0.6, y: 6.7, w: 12, h: 0.4,
    fontSize: 12, fontFace: "Calibri",
    color: LIGHT_GREEN, align: "center",
  });

  // Gold bottom bar
  s.addShape(prs.ShapeType.rect, { x: 0, y: 7.42, w: "100%", h: 0.08, fill: { color: GOLD } });
}

// ─── Slide 2: Problem Statement ───────────────────────────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: OFF_WHITE };

  // Left green panel
  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: 3.8, h: "100%", fill: { color: GREEN } });
  s.addShape(prs.ShapeType.rect, { x: 3.8, y: 0, w: 0.06, h: "100%", fill: { color: GOLD } });

  // Left label
  s.addText("THE\nPROBLEM", {
    x: 0.2, y: 2.8, w: 3.4, h: 2,
    fontSize: 36, fontFace: "Georgia", bold: true,
    color: OFF_WHITE, align: "center", valign: "middle",
  });

  // Slide number
  s.addText("02", {
    x: 0.2, y: 6.8, w: 3.4, h: 0.5,
    fontSize: 13, fontFace: "Calibri",
    color: GOLD, align: "center",
  });

  // Headline
  s.addText("Planning a short escape shouldn't take longer than the trip itself.", {
    x: 4.2, y: 0.7, w: 8.8, h: 1.3,
    fontSize: 26, fontFace: "Georgia", bold: true,
    color: DARK,
  });

  // Pain points
  const pains = [
    { icon: "⏱", text: "Hours lost across tabs — TripAdvisor, Reddit, Google Maps, travel blogs — with no clear answer." },
    { icon: "🗺", text: "Generic results. Every planning tool surfaces the same tourist traps for everyone, regardless of travel style." },
    { icon: "👥", text: "Group coordination is broken. Getting 4 friends to agree on a 2-day itinerary means endless group chats and compromise." },
    { icon: "📅", text: "Short trips punish indecision. A wasted 2-day weekend is hard to recover — there's no room for bad planning." },
  ];

  pains.forEach((p, i) => {
    const y = 2.2 + i * 1.1;
    s.addShape(prs.ShapeType.rect, { x: 4.2, y: y - 0.05, w: 8.8, h: 0.95, fill: { color: "EEE8DF" }, line: { color: "EEE8DF" } });
    s.addText(`${p.icon}  ${p.text}`, {
      x: 4.4, y: y + 0.05, w: 8.5, h: 0.8,
      fontSize: 13.5, fontFace: "Calibri",
      color: DARK, valign: "middle",
    });
  });
}

// ─── Slide 3: Solution / Product Vision ───────────────────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: GREEN };

  // Top bar
  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.08, fill: { color: GOLD } });

  // Headline
  s.addText("Wandr turns your travel style into a curated itinerary — in under a minute.", {
    x: 0.6, y: 0.3, w: 12.1, h: 1.3,
    fontSize: 26, fontFace: "Georgia", bold: true,
    color: OFF_WHITE, align: "center",
  });

  // Three feature columns
  const cols = [
    {
      icon: "✦",
      title: "Personalised by AI",
      body: "Answer 6 questions about your energy level, budget, food preferences, and travel style. Claude generates an itinerary shaped entirely around your answers — not a template.",
    },
    {
      icon: "⬡",
      title: "Built for Groups",
      body: "Share a link. Friends add their own preferences. The itinerary regenerates, merging everyone's tastes. Each activity is tagged with whose preferences it matched.",
    },
    {
      icon: "◈",
      title: "Locally Curated",
      body: "Activities are geo-clustered by neighbourhood, seasonally aware (festivals, foliage, local events), and weighted toward hidden gems over tourist traps.",
    },
  ];

  cols.forEach((c, i) => {
    const x = 0.4 + i * 4.3;
    s.addShape(prs.ShapeType.rect, { x, y: 1.9, w: 4.0, h: 5.2, fill: { color: "15382A" }, line: { color: GOLD, pt: 1 } });
    s.addText(c.icon, { x, y: 2.1, w: 4.0, h: 0.6, fontSize: 28, color: GOLD, align: "center" });
    s.addText(c.title, {
      x, y: 2.85, w: 4.0, h: 0.6,
      fontSize: 16, fontFace: "Georgia", bold: true,
      color: OFF_WHITE, align: "center",
    });
    s.addShape(prs.ShapeType.rect, { x: x + 1.4, y: 3.55, w: 1.2, h: 0.04, fill: { color: GOLD } });
    s.addText(c.body, {
      x: x + 0.2, y: 3.75, w: 3.6, h: 2.9,
      fontSize: 12.5, fontFace: "Calibri",
      color: LIGHT_GREEN, align: "left", valign: "top",
    });
  });

  // Bottom bar
  s.addShape(prs.ShapeType.rect, { x: 0, y: 7.42, w: "100%", h: 0.08, fill: { color: GOLD } });
}

// ─── Slide 4: Ask from Audience ───────────────────────────────────────────────
{
  const s = prs.addSlide();
  s.background = { color: OFF_WHITE };

  // Right green panel
  s.addShape(prs.ShapeType.rect, { x: 9.53, y: 0, w: 3.8, h: "100%", fill: { color: GREEN } });
  s.addShape(prs.ShapeType.rect, { x: 9.47, y: 0, w: 0.06, h: "100%", fill: { color: GOLD } });

  // Right label
  s.addText("WE'RE\nLOOKING\nFOR", {
    x: 9.6, y: 2.6, w: 3.6, h: 2.2,
    fontSize: 28, fontFace: "Georgia", bold: true,
    color: OFF_WHITE, align: "center", valign: "middle",
  });

  s.addText("04", {
    x: 9.6, y: 6.8, w: 3.6, h: 0.5,
    fontSize: 13, fontFace: "Calibri",
    color: GOLD, align: "center",
  });

  // Headline
  s.addText("We'd love your perspective.", {
    x: 0.5, y: 0.6, w: 8.7, h: 0.8,
    fontSize: 30, fontFace: "Georgia", bold: true,
    color: DARK,
  });

  s.addText("Here's what would help us most:", {
    x: 0.5, y: 1.5, w: 8.7, h: 0.5,
    fontSize: 15, fontFace: "Calibri", italic: true,
    color: "666666",
  });

  const asks = [
    { num: "01", title: "Monetisation models", body: "What are realistic revenue paths in travel? Subscription, B2B partnerships with hotels/tourism boards, or commission?" },
    { num: "02", title: "Distribution & acquisition", body: "Where do travel planners discover new tools? What channels worked for products you've seen succeed in this space?" },
    { num: "03", title: "Group trip dynamics", body: "We're seeing strong signal in the group feature. Is this a real wedge or a nice-to-have?" },
    { num: "04", title: "Industry connections", body: "Do you know anyone in travel tech, tourism boards, or hospitality who might be interested in a pilot?" },
  ];

  asks.forEach((a, i) => {
    const y = 2.2 + i * 1.18;
    s.addText(a.num, {
      x: 0.5, y: y, w: 0.6, h: 1.0,
      fontSize: 22, fontFace: "Georgia", bold: true,
      color: GOLD, valign: "middle",
    });
    s.addText(a.title, {
      x: 1.2, y: y + 0.05, w: 7.8, h: 0.38,
      fontSize: 14, fontFace: "Calibri", bold: true,
      color: DARK,
    });
    s.addText(a.body, {
      x: 1.2, y: y + 0.44, w: 7.8, h: 0.55,
      fontSize: 12, fontFace: "Calibri",
      color: "555555",
    });
    if (i < asks.length - 1) {
      s.addShape(prs.ShapeType.line, { x: 0.5, y: y + 1.08, w: 8.7, h: 0, line: { color: "DDDDDD", pt: 0.5 } });
    }
  });
}

// ─── Export ────────────────────────────────────────────────────────────────────
await prs.writeFile({ fileName: "docs/Wandr_BuildAThon_Deck.pptx" });
console.log("✓ Deck saved to docs/Wandr_BuildAThon_Deck.pptx");

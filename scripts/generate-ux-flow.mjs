import PptxGenJS from "pptxgenjs";
import { writeFileSync } from "fs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.title = "Wandr — User Journey Map";
pptx.subject = "UX Flow";
pptx.author = "Wandr";

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  bg:         "F8F7F4",
  navy:       "1A2332",
  blue:       "3B6DC1",
  blueLight:  "D6E4F7",
  green:      "2E7D5E",
  greenLight: "D0EDE3",
  violet:     "6B46C1",
  violetLight:"EDE9FF",
  orange:     "C25E1A",
  orangeLight:"FDECD7",
  grey:       "6B7280",
  greyLight:  "F3F4F6",
  accent:     "E8825A",
  white:      "FFFFFF",
};

// ── Shared helpers ──────────────────────────────────────────────────────────
function titleSlide(slide) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: C.navy } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 5.4, w: "100%", h: 0.08, fill: { color: C.accent } });
}

function pageHeader(slide, label, color = C.blue) {
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.78, fill: { color: C.navy } });
  slide.addText(label, {
    x: 0.36, y: 0.12, w: 11, h: 0.54,
    fontSize: 18, bold: true, color: C.white, fontFace: "Georgia",
  });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0.78, w: "100%", h: 0.06, fill: { color: color } });
}

function node(slide, label, x, y, w, h, fillColor, textColor = C.white) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: fillColor, width: 0 },
    rectRadius: 0.08,
  });
  slide.addText(label, {
    x, y, w, h,
    fontSize: 10, bold: true, color: textColor,
    align: "center", valign: "middle", fontFace: "Calibri",
  });
}

function arrow(slide, x, y, label = "→") {
  slide.addText(label, {
    x, y, w: 0.4, h: 0.28,
    fontSize: 14, color: C.grey, align: "center", valign: "middle",
  });
}

function arrowV(slide, x, y, label = "↓") {
  slide.addText(label, {
    x, y, w: 0.3, h: 0.28,
    fontSize: 14, color: C.grey, align: "center", valign: "middle",
  });
}

function noteBox(slide, text, x, y, w, h, fillColor, textColor = C.navy, fontSize = 9.5) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: fillColor },
    line: { color: fillColor, width: 0 },
    rectRadius: 0.08,
  });
  slide.addText(text, {
    x: x + 0.12, y: y + 0.08, w: w - 0.24, h: h - 0.16,
    fontSize, color: textColor, fontFace: "Calibri",
    align: "left", valign: "top",
  });
}

function laneLabel(slide, num, text, x, y, color) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 1.1, h: 0.34,
    fill: { color: color },
    line: { color: color, width: 0 },
    rectRadius: 0.06,
  });
  slide.addText(`${num}  ${text}`, {
    x, y, w: 1.1, h: 0.34,
    fontSize: 9, bold: true, color: C.white,
    align: "center", valign: "middle",
  });
}

// ── Slide 1: Cover ──────────────────────────────────────────────────────────
{
  const s = pptx.addSlide();
  titleSlide(s);

  s.addText("Wandr", {
    x: 0.6, y: 1.1, w: 11.5, h: 0.9,
    fontSize: 52, bold: true, color: C.white, fontFace: "Georgia",
  });
  s.addText("User Journey Map", {
    x: 0.6, y: 1.95, w: 11.5, h: 0.64,
    fontSize: 28, color: C.accent, fontFace: "Georgia",
  });
  s.addShape(pptx.ShapeType.line, {
    x: 0.6, y: 2.7, w: 4, h: 0,
    line: { color: C.accent, width: 2 },
  });
  s.addText(
    "All routes, entry points, and key decision flows\nacross the Wandr travel planning prototype.",
    {
      x: 0.6, y: 2.9, w: 10, h: 0.7,
      fontSize: 14, color: "A0AEC0", fontFace: "Calibri",
    }
  );

  const journeys = [
    { num: "①", label: "Primary Flow", color: C.blue },
    { num: "②", label: "Escape Entry", color: C.violet },
    { num: "③", label: "Group Survey", color: C.green },
    { num: "④", label: "Member Join", color: C.orange },
    { num: "⑤", label: "Auth Flow", color: "7C6F9F" },
  ];
  journeys.forEach((j, i) => {
    const col = i < 3 ? 0 : 3;
    const row = i < 3 ? i : i - 3;
    const x = 0.6 + col * 4.5;
    const y = 3.9 + row * 0.54;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 3.9, h: 0.4,
      fill: { color: "1E2D42" },
      line: { color: "2A3F5E", width: 1 },
      rectRadius: 0.06,
    });
    s.addText(`${j.num}  ${j.label}`, {
      x: x + 0.14, y, w: 3.76, h: 0.4,
      fontSize: 12, color: C.white, bold: false, fontFace: "Calibri",
      valign: "middle",
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 0.1, h: 0.4,
      fill: { color: j.color },
      line: { color: j.color, width: 0 },
      rectRadius: 0.06,
    });
  });

  s.addText("6 slides  ·  March 2026", {
    x: 0.6, y: 5.6, w: 6, h: 0.3,
    fontSize: 10, color: "4A5568",
  });
}

// ── Slide 2: Overview flow diagram ─────────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: C.bg } });
  pageHeader(s, "Wandr — User Journey Map  (Overview)", C.blue);

  // Row layout: y starts at 1.0, each row is 0.74 apart
  const ROW = { 1: 1.08, 2: 1.86, 3: 2.64, 4: 3.42, 5: 4.20 };
  const NW = 1.54, NH = 0.5;

  // Lane labels
  laneLabel(s, "①", "Primary Flow",  0.06, ROW[1] + 0.07, C.blue);
  laneLabel(s, "②", "Escape Entry",  0.06, ROW[2] + 0.07, C.violet);
  laneLabel(s, "③", "Group Survey",  0.06, ROW[3] + 0.07, C.green);
  laneLabel(s, "④", "Member Join",   0.06, ROW[4] + 0.07, C.orange);
  laneLabel(s, "⑤", "Auth Flow",     0.06, ROW[5] + 0.07, "7C6F9F");

  // Primary flow nodes — x positions
  const col = [1.26, 2.94, 4.62, 6.30, 7.98, 9.66, 11.34];
  const y1 = ROW[1];

  node(s, "Home\n/", col[0], y1, NW, NH, C.blue);
  arrow(s, col[0] + NW, y1 + 0.12);
  node(s, "Intake Quiz\n/intake", col[1], y1, NW, NH, C.blue);
  arrow(s, col[1] + NW, y1 + 0.12);
  node(s, "Generating\n/generating", col[2], y1, NW, NH, C.blue);
  arrow(s, col[2] + NW, y1 + 0.12);
  node(s, "Itinerary\n/itinerary/:id", col[3], y1, NW, NH, C.blue);
  s.addText("→ [group]", { x: col[3] + NW, y: y1 + 0.12, w: 0.6, h: 0.28, fontSize: 8, color: C.grey, align: "center" });
  node(s, "Survey Invite\n/survey/invite", col[4], y1, NW, NH, C.green);
  arrow(s, col[4] + NW, y1 + 0.12);
  node(s, "Survey Status\n/survey/status", col[5], y1, NW, NH, C.green);
  s.addText("→ re-gen", { x: col[5] + NW, y: y1 + 0.12, w: 0.64, h: 0.28, fontSize: 8, color: C.grey, align: "center" });
  node(s, "Re-generate\n/generating", col[6] - 0.2, y1, NW, NH, C.blue);

  // Escape entry row
  const y2 = ROW[2];
  node(s, "Escape Card\n(Popular Escapes)", col[0], y2, NW, NH, C.violet);
  arrow(s, col[0] + NW, y2 + 0.12);
  node(s, "Party Type Step\n(noType=true)", col[1], y2, NW, NH, C.violet);
  s.addText("→ joins Intake quiz →", { x: col[1] + NW, y: y2 + 0.16, w: 2.4, h: 0.24, fontSize: 8.5, color: C.grey });

  // Group survey note
  const y3 = ROW[3];
  noteBox(s,
    "Group organiser: Intake ends with \"Invite My Wandrers →\". Organiser sees Itinerary, then clicks \"Invite Group\" → Survey Invite page.\nShare unique link with each group member → they complete Survey Join quiz independently.",
    1.26, y3, 11.0, NH, C.greenLight, C.green, 9
  );

  // Member join row
  const y4 = ROW[4];
  s.addText("(starts from shared link)", { x: col[3] + 0.1, y: y4, w: NW + 0.5, h: 0.2, fontSize: 7.5, color: C.grey, italics: true });
  node(s, "Survey Join\n/survey/join", col[4], y4, NW, NH, C.orange);
  arrow(s, col[4] + NW, y4 + 0.12);
  node(s, "Survey Status\n/survey/status", col[5], y4, NW, NH, C.orange);

  // Auth row
  const y5 = ROW[5];
  node(s, "Sign In\n/sign-in", col[2], y5, NW, NH, "7C6F9F");
  s.addText("⇄", { x: col[2] + NW, y: y5 + 0.1, w: 0.4, h: 0.3, fontSize: 16, color: C.grey, align: "center" });
  node(s, "Sign Up\n/sign-up", col[3], y5, NW, NH, "7C6F9F");
  s.addText("→ Home  (triggered from Nav or itinerary save gate)", {
    x: col[3] + NW, y: y5 + 0.14, w: 4.2, h: 0.26, fontSize: 8.5, color: C.grey,
  });

  // Footer note
  s.addText("Secondary pages: /faq  /brand  /trips  /privacy  /terms  /contact", {
    x: 1.26, y: 5.2, w: 10, h: 0.24, fontSize: 8.5, color: C.grey, italics: true,
  });
}

// ── Slide 3: Journey ① — Primary Flow ──────────────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: C.bg } });
  pageHeader(s, "Journey ①  —  Primary Flow (Solo / Duo / Group / Family)", C.blue);

  // Step boxes
  const steps = [
    { label: "Home\n/", x: 0.3, color: C.blue },
    { label: "Intake Quiz\n/intake", x: 2.7, color: C.blue },
    { label: "Generating\n/generating", x: 5.1, color: C.blue },
    { label: "Itinerary\n/itinerary/:id", x: 7.5, color: C.blue },
  ];

  steps.forEach((st, i) => {
    node(s, st.label, st.x, 1.1, 2.1, 0.7, st.color);
    if (i < steps.length - 1) arrow(s, st.x + 2.1, 1.3);
  });

  // Entry arrows from home
  s.addText("Hero Search\n(with trip type)", { x: 0.3, y: 0.88, w: 2.1, h: 0.2, fontSize: 8, color: C.grey, align: "center", italics: true });

  // Intake steps detail
  const partyTypes = [
    { label: "Solo", steps: "Vibe  →  Energy  →  Budget  →  Activities  →  Food", color: C.blueLight },
    { label: "Duo", steps: "Style  →  Energy  →  Budget  →  Activities  →  Food", color: C.blueLight },
    { label: "Group", steps: "Dynamic  →  Energy  →  Budget  →  Activities  →  Food", color: C.blueLight },
    { label: "Family", steps: "Kids ages  →  Energy  →  Budget  →  Activities  →  Food  →  Family needs", color: C.blueLight },
  ];

  s.addText("Intake quiz steps vary by party type:", {
    x: 0.3, y: 2.08, w: 12, h: 0.28, fontSize: 11, bold: true, color: C.navy,
  });

  partyTypes.forEach((pt, i) => {
    const y = 2.44 + i * 0.52;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.3, y, w: 12, h: 0.42, fill: { color: C.blueLight }, line: { color: C.blueLight }, rectRadius: 0.06 });
    s.addShape(pptx.ShapeType.roundRect, { x: 0.3, y, w: 0.7, h: 0.42, fill: { color: C.blue }, line: { color: C.blue }, rectRadius: 0.06 });
    s.addText(pt.label, { x: 0.3, y, w: 0.7, h: 0.42, fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle" });
    s.addText(pt.steps, { x: 1.1, y, w: 11.1, h: 0.42, fontSize: 9.5, color: C.navy, valign: "middle" });
  });

  // Required steps note
  noteBox(s,
    "Required (cannot skip): Party Type  ·  Duration & Dates  ·  Kids Ages (family)\nAll other steps can be skipped with the 'Skip' action.",
    0.3, 4.58, 12, 0.52, C.greyLight, C.grey, 9.5
  );
}

// ── Slide 4: Journey ② & ③ — Escape Entry + Group Survey ──────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: C.bg } });
  pageHeader(s, "Journey ②  Escape Entry  &  Journey ③  Group Survey Organiser", C.violet);

  // Escape entry
  s.addText("② Escape Entry — clicking a Popular Escape card on the Home screen", {
    x: 0.3, y: 0.98, w: 12, h: 0.32, fontSize: 11, bold: true, color: C.violet,
  });

  const escSteps = [
    { label: "Popular\nEscape Card", color: C.violet },
    { label: "Party Type\nStep (prepend)", color: C.violet },
    { label: "Intake Quiz\n/intake", color: C.blue },
    { label: "Generating\n/generating", color: C.blue },
    { label: "Itinerary\n/itinerary/:id", color: C.blue },
  ];
  escSteps.forEach((st, i) => {
    const x = 0.3 + i * 2.5;
    node(s, st.label, x, 1.38, 2.1, 0.62, st.color);
    if (i < escSteps.length - 1) arrow(s, x + 2.1, 1.58);
  });
  s.addText("noType=true param → party type step is prepended before the main quiz", {
    x: 0.3, y: 2.08, w: 12, h: 0.26, fontSize: 9, color: C.grey, italics: true,
  });

  // Divider
  s.addShape(pptx.ShapeType.line, { x: 0.3, y: 2.44, w: 12.1, h: 0, line: { color: "D1D5DB", width: 1 } });

  // Group survey
  s.addText("③ Group Survey — Organiser Journey", {
    x: 0.3, y: 2.56, w: 12, h: 0.32, fontSize: 11, bold: true, color: C.green,
  });

  const grpSteps = [
    { label: "Intake\n(group type)", color: C.blue },
    { label: "\"Invite My\nWandrers →\"", color: C.green },
    { label: "Generating\n/generating", color: C.blue },
    { label: "Itinerary\n/itinerary/:id", color: C.blue },
    { label: "Survey Invite\n/survey/invite", color: C.green },
  ];
  grpSteps.forEach((st, i) => {
    const x = 0.3 + i * 2.5;
    node(s, st.label, x, 2.96, 2.1, 0.62, st.color);
    if (i < grpSteps.length - 1) arrow(s, x + 2.1, 3.18);
  });

  const grpSteps2 = [
    { label: "Survey Status\n/survey/status", color: C.green },
    { label: "Re-generate\n/generating", color: C.blue },
    { label: "Updated\nItinerary", color: C.blue },
  ];
  grpSteps2.forEach((st, i) => {
    const x = 0.3 + i * 2.5;
    node(s, st.label, x, 3.76, 2.1, 0.62, st.color);
    if (i < grpSteps2.length - 1) arrow(s, x + 2.1, 3.98);
  });
  s.addText("←  from Survey Invite:", { x: 0, y: 3.76, w: 0.28, h: 0.62, fontSize: 7.5, color: C.grey, valign: "middle" });

  noteBox(s,
    "Survey Invite: organiser adds group members by name, copies a unique shareable link per member.\nSurvey Status: shows response completion for each member. When all respond, organiser can re-generate the itinerary with group input baked in.",
    0.3, 4.52, 12, 0.64, C.greenLight, C.green, 9.5
  );
}

// ── Slide 5: Journey ④ — Group Member (Survey Join) ────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: C.bg } });
  pageHeader(s, "Journey ④  —  Group Member  (Survey Join via shared link)", C.orange);

  s.addText("Member opens a unique link shared by the trip organiser and completes a short preferences quiz.", {
    x: 0.3, y: 0.96, w: 12, h: 0.3, fontSize: 10.5, color: C.grey,
  });

  const memSteps = [
    { label: "Shared Link\n/survey/join\n?name&token", color: C.orange },
    { label: "Welcome\nScreen", color: C.orange },
    { label: "Group\nDynamic", color: C.orange },
    { label: "Energy\nLevel", color: C.orange },
    { label: "Budget", color: C.orange },
    { label: "Activities", color: C.orange },
    { label: "Food &\nDining", color: C.orange },
    { label: "Survey\nStatus", color: C.orange },
  ];

  memSteps.forEach((st, i) => {
    const x = 0.18 + i * 1.62;
    node(s, st.label, x, 1.44, 1.44, 0.7, st.color);
    if (i < memSteps.length - 1) {
      s.addText("→", { x: x + 1.44, y: 1.64, w: 0.18, h: 0.28, fontSize: 12, color: C.grey, align: "center" });
    }
  });

  // Steps detail
  s.addText("Survey Join quiz steps:", {
    x: 0.3, y: 2.36, w: 12, h: 0.3, fontSize: 11, bold: true, color: C.navy,
  });

  const surveySteps = [
    { step: "Welcome", desc: "Intro screen with trip name & organiser — sets context before questions begin." },
    { step: "Group Dynamic", desc: "How does the member prefer to travel within the group? (e.g. explore solo, pair off, all together)" },
    { step: "Energy Level", desc: "Slider: how packed should each day be? Rest vs. adventure." },
    { step: "Budget", desc: "Budget tier preference: budget / moderate / comfort / luxury." },
    { step: "Activities", desc: "Multi-select: culture, nature, food, nightlife, relaxation, etc." },
    { step: "Food & Dining", desc: "Dining preferences: street food, sit-down, one standout meal, dietary needs." },
  ];
  surveySteps.forEach((st, i) => {
    const y = 2.72 + i * 0.39;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.3, y, w: 12, h: 0.34, fill: { color: C.orangeLight }, line: { color: C.orangeLight }, rectRadius: 0.05 });
    s.addShape(pptx.ShapeType.roundRect, { x: 0.3, y, w: 1.3, h: 0.34, fill: { color: C.orange }, line: { color: C.orange }, rectRadius: 0.05 });
    s.addText(st.step, { x: 0.3, y, w: 1.3, h: 0.34, fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle" });
    s.addText(st.desc, { x: 1.7, y, w: 10.5, h: 0.34, fontSize: 9, color: C.navy, valign: "middle" });
  });
}

// ── Slide 6: Journey ⑤ & Itinerary Interactions ────────────────────────────
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: C.bg } });
  pageHeader(s, "Journey ⑤  Auth Flow  &  Itinerary Interactions", "7C6F9F");

  // Auth flow
  s.addText("⑤ Auth Flow", { x: 0.3, y: 0.98, w: 4, h: 0.3, fontSize: 11, bold: true, color: "5B4B8A" });
  s.addText("Triggered from: Nav 'Sign in' button, or Itinerary save action (auth gate modal)", {
    x: 0.3, y: 1.3, w: 12, h: 0.24, fontSize: 9, color: C.grey, italics: true,
  });

  const authSteps = [
    { label: "Sign In\n/sign-in", color: "7C6F9F" },
    { label: "Sign Up\n/sign-up", color: "7C6F9F" },
    { label: "Home\n/", color: C.blue },
  ];
  authSteps.forEach((st, i) => {
    const x = 0.3 + i * 2.8;
    node(s, st.label, x, 1.64, 2.4, 0.62, st.color);
    if (i < authSteps.length - 1) {
      const sym = i === 0 ? "⇄" : "→";
      s.addText(sym, { x: x + 2.4, y: 1.84, w: 0.4, h: 0.24, fontSize: 14, color: C.grey, align: "center" });
    }
  });
  s.addText("Sign In links to Sign Up and vice versa  ·  Both return the user to Home (or previous page)", {
    x: 0.3, y: 2.34, w: 10, h: 0.26, fontSize: 9, color: C.grey,
  });

  // Divider
  s.addShape(pptx.ShapeType.line, { x: 0.3, y: 2.72, w: 12.1, h: 0, line: { color: "D1D5DB", width: 1 } });

  // Itinerary interactions
  s.addText("Itinerary Interactions", { x: 0.3, y: 2.84, w: 6, h: 0.3, fontSize: 11, bold: true, color: C.navy });
  s.addText("Available on every generated itinerary — no account required except Save:", {
    x: 0.3, y: 3.16, w: 12, h: 0.24, fontSize: 9, color: C.grey, italics: true,
  });

  const interactions = [
    { icon: "⇄", label: "Swap Activity", desc: "Each activity block has an AI-matched alternative. Tap 'Swap' to replace; tap 'Swap back' to restore.", auth: false },
    { icon: "⏸", label: "Rest / Skip", desc: "Turn any activity slot into free time. A 'Restore activity' link brings it back.", auth: false },
    { icon: "★", label: "Save Trip", desc: "Persists the itinerary to the user's saved trips. Triggers an auth gate modal if not signed in.", auth: true },
    { icon: "⎘", label: "Share Link", desc: "Copies a shareable itinerary URL to the clipboard.", auth: false },
    { icon: "↺", label: "Start Over", desc: "Navigates back to /intake with destination and trip type preserved — resets all preferences.", auth: false },
  ];

  interactions.forEach((ia, i) => {
    const y = 3.48 + i * 0.36;
    const bg = i % 2 === 0 ? C.greyLight : C.white;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.3, y, w: 12, h: 0.32, fill: { color: bg }, line: { color: bg }, rectRadius: 0.05 });
    s.addText(ia.icon, { x: 0.3, y, w: 0.42, h: 0.32, fontSize: 13, align: "center", valign: "middle" });
    s.addText(ia.label, { x: 0.78, y, w: 1.6, h: 0.32, fontSize: 9.5, bold: true, color: C.navy, valign: "middle" });
    s.addText(ia.desc, { x: 2.46, y, w: 9.2, h: 0.32, fontSize: 9, color: C.grey, valign: "middle" });
    if (ia.auth) {
      s.addShape(pptx.ShapeType.roundRect, { x: 11.7, y: y + 0.06, w: 0.62, h: 0.2, fill: { color: C.accent }, line: { color: C.accent }, rectRadius: 0.04 });
      s.addText("auth", { x: 11.7, y: y + 0.06, w: 0.62, h: 0.2, fontSize: 7.5, bold: true, color: C.white, align: "center", valign: "middle" });
    }
  });
}

// ── Write file ──────────────────────────────────────────────────────────────
await pptx.writeFile({ fileName: "public/wandr-ux-flow.pptx" });
console.log("Done → public/wandr-ux-flow.pptx");

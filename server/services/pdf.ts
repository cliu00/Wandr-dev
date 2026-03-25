import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// ─── Styles ────────────────────────────────────────────────────────────────────

const FOREST  = "#2d5a3d";
const GOLD    = "#c49a28";
const INK     = "#1e160c";
const MUTED   = "#6b5c4e";
const LIGHT   = "#f7f4f0";
const BORDER  = "#e5ddd5";
const WHITE   = "#ffffff";

const TIME_COLORS: Record<string, string> = {
  morning:   "#fef3c7",
  afternoon: "#ffedd5",
  evening:   "#e0e7ff",
  rest:      "#f3f4f6",
};
const TIME_FG: Record<string, string> = {
  morning:   "#92400e",
  afternoon: "#9a3412",
  evening:   "#3730a3",
  rest:      "#6b7280",
};
const BORDER_COLORS: Record<string, string> = {
  morning:   "#fbbf24",
  afternoon: "#fb923c",
  evening:   "#818cf8",
  rest:      BORDER,
};

const s = StyleSheet.create({
  page: {
    backgroundColor: WHITE,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
  },
  // Header
  header: { marginBottom: 32 },
  brand: { fontSize: 9, color: MUTED, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 },
  destination: { fontSize: 40, color: INK, fontFamily: "Helvetica-Bold", lineHeight: 1, marginBottom: 4 },
  country: { fontSize: 9, color: MUTED, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 },
  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  metaPill: { fontSize: 9, color: MUTED, backgroundColor: LIGHT, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 20 },

  // Day section
  dayHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14, marginTop: 8 },
  dayLabel: { fontSize: 16, fontFamily: "Helvetica-Bold", color: INK, marginRight: 12 },
  dayDate: { fontSize: 9, color: MUTED },
  dayLine: { flex: 1, height: 1, backgroundColor: BORDER, marginLeft: 10 },

  // Card
  card: { borderRadius: 8, marginBottom: 10, borderLeftWidth: 3, overflow: "hidden" },
  cardInner: { padding: 14, backgroundColor: LIGHT },
  timeBadge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  timeBadgeText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  activityName: { fontSize: 14, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 2 },
  activityType: { fontSize: 9, color: MUTED, marginBottom: 2 },
  activityAddress: { fontSize: 9, color: FOREST, marginBottom: 8 },
  description: { fontSize: 10, color: INK, lineHeight: 1.5, marginBottom: 8 },
  whyBox: { borderLeftWidth: 2, borderLeftColor: GOLD, paddingLeft: 8, marginBottom: 4 },
  whyLabel: { fontSize: 7, color: GOLD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 },
  whyText: { fontSize: 9, color: MUTED, lineHeight: 1.4 },
  costPill: { alignSelf: "flex-end", fontSize: 8, color: MUTED, backgroundColor: WHITE, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, marginTop: 4 },

  // Footer
  footer: { marginTop: 24, flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 8, color: MUTED },
});

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ActivityBlock {
  id: string;
  timeSlot: "morning" | "afternoon" | "evening" | "rest";
  primary: {
    name: string;
    type?: string;
    description?: string;
    whyForYou?: string;
    costRange?: string;
    address?: string;
  };
}

interface ItineraryDay {
  dayNumber: number;
  date: string;
  blocks: ActivityBlock[];
}

interface ItineraryData {
  destination: string;
  country?: string;
  durationDays: number;
  groupType?: string;
  days: ItineraryDay[];
}

// ─── PDF Document Component ────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

function ItineraryPDF({ itinerary }: { itinerary: ItineraryData }) {
  const firstDate = itinerary.days[0]?.date;
  const lastDate  = itinerary.days[itinerary.days.length - 1]?.date;
  const dateRange = firstDate === lastDate
    ? formatDate(firstDate)
    : `${formatDate(firstDate)} — ${formatDate(lastDate)}`;

  return React.createElement(
    Document,
    { title: `Wandr — ${itinerary.destination}`, author: "Wandr" },
    React.createElement(
      Page,
      { size: "A4", style: s.page },

      // ── Header
      React.createElement(
        View,
        { style: s.header },
        React.createElement(Text, { style: s.brand }, "Your Wandr Itinerary"),
        React.createElement(Text, { style: s.destination }, itinerary.destination),
        itinerary.country
          ? React.createElement(Text, { style: s.country }, itinerary.country)
          : null,
        React.createElement(
          View,
          { style: s.metaRow },
          React.createElement(Text, { style: s.metaPill }, `${itinerary.durationDays} ${itinerary.durationDays === 1 ? "day" : "days"}`),
          React.createElement(Text, { style: s.metaPill }, dateRange),
          itinerary.groupType
            ? React.createElement(Text, { style: s.metaPill }, itinerary.groupType.charAt(0).toUpperCase() + itinerary.groupType.slice(1))
            : null,
        ),
      ),

      React.createElement(View, { style: s.divider }),

      // ── Days
      ...itinerary.days.flatMap((day) => [
        // Day header
        React.createElement(
          View,
          { style: s.dayHeader, key: `hdr-${day.dayNumber}` },
          React.createElement(Text, { style: s.dayLabel }, `Day ${day.dayNumber}`),
          React.createElement(Text, { style: s.dayDate }, formatDate(day.date)),
          React.createElement(View, { style: s.dayLine }),
        ),

        // Activity cards
        ...day.blocks.map((block) =>
          React.createElement(
            View,
            {
              key: block.id,
              style: [s.card, { borderLeftColor: BORDER_COLORS[block.timeSlot] ?? BORDER }],
            },
            React.createElement(
              View,
              { style: s.cardInner },
              // Time badge
              React.createElement(
                View,
                { style: [s.timeBadge, { backgroundColor: TIME_COLORS[block.timeSlot] ?? LIGHT }] },
                React.createElement(
                  Text,
                  { style: [s.timeBadgeText, { color: TIME_FG[block.timeSlot] ?? MUTED }] },
                  block.timeSlot.charAt(0).toUpperCase() + block.timeSlot.slice(1),
                ),
              ),
              // Name
              React.createElement(Text, { style: s.activityName }, block.primary.name),
              // Type
              block.primary.type
                ? React.createElement(Text, { style: s.activityType }, block.primary.type)
                : null,
              // Address
              block.primary.address
                ? React.createElement(Text, { style: s.activityAddress }, block.primary.address)
                : null,
              // Description
              block.primary.description
                ? React.createElement(Text, { style: s.description }, block.primary.description)
                : null,
              // Why for you
              block.primary.whyForYou
                ? React.createElement(
                    View,
                    { style: s.whyBox },
                    React.createElement(Text, { style: s.whyLabel }, "Why we picked this for you"),
                    React.createElement(Text, { style: s.whyText }, block.primary.whyForYou),
                  )
                : null,
              // Cost
              block.primary.costRange
                ? React.createElement(Text, { style: s.costPill }, block.primary.costRange)
                : null,
            ),
          )
        ),

        // Divider between days
        day.dayNumber < itinerary.days.length
          ? React.createElement(View, { style: [s.divider, { marginVertical: 16 }], key: `div-${day.dayNumber}` })
          : null,
      ]),

      // ── Footer
      React.createElement(
        View,
        { style: s.footer },
        React.createElement(Text, { style: s.footerText }, "Generated by Wandr"),
        React.createElement(Text, { style: s.footerText }, new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })),
      ),
    )
  );
}

// ─── Export function ───────────────────────────────────────────────────────────

export async function generatePDF(itinerary: ItineraryData): Promise<Buffer> {
  const element = React.createElement(ItineraryPDF, { itinerary });
  return await renderToBuffer(element as any);
}

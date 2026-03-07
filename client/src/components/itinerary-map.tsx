import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Itinerary } from "@/lib/mock-data";

interface ItineraryMapProps {
  itinerary: Itinerary;
  onMarkerClick?: (dayNumber: number, blockIndex: number) => void;
}

const DAY_COLORS = [
  { bg: "#1a3d2b", text: "#ffffff" },
  { bg: "#b07d2a", text: "#ffffff" },
  { bg: "#2a3d5e", text: "#ffffff" },
  { bg: "#5e2a2a", text: "#ffffff" },
];

function createCustomMarker(number: number, dayIndex: number) {
  const color = DAY_COLORS[dayIndex % DAY_COLORS.length];
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${color.bg};
        color: ${color.text};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        font-family: Inter, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        border: 2px solid rgba(255,255,255,0.8);
      ">
        ${number}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function MapBounds({ itinerary }: { itinerary: Itinerary }) {
  const map = useMap();
  useEffect(() => {
    const points: L.LatLngExpression[] = [];
    itinerary.days.forEach((day) => {
      day.blocks.forEach((block) => {
        points.push([block.primary.lat, block.primary.lng]);
      });
    });
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [itinerary, map]);
  return null;
}

export function ItineraryMap({ itinerary, onMarkerClick }: ItineraryMapProps) {
  const center: [number, number] = [
    itinerary.days[0]?.blocks[0]?.primary.lat ?? 51.505,
    itinerary.days[0]?.blocks[0]?.primary.lng ?? -0.09,
  ];

  let markerCount = 0;

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="w-full h-full"
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapBounds itinerary={itinerary} />

      {itinerary.days.map((day, dayIdx) =>
        day.blocks
          .filter((b) => b.timeSlot !== "rest")
          .map((block, blockIdx) => {
            markerCount++;
            const num = markerCount;
            return (
              <Marker
                key={block.id}
                position={[block.primary.lat, block.primary.lng]}
                icon={createCustomMarker(num, dayIdx)}
                eventHandlers={{
                  click: () => onMarkerClick?.(day.dayNumber, blockIdx),
                }}
              >
                <Popup>
                  <div className="text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                    <div className="font-semibold text-foreground">{block.primary.name}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{block.primary.type}</div>
                    <div className="text-xs mt-1 text-muted-foreground">{block.primary.costRange}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })
      )}
    </MapContainer>
  );
}

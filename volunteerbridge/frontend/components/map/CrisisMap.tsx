/**
 * CrisisMap — Google Maps component with urgency-colored need markers.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { CommunityNeed } from "@/types";
import Spinner from "@/components/ui/Spinner";

interface CrisisMapProps {
  needs: CommunityNeed[];
  onMarkerClick?: (need: CommunityNeed) => void;
  className?: string;
}

function getMarkerColor(urgencyScore: number): string {
  if (urgencyScore >= 8) return "#E24B4A";
  if (urgencyScore >= 5) return "#EF9F27";
  return "#639922";
}

function createMarkerElement(urgencyScore: number): HTMLDivElement {
  const el = document.createElement("div");
  const color = getMarkerColor(urgencyScore);
  el.style.cssText = `
    width: 28px;
    height: 28px;
    background-color: ${color};
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: transform 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: white;
  `;
  el.textContent = String(urgencyScore);
  el.addEventListener("mouseenter", () => {
    el.style.transform = "scale(1.3)";
  });
  el.addEventListener("mouseleave", () => {
    el.style.transform = "scale(1)";
  });
  return el;
}

export default function CrisisMap({
  needs,
  onMarkerClick,
  className = "",
}: CrisisMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initMap = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "") {
      setError("Google Maps API key not configured.");
      setLoading(false);
      return;
    }

    try {
      const loader = new Loader({
        apiKey,
        version: "weekly",
        libraries: ["marker"],
      });

      const google = await loader.load();

      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
        mapId: "volunteerbridge-crisis-map",
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      mapInstanceRef.current = map;
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load Google Maps";
      setError(message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initMap();
  }, [initMap]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    needs.forEach((need) => {
      if (!need.location?.lat || !need.location?.lng) return;

      const markerElement = createMarkerElement(need.urgency_score);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: need.location.lat, lng: need.location.lng },
        content: markerElement,
        title: `${need.need_type} - Urgency: ${need.urgency_score}`,
      });

      marker.addListener("click", () => {
        onMarkerClick?.(need);
      });

      newMarkers.push(marker);
    });

    markersRef.current = newMarkers;

    if (newMarkers.length > 0) {
      clustererRef.current = new MarkerClusterer({
        map,
        markers: newMarkers,
      });
    }

    // Fit bounds to markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      needs.forEach((need) => {
        if (need.location?.lat && need.location?.lng) {
          bounds.extend({ lat: need.location.lat, lng: need.location.lng });
        }
      });
      map.fitBounds(bounds, { padding: 50 });
    }
  }, [needs, onMarkerClick]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 ${className}`}>
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🗺️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
          <p className="text-sm text-gray-500 max-w-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <Spinner size="lg" label="Loading map..." />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-3 z-10">
        <p className="text-xs font-semibold text-gray-700 mb-2">Urgency</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E24B4A]" />
            <span className="text-xs text-gray-600">Critical (8-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF9F27]" />
            <span className="text-xs text-gray-600">Moderate (5-7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#639922]" />
            <span className="text-xs text-gray-600">Low (1-4)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

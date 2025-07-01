"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Satellite } from "lucide-react";
import { Location } from "@/lib/types";

interface MapComponentProps {
  location: Location;
  satelliteCount: number;
}

export default function MapComponent({
  location,
  satelliteCount,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      mapRef.current &&
      !mapInstanceRef.current
    ) {
      // Dynamically import Leaflet
      import("leaflet").then((L) => {
        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current!).setView(
          [location.lat, location.lng],
          13,
        );

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current);

        // Add marker
        markerRef.current = L.marker([location.lat, location.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup("Solar Car Location");
      });
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      // Update marker position
      markerRef.current.setLatLng([location.lat, location.lng]);
      mapInstanceRef.current.setView([location.lat, location.lng]);
    }
  }, [location]);

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="h-full w-full rounded-lg" />
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
        <div className="flex items-center gap-2">
          <Satellite className="h-4 w-4" />
          <span className="text-sm font-medium">
            Satellites: {satelliteCount}
          </span>
          <Badge
            variant={satelliteCount >= 4 ? "default" : "destructive"}
            className="text-xs"
          >
            {satelliteCount >= 4 ? "Good" : "Poor"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

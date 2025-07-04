"use client";

import { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Satellite } from "lucide-react";
import { Location } from "@/lib/types";

interface MapComponentProps {
  location: Location;
  satelliteCount?: number;
}

export default function MapComponent({
  location,
  satelliteCount,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    if (
      typeof window !== "undefined" &&
      mapRef.current &&
      !mapInstanceRef.current
    ) {
      // Dynamically import Leaflet
      import("leaflet").then((L) => {
        // Check if component is still mounted and map hasn't been initialized
        if (isMounted && !mapInstanceRef.current && mapRef.current) {
          // Check if container already has a map
          const container = mapRef.current;
          if ((container as any)._leaflet_id) {
            // Container already has a map, clean it up
            delete (container as any)._leaflet_id;
          }

          // Initialize map
          mapInstanceRef.current = L.map(container).setView(
            [location.lat, location.lng],
            13,
          );

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(mapInstanceRef.current);

          // Fix default icon issue with Next.js
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          });

          // Add marker
          markerRef.current = L.marker([location.lat, location.lng])
            .addTo(mapInstanceRef.current)
            .bindPopup("Solar Car Location");
        }
      });
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [location.lat, location.lng]);

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      // Update marker position
      markerRef.current.setLatLng([location.lat, location.lng]);
      mapInstanceRef.current.setView([location.lat, location.lng]);
    }
  }, [location.lat, location.lng]);

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="h-full w-full rounded-lg" />
    </div>
  );
}

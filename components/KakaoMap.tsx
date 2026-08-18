"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

export interface MapMarker {
  lat: number;
  lng: number;
  name: string;
  href?: string;
}

export default function KakaoMap({
  markers,
  className,
}: {
  markers: MapMarker[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkLoaded, setSdkLoaded] = useState(
    () => typeof window !== "undefined" && !!window.kakao?.maps,
  );

  // Client-side navigation reuses the already-inserted <script> tag, so
  // next/script's onLoad won't fire again on remount — poll for it instead.
  // Also keep polling if the SDK ever appears "loaded" but window.kakao
  // is missing (e.g. onLoad fired before the domain check finished and
  // Kakao tore the global back down) so the map can self-recover.
  useEffect(() => {
    if (sdkLoaded && window.kakao?.maps) return;
    const id = setInterval(() => {
      if (window.kakao?.maps) {
        setSdkLoaded(true);
        clearInterval(id);
      } else if (sdkLoaded) {
        setSdkLoaded(false);
      }
    }, 100);
    return () => clearInterval(id);
  }, [sdkLoaded]);

  useEffect(() => {
    if (
      !sdkLoaded ||
      !window.kakao?.maps ||
      !containerRef.current ||
      markers.length === 0
    ) {
      return;
    }

    window.kakao.maps.load(() => {
      const { kakao } = window;
      if (!kakao?.maps || !containerRef.current) return;
      const center = new kakao.maps.LatLng(markers[0].lat, markers[0].lng);
      const map = new kakao.maps.Map(containerRef.current, {
        center,
        level: markers.length > 1 ? 6 : 4,
      });

      const bounds = new kakao.maps.LatLngBounds();

      for (const marker of markers) {
        const position = new kakao.maps.LatLng(marker.lat, marker.lng);
        bounds.extend(position);

        const mapMarker = new kakao.maps.Marker({ position, map });

        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;white-space:nowrap;">${marker.href ? `<a href="${marker.href}" style="color:#171717;">${marker.name}</a>` : marker.name}</div>`,
        });

        kakao.maps.event.addListener(mapMarker, "mouseover", () => {
          infowindow.open(map, mapMarker);
        });
        kakao.maps.event.addListener(mapMarker, "mouseout", () => {
          infowindow.close();
        });
        if (marker.href) {
          kakao.maps.event.addListener(mapMarker, "click", () => {
            window.location.href = marker.href!;
          });
        }
      }

      if (markers.length > 1) {
        map.setBounds(bounds);
      }
    });
  }, [sdkLoaded, markers]);

  if (!KAKAO_JS_KEY) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-black/10 bg-black/[.02] text-sm text-foreground/50 dark:border-white/10 dark:bg-white/[.02] ${className ?? ""}`}
      >
        지도를 표시하려면 카카오맵 API 키 설정이 필요해요.
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
      />
      <div
        ref={containerRef}
        className={`rounded-xl border border-black/10 dark:border-white/10 ${className ?? ""}`}
      />
    </>
  );
}

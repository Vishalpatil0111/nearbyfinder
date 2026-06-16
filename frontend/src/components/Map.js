"use client";
import { useEffect, useRef } from "react";
import "ol/ol.css";
import { CATEGORY_COLORS } from "@/lib/categories";

const ICON_PATHS = {
  hospital: "M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z",
  atm: "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zm2 0v10h16V7H4zm3 2h2v6H7V9zm4 0h6v2h-6V9zm0 3h4v1h-4v-1z",
  shop: "M20 7H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0 4 4 4 4 0 0 0 4-4V8a1 1 0 0 0-1-1zM6 2h12l2 5H4L6 2zm1 13v7h10v-7",
  others: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
};

function makePinSVG(color, path) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
    <defs><filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/></filter></defs>
    <path d="M20 2C11 2 4 9 4 18C4 30 20 50 20 50C20 50 36 30 36 18C36 9 29 2 20 2Z" fill="${color}" filter="url(#sh)" stroke="white" stroke-width="1.5"/>
    <circle cx="20" cy="18" r="10" fill="white" opacity="0.95"/>
    <g transform="translate(8,6)"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg></g>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const PIN_ICONS = {
  hospital: makePinSVG(CATEGORY_COLORS.hospital, ICON_PATHS.hospital),
  atm:      makePinSVG(CATEGORY_COLORS.atm,      ICON_PATHS.atm),
  shop:     makePinSVG(CATEGORY_COLORS.shop,     ICON_PATHS.shop),
  others:   makePinSVG(CATEGORY_COLORS.others,   ICON_PATHS.others),
  default:  makePinSVG(CATEGORY_COLORS.default,  ICON_PATHS.others),
};

export default function Map({ services = [], onMarkerClick, centerOn = null }) {
  const mapRef       = useRef(null);
  const mapObj       = useRef(null);   // ol/Map instance
  const sourceObj    = useRef(null);   // ol/source/Vector instance
  const olHelpers    = useRef(null);   // { Feature, Point, Style, Icon, Text, Fill, Stroke, fromLonLat, easeOut }
  const isReady      = useRef(false);

  /* ── bootstrap OL once ── */
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import("ol/Map"),           import("ol/View"),
      import("ol/layer/Tile"),    import("ol/source/OSM"),
      import("ol/layer/Vector"),  import("ol/source/Vector"),
      import("ol/Feature"),       import("ol/geom/Point"),
      import("ol/style/Style"),   import("ol/style/Icon"),
      import("ol/style/Text"),    import("ol/style/Fill"),
      import("ol/style/Stroke"),  import("ol/proj"),
      import("ol/easing"),
    ]).then(([
      {default:OLMap},{default:View},{default:TileLayer},{default:OSM},
      {default:VectorLayer},{default:VectorSource},{default:Feature},
      {default:Point},{default:Style},{default:Icon},{default:Text},
      {default:Fill},{default:Stroke},{fromLonLat},{easeOut},
    ]) => {
      if (cancelled || !mapRef.current) return;

      const source = new VectorSource();
      sourceObj.current = source;
      olHelpers.current = { Feature, Point, Style, Icon, Text, Fill, Stroke, fromLonLat, easeOut };

      const map = new OLMap({
        target: mapRef.current,
        layers: [
          new TileLayer({ source: new OSM() }),
          new VectorLayer({ source, zIndex: 10 }),
        ],
        view: new View({ center: fromLonLat([78.9629, 20.5937]), zoom: 5 }),
      });

      map.on("click", (e) => {
        map.forEachFeatureAtPixel(e.pixel, (f) => {
          const s = f.get("serviceData");
          if (s && onMarkerClick) onMarkerClick(s);
        });
      });
      map.on("pointermove", (e) => {
        map.getTargetElement().style.cursor = map.hasFeatureAtPixel(e.pixel) ? "pointer" : "";
      });

      mapObj.current = map;
      isReady.current = true;

      // render whatever services prop already holds
      drawMarkers(services);
    });

    return () => {
      cancelled = true;
      if (mapObj.current) { mapObj.current.setTarget(null); mapObj.current = null; isReady.current = false; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);   // run once

  /* ── redraw markers whenever services changes ── */
  useEffect(() => {
    drawMarkers(services);
  }, [services]);   // eslint-disable-line

  /* ── pan/zoom whenever centerOn changes ── */
  useEffect(() => {
    if (!centerOn) return;
    panTo(centerOn.lat, centerOn.lng);
  }, [centerOn]);   // eslint-disable-line

  /* ── helpers ── */
  function drawMarkers(svcs) {
    if (!isReady.current || !sourceObj.current || !olHelpers.current) return;
    const { Feature, Point, Style, Icon, Text, Fill, Stroke, fromLonLat } = olHelpers.current;
    sourceObj.current.clear();
    svcs.forEach((s) => {
      const cat  = s.category?.toLowerCase();
      const feat = new Feature({
        geometry:    new Point(fromLonLat([s.longitude, s.latitude])),
        serviceData: s,
      });
      feat.setStyle(new Style({
        image: new Icon({ src: PIN_ICONS[cat] || PIN_ICONS.default, anchor: [0.5, 1], scale: 1 }),
        text:  new Text({
          text:             s.name,
          offsetX:          22,
          offsetY:          -34,
          textAlign:        "left",
          font:             "600 11px Inter,Arial,sans-serif",
          fill:             new Fill({ color: "#0f172a" }),
          stroke:           new Stroke({ color: "#ffffff", width: 3 }),
          backgroundFill:   new Fill({ color: "rgba(255,255,255,0.92)" }),
          padding:          [3, 6, 3, 6],
        }),
      }));
      sourceObj.current.addFeature(feat);
    });
  }

  function panTo(lat, lng) {
    if (!isReady.current || !mapObj.current || !olHelpers.current) return;
    const { fromLonLat, easeOut } = olHelpers.current;
    mapObj.current.getView().animate({
      center:   fromLonLat([lng, lat]),
      zoom:     14,
      duration: 900,
      easing:   easeOut,
    });
  }

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
}

'use client'

import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { REGION_DATA, type Region } from '@/lib/types'

function Recenter({ region }: { region: Region }) {
  const map = useMap()
  const info = REGION_DATA[region]
  useEffect(() => {
    map.setView(info.center, info.zoom)
    // invalidate size after modal opens so tiles fill the container
    const t = setTimeout(() => map.invalidateSize(), 200)
    return () => clearTimeout(t)
  }, [map, info.center, info.zoom, region])
  return null
}

export default function RegionMap({
  region,
  selected,
  onSelect,
}: {
  region: Region
  selected: string | null
  onSelect: (district: string) => void
}) {
  const info = REGION_DATA[region]

  return (
    <MapContainer
      center={info.center}
      zoom={info.zoom}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <Recenter region={region} />
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {info.districts.map((d) => {
        const active = selected === d.name
        return (
          <CircleMarker
            key={d.name}
            center={[d.lat, d.lng]}
            radius={active ? 13 : 9}
            pathOptions={{
              color: active ? '#a1685f' : '#c9a7a0',
              fillColor: active ? '#a1685f' : '#e5d3ce',
              fillOpacity: active ? 0.9 : 0.7,
              weight: active ? 3 : 2,
            }}
            eventHandlers={{ click: () => onSelect(d.name) }}
          >
            <Tooltip
              direction="top"
              offset={[0, -6]}
              permanent
              className="vowreel-map-label"
            >
              {d.name}
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Battery, Zap, Gauge, Sun, Car, Satellite, Thermometer } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

// Type definitions for telemetry data
interface TelemetryData {
  gps: {
    rx_time: number
    longitude: number
    latitude: number
    speed: number
    num_sats: number
  }
  battery: {
    sup_bat_v: number
    main_bat_v: number
    main_bat_c: number
    low_cell_v: number
    high_cell_v: number
    high_cell_t: number
    cell_idx_low_v: number
    cell_idx_high_t: number
  }
  mppt1: {
    input_v: number
    input_c: number
    output_v: number
    output_c: number
  }
  mppt2: {
    input_v: number
    input_c: number
    output_v: number
    output_c: number
  }
  mppt3: {
    input_v: number
    input_c: number
    output_v: number
    output_c: number
  }
  mitsuba: {
    voltage: number
    current: number
    error_frame: number
  }
}

// Mock telemetry data - replace with your actual data source
const useTelemetryData = () => {
  const [data, setData] = useState<TelemetryData>({
    gps: {
      rx_time: Date.now(),
      longitude: -122.4194,
      latitude: 37.7749,
      speed: 45.2,
      num_sats: 8,
    },
    battery: {
      sup_bat_v: 12.4,
      main_bat_v: 48.6,
      main_bat_c: 25.3,
      low_cell_v: 3.2,
      high_cell_v: 3.8,
      high_cell_t: 32.5,
      cell_idx_low_v: 4,
      cell_idx_high_t: 12,
    },
    mppt1: {
      input_v: 42.1,
      input_c: 8.5,
      output_v: 48.2,
      output_c: 7.2,
    },
    mppt2: {
      input_v: 41.8,
      input_c: 7.9,
      output_v: 48.1,
      output_c: 6.8,
    },
    mppt3: {
      input_v: 42.3,
      input_c: 8.1,
      output_v: 48.3,
      output_c: 7.0,
    },
    mitsuba: {
      voltage: 48.2,
      current: 22.5,
      error_frame: 0,
    },
  })

  useEffect(() => {
    // Simulate live data updates
    const interval = setInterval(() => {
      setData((prev) => ({
        gps: {
          ...prev.gps,
          speed: Math.max(0, prev.gps.speed + (Math.random() - 0.5) * 5),
          num_sats: Math.max(0, Math.min(12, prev.gps.num_sats + Math.floor((Math.random() - 0.5) * 3))),
          rx_time: Date.now(),
        },
        battery: {
          ...prev.battery,
          sup_bat_v: Math.max(0, prev.battery.sup_bat_v + (Math.random() - 0.5) * 0.5),
          main_bat_v: Math.max(0, prev.battery.main_bat_v + (Math.random() - 0.5) * 2),
          main_bat_c: Math.max(0, prev.battery.main_bat_c + (Math.random() - 0.5) * 3),
          low_cell_v: Math.max(0, prev.battery.low_cell_v + (Math.random() - 0.5) * 0.1),
          high_cell_v: Math.max(0, prev.battery.high_cell_v + (Math.random() - 0.5) * 0.1),
          high_cell_t: Math.max(0, prev.battery.high_cell_t + (Math.random() - 0.5) * 2),
        },
        mppt1: {
          input_v: Math.max(0, prev.mppt1.input_v + (Math.random() - 0.5) * 2),
          input_c: Math.max(0, prev.mppt1.input_c + (Math.random() - 0.5) * 1),
          output_v: Math.max(0, prev.mppt1.output_v + (Math.random() - 0.5) * 1),
          output_c: Math.max(0, prev.mppt1.output_c + (Math.random() - 0.5) * 1),
        },
        mppt2: {
          input_v: Math.max(0, prev.mppt2.input_v + (Math.random() - 0.5) * 2),
          input_c: Math.max(0, prev.mppt2.input_c + (Math.random() - 0.5) * 1),
          output_v: Math.max(0, prev.mppt2.output_v + (Math.random() - 0.5) * 1),
          output_c: Math.max(0, prev.mppt2.output_c + (Math.random() - 0.5) * 1),
        },
        mppt3: {
          input_v: Math.max(0, prev.mppt3.input_v + (Math.random() - 0.5) * 2),
          input_c: Math.max(0, prev.mppt3.input_c + (Math.random() - 0.5) * 1),
          output_v: Math.max(0, prev.mppt3.output_v + (Math.random() - 0.5) * 1),
          output_c: Math.max(0, prev.mppt3.output_c + (Math.random() - 0.5) * 1),
        },
        mitsuba: {
          voltage: Math.max(0, prev.mitsuba.voltage + (Math.random() - 0.5) * 2),
          current: Math.max(0, prev.mitsuba.current + (Math.random() - 0.5) * 5),
          error_frame: Math.random() > 0.95 ? 1 : 0, // Occasional error
        },
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return data
}

const MapComponent = ({
  location,
  satelliteCount,
}: { location: { lat: number; lng: number }; satelliteCount: number }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
      // Dynamically import Leaflet
      import("leaflet").then((L) => {
        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current!).setView([location.lat, location.lng], 13)

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current)

        // Add marker
        markerRef.current = L.marker([location.lat, location.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup("Solar Car Location")
      })
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      // Update marker position
      markerRef.current.setLatLng([location.lat, location.lng])
      mapInstanceRef.current.setView([location.lat, location.lng])
    }
  }, [location])

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="h-full w-full rounded-lg" />
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
        <div className="flex items-center gap-2">
          <Satellite className="h-4 w-4" />
          <span className="text-sm font-medium">Satellites: {satelliteCount}</span>
          <Badge variant={satelliteCount >= 4 ? "default" : "destructive"} className="text-xs">
            {satelliteCount >= 4 ? "Good" : "Poor"}
          </Badge>
        </div>
      </div>
    </div>
  )
}

const PowerCard = ({
  title,
  voltage,
  current,
  power,
  icon: Icon,
  status,
}: {
  title: string
  voltage: number
  current: number
  power: number
  icon: any
  status?: "good" | "warning" | "critical"
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "good":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-foreground"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className={`text-xl font-bold ${getStatusColor()}`}>{power.toFixed(0)}W</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">V:</span> {voltage.toFixed(1)}V
          </div>
          <div>
            <span className="text-muted-foreground">A:</span> {current.toFixed(1)}A
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SimpleCard = ({
  title,
  value,
  unit,
  icon: Icon,
  status,
  subtitle,
}: {
  title: string
  value: number
  unit: string
  icon: any
  status?: "good" | "warning" | "critical"
  subtitle?: string
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "good":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-foreground"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getStatusColor()}`}>
          {value.toFixed(1)}
          <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

export default function SolarCarTelemetry() {
  const telemetryData = useTelemetryData()

  // Calculate derived values
  const totalSolarPower =
    telemetryData.mppt1.input_v * telemetryData.mppt1.input_c +
    telemetryData.mppt2.input_v * telemetryData.mppt2.input_c +
    telemetryData.mppt3.input_v * telemetryData.mppt3.input_c

  const motorPower = telemetryData.mitsuba.voltage * telemetryData.mitsuba.current
  const batteryPower = telemetryData.battery.main_bat_v * telemetryData.battery.main_bat_c
  const netPower = totalSolarPower - motorPower

  // Status functions
  const getSpeedStatus = (speed: number) => {
    if (speed > 80) return "critical"
    if (speed > 60) return "warning"
    return "good"
  }

  const getBatteryStatus = (voltage: number, type: "main" | "supplemental") => {
    if (type === "main") {
      if (voltage < 44) return "critical"
      if (voltage < 46) return "warning"
      return "good"
    } else {
      if (voltage < 11) return "critical"
      if (voltage < 11.8) return "warning"
      return "good"
    }
  }

  const getCellStatus = (lowV: number, highV: number, temp: number) => {
    if (lowV < 3.0 || highV > 4.0 || temp > 45) return "critical"
    if (lowV < 3.2 || highV > 3.9 || temp > 35) return "warning"
    return "good"
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Logo */}
        <div className="mb-6">
          <div className="flex flex-col items-start gap-2 mb-4">
            <Image
              src="/images/sg-logo.png"
              alt="Solar Gators Logo"
              width={200}
              height={59}
              className="h-auto"
              priority
            />
            <p className="text-muted-foreground">Telemetry monitoring dashboard</p>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="live-stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="live-stats">Live Stats</TabsTrigger>
            <TabsTrigger value="track-flare">Track Flare</TabsTrigger>
          </TabsList>

          {/* Live Stats Tab */}
          <TabsContent value="live-stats" className="space-y-6">
            {/* Top Row - Speed, Net Power, Motor Power */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimpleCard
                title="Vehicle Speed"
                value={telemetryData.gps.speed}
                unit="mph"
                icon={Gauge}
                status={getSpeedStatus(telemetryData.gps.speed)}
              />
              <PowerCard
                title="Net Power"
                voltage={telemetryData.battery.main_bat_v}
                current={netPower / telemetryData.battery.main_bat_v}
                power={netPower}
                icon={Zap}
                status={netPower > 0 ? "good" : netPower > -500 ? "warning" : "critical"}
              />
              <PowerCard
                title="Motor Power"
                voltage={telemetryData.mitsuba.voltage}
                current={telemetryData.mitsuba.current}
                power={motorPower}
                icon={Car}
                status={telemetryData.mitsuba.error_frame > 0 ? "critical" : "good"}
              />
              <PowerCard
                title="Total Solar Input"
                voltage={(telemetryData.mppt1.input_v + telemetryData.mppt2.input_v + telemetryData.mppt3.input_v) / 3}
                current={telemetryData.mppt1.input_c + telemetryData.mppt2.input_c + telemetryData.mppt3.input_c}
                power={totalSolarPower}
                icon={Sun}
                status="good"
              />
            </div>

            {/* MPPT Controllers */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Solar Panel Controllers (MPPT)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">MPPT 1</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Output</div>
                      <div className="text-2xl font-bold">
                        {(telemetryData.mppt1.input_v * telemetryData.mppt1.input_c).toFixed(0)}W
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {telemetryData.mppt1.input_v.toFixed(1)}V × {telemetryData.mppt1.input_c.toFixed(1)}A
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Input</div>
                      <div className="text-base font-bold">
                        {(telemetryData.mppt1.output_v * telemetryData.mppt1.output_c).toFixed(0)}W
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {telemetryData.mppt1.output_v.toFixed(1)}V × {telemetryData.mppt1.output_c.toFixed(1)}A
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">MPPT 2</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Output</div>
                      <div className="text-2xl font-bold">
                        {(telemetryData.mppt2.input_v * telemetryData.mppt2.input_c).toFixed(0)}W
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {telemetryData.mppt2.input_v.toFixed(1)}V × {telemetryData.mppt2.input_c.toFixed(1)}A
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Input</div>
                      <div className="text-base font-bold">
                        {(telemetryData.mppt2.output_v * telemetryData.mppt2.output_c).toFixed(0)}W
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {telemetryData.mppt2.output_v.toFixed(1)}V × {telemetryData.mppt2.output_c.toFixed(1)}A
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">MPPT 3</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Output</div>
                      <div className="text-2xl font-bold">
                        {(telemetryData.mppt3.input_v * telemetryData.mppt3.input_c).toFixed(0)}W
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {telemetryData.mppt3.input_v.toFixed(1)}V × {telemetryData.mppt3.input_c.toFixed(1)}A
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Input</div>
                      <div className="text-base font-bold">
                        {(telemetryData.mppt3.output_v * telemetryData.mppt3.output_c).toFixed(0)}W
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {telemetryData.mppt3.output_v.toFixed(1)}V × {telemetryData.mppt3.output_c.toFixed(1)}A
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Battery Systems */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Battery className="h-5 w-5" />
                Battery Systems
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <SimpleCard
                    title="Main Battery"
                    value={telemetryData.battery.main_bat_v}
                    unit="V"
                    icon={Battery}
                    status={getBatteryStatus(telemetryData.battery.main_bat_v, "main")}
                    subtitle={`${telemetryData.battery.main_bat_c.toFixed(1)}A`}
                  />
                  <SimpleCard
                    title="Supplemental Battery"
                    value={telemetryData.battery.sup_bat_v}
                    unit="V"
                    icon={Battery}
                    status={getBatteryStatus(telemetryData.battery.sup_bat_v, "supplemental")}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Cell Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Low Cell</div>
                        <div
                          className={`font-bold ${getCellStatus(telemetryData.battery.low_cell_v, telemetryData.battery.high_cell_v, telemetryData.battery.high_cell_t) === "critical" ? "text-red-600" : getCellStatus(telemetryData.battery.low_cell_v, telemetryData.battery.high_cell_v, telemetryData.battery.high_cell_t) === "warning" ? "text-yellow-600" : "text-green-600"}`}
                        >
                          {telemetryData.battery.low_cell_v.toFixed(2)}V
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Cell #{telemetryData.battery.cell_idx_low_v}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">High Cell</div>
                        <div
                          className={`font-bold ${getCellStatus(telemetryData.battery.low_cell_v, telemetryData.battery.high_cell_v, telemetryData.battery.high_cell_t) === "critical" ? "text-red-600" : getCellStatus(telemetryData.battery.low_cell_v, telemetryData.battery.high_cell_v, telemetryData.battery.high_cell_t) === "warning" ? "text-yellow-600" : "text-green-600"}`}
                        >
                          {telemetryData.battery.high_cell_v.toFixed(2)}V
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Cell #{telemetryData.battery.cell_idx_high_t}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-muted-foreground">Highest Cell Temp</div>
                        <div
                          className={`font-bold ${telemetryData.battery.high_cell_t > 45 ? "text-red-600" : telemetryData.battery.high_cell_t > 35 ? "text-yellow-600" : "text-green-600"}`}
                        >
                          {telemetryData.battery.high_cell_t.toFixed(1)}°C
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Track Flare Tab */}
          <TabsContent value="track-flare">
            <Card className="h-[calc(100vh-200px)]">
              <CardContent className="h-full p-0">
                <div className="h-full flex flex-col">
                  <div className="flex-1">
                    <MapComponent
                      location={{ lat: telemetryData.gps.latitude, lng: telemetryData.gps.longitude }}
                      satelliteCount={telemetryData.gps.num_sats}
                    />
                  </div>
                  <div className="p-4 border-t bg-background">
                    <div className="flex items-center justify-end gap-4">
                      <Badge variant="outline" className="text-sm">
                        Speed: {telemetryData.gps.speed.toFixed(1)} mph
                      </Badge>
                      <Badge
                        variant={
                          telemetryData.gps.num_sats === 0
                            ? "destructive"
                            : telemetryData.gps.num_sats >= 4
                              ? "default"
                              : "secondary"
                        }
                      >
                        {telemetryData.gps.num_sats === 0
                          ? "No Connection"
                          : `${telemetryData.gps.num_sats} Satellites`}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

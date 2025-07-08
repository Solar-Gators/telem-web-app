import { TelemetryData } from "@/lib/types";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  generateSelectGroups,
  getValueFromPath,
  TELEMETRY_FIELD_CONFIG,
} from "@/lib/chart-config";
import {
  getCustomValue,
  calculateNetPower,
  calculateMotorPower,
  calculateTotalSolarPower,
  calculateBatteryEnergyAh,
  calculateBatterySOC,
  calculateMotorPowerConsumption,
} from "@/lib/telemetry-utils";
import { useEffect, useState } from "react";
import { ChevronDownIcon, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchTelemetryDataInRange } from "@/lib/db-utils";

// Configuration constant to enable/disable refresh interval
const ENABLE_REFRESH_INTERVAL = false;

// Helper function to convert any date to CDT (UTC-5)
function toCDT(date: Date | string): Date {
  const d = new Date(date);

  // Always subtract 1 hour regardless of environment
  let adjustedTime = new Date(d.getTime() - 1 * 60 * 60 * 1000); // subtract 1 hour

  // Check if we're in local development (not production)
  const isLocal =
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" && window.location.hostname === "localhost");

  // If local, subtract additional 4 hours to match production timezone
  if (isLocal) {
    adjustedTime = new Date(adjustedTime.getTime() - 4 * 60 * 60 * 1000); // subtract additional 4 hours
  }

  return adjustedTime;
}

// Helper function to get label from data key
function getLabelFromDataKey(dataKey: string): string {
  // Handle custom fields
  switch (dataKey) {
    case "net_power":
      return "Net Power";
    case "motor_power":
      return "Motor Power";
    case "total_solar_power":
      return "Total Solar Power";
    case "mppt_sum":
      return "Total MPPT Voltage Output";
    case "battery_energy_ah":
      return "Battery Remaining Energy (Ah)";
    case "battery_soc":
      return "Battery SOC (%)";
    case "motor_power_consumption":
      return "Motor Power Consumption";
  }

  // Convert from database format (e.g., "battery_main_bat_v") to config format (e.g., "battery.main_bat_v")
  // Find the first underscore to separate category from the rest
  const firstUnderscoreIndex = dataKey.indexOf("_");
  if (firstUnderscoreIndex === -1) {
    return dataKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  const category = dataKey.substring(0, firstUnderscoreIndex);
  const field = dataKey.substring(firstUnderscoreIndex + 1);

  if (category && field && TELEMETRY_FIELD_CONFIG[category]?.fields[field]) {
    return TELEMETRY_FIELD_CONFIG[category].fields[field];
  }

  // Fallback to formatted version of the key
  return dataKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// Generate dynamic chart config based on selected data keys
function generateChartConfig(
  selectedDataKeys: string[],
  lineColors: string[],
): ChartConfig {
  const config: ChartConfig = {};

  selectedDataKeys.forEach((key, index) => {
    config[key] = {
      label: getLabelFromDataKey(key),
      color: lineColors[index % lineColors.length],
    };
  });

  return config;
}

export default function StatsGraphTab() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [multiselectEnabled, setMultiselectEnabled] = useState(false);
  const [selectedDataKeys, setSelectedDataKeys] = useState<string[]>([
    "battery_main_bat_v",
  ]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    return new Date("2025-07-04T01:00:00");
  });
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    return new Date("2025-07-06T01:00:00");
  });

  const [lineColors] = useState([
    "#8884D8",
    "#D88884",
    "#84D888",
    "#884D88",
    "#88884D",
    "#4D8888",
  ]);

  const [minYTrim, setMinYTrim] = useState<number | undefined>(undefined);
  const [maxYTrim, setMaxYTrim] = useState<number | undefined>(undefined);

  // Validation function to check for errors
  const getValidationError = () => {
    // Validate data and dateData are not null
    if (chartData === null) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Data Error</h3>
            <p className="text-sm text-gray-600">
              Chart data is null or invalid
            </p>
          </div>
        </div>
      );
    }

    if (startDate === null || endDate === null) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Date Error</h3>
            <p className="text-sm text-gray-600">
              Date data is null or invalid
            </p>
          </div>
        </div>
      );
    }

    // Iterate through all data points and check for null values
    if (chartData.length > 0) {
      const hasNullData = chartData.some((dataPoint) => {
        if (dataPoint === null || dataPoint === undefined) {
          return true;
        }
        // Check if any selected data key has null values
        return selectedDataKeys.some((key) => {
          const value = dataPoint[key];
          return value === null;
        });
      });

      if (hasNullData) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600">Data Error</h3>
              <p className="text-sm text-gray-600">
                Some data points contain null values
              </p>
            </div>
          </div>
        );
      }
    }

    return null;
  };

  const selectGroups = generateSelectGroups();

  // CSV Export function
  const exportToCSV = () => {
    if (filteredChartData.length === 0) {
      return;
    }

    // Create CSV headers
    const headers = ["timestamp", ...selectedDataKeys];
    const csvHeaders = headers
      .map((header) =>
        header === "timestamp" ? "Timestamp" : getLabelFromDataKey(header),
      )
      .join(",");

    // Create CSV rows
    const csvRows = filteredChartData.map((dataPoint) => {
      return headers
        .map((header) => {
          if (header === "timestamp") {
            const date = new Date(dataPoint.timestamp);
            return `"${date.toLocaleString()}"`;
          }
          const value = dataPoint[header];
          return value !== undefined && value !== null ? value : "";
        })
        .join(",");
    });

    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    // Generate filename with date range
    const startStr =
      startDate?.toLocaleDateString().replace(/\//g, "-") || "start";
    const endStr = endDate?.toLocaleDateString().replace(/\//g, "-") || "end";
    link.setAttribute(
      "download",
      `telemetry-data-${startStr}-to-${endStr}.csv`,
    );

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleValueChange = (values: string[]) => {
    setSelectedDataKeys(values.map((v) => v.replace(".", "_")));
  };

  useEffect(() => {
    if (selectedDataKeys.length > 0 && startDate && endDate) {
      // Check if any custom fields are selected
      const customFields = selectedDataKeys.filter(
        (
          key,
        ): key is
          | "net_power"
          | "motor_power"
          | "total_solar_power"
          | "mppt_sum"
          | "battery_energy_ah"
          | "battery_soc"
          | "motor_power_consumption" =>
          key === "net_power" ||
          key === "motor_power" ||
          key === "total_solar_power" ||
          key === "mppt_sum" ||
          key === "battery_energy_ah" ||
          key === "battery_soc" ||
          key === "motor_power_consumption",
      );
      const regularFields = selectedDataKeys.filter(
        (key) =>
          ![
            "net_power",
            "motor_power",
            "total_solar_power",
            "mppt_sum",
            "battery_energy_ah",
            "battery_soc",
            "motor_power_consumption",
          ].includes(key),
      );

      if (customFields.length > 0) {
        // If custom fields are selected, fetch all telemetry data
        fetchTelemetryDataInRange(startDate, endDate).then((allData) => {
          if (!allData || !Array.isArray(allData)) return;

          const processedData = (allData as TelemetryData<number>[])
            .map((dataPoint: any) => {
              const result: any = {
                timestamp: toCDT(
                  dataPoint.created_at || dataPoint.gps?.rx_time || new Date(),
                ),
              };

              // Add regular fields
              regularFields.forEach((field) => {
                const firstUnderscore = field.indexOf("_");
                if (firstUnderscore !== -1) {
                  const category = field.substring(0, firstUnderscore);
                  const fieldName = field.substring(firstUnderscore + 1);
                  const value = getValueFromPath(
                    dataPoint,
                    `${category}.${fieldName}`,
                  );
                  if (value !== undefined) {
                    result[field] = value;
                  }
                }
              });

              // Calculate custom fields
              customFields.forEach((field) => {
                switch (field) {
                  case "net_power":
                    result[field] = calculateNetPower(dataPoint);
                    break;
                  case "motor_power":
                    result[field] = calculateMotorPower(dataPoint);
                    break;
                  case "total_solar_power":
                    result[field] = calculateTotalSolarPower(dataPoint);
                    break;
                  case "mppt_sum":
                    result[field] =
                      dataPoint.mppt1.output_v +
                      dataPoint.mppt2.output_v +
                      dataPoint.mppt3.output_v;
                    break;
                  case "net_power":
                    // Calculate battery power: voltage * current
                    // Only include if both voltage and current are non-zero
                    const voltage = dataPoint.battery?.main_bat_v;
                    const current = dataPoint.battery?.main_bat_c;
                    if (voltage && current) {
                      result[field] = voltage * current;
                    } else {
                      result[field] = 0;
                    }
                    break;
                  case "battery_energy_ah":
                    result[field] = calculateBatteryEnergyAh(dataPoint);
                    break;
                  case "battery_soc":
                    result[field] = calculateBatterySOC(dataPoint);
                    break;
                  case "motor_power_consumption":
                    const motorPowerConsumption =
                      calculateMotorPowerConsumption(dataPoint);
                    result[field] = motorPowerConsumption;
                    break;
                }
              });

              return result;
            })
            .filter((dataPoint) => {
              // Filter out data points where any selected custom field has a value of 0 or null
              return !customFields.some(
                (field) => dataPoint[field] === 0 || dataPoint[field] === null,
              );
            });

          setChartData(processedData);
        });
      } else {
        // If no custom fields, use the original approach
        Promise.all(
          selectedDataKeys.map((key) =>
            fetchTelemetryDataInRange(startDate, endDate, key).then((data) => ({
              key,
              data,
            })),
          ),
        ).then((results) => {
          const mergedData: { [timestamp: string]: any } = {};
          results.forEach(({ key, data }) => {
            data?.forEach((point: any) => {
              const cdtTimestamp = toCDT(point.timestamp);
              const ts = cdtTimestamp.toISOString();
              if (!mergedData[ts]) mergedData[ts] = { timestamp: cdtTimestamp };
              mergedData[ts][key] = point.value;
            });
          });
          const mergedArray = Object.values(mergedData).sort(
            (a: any, b: any) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );
          setChartData(mergedArray);
        });
      }
    }
  }, [selectedDataKeys, startDate, endDate]);

  useEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    // Only set up refresh interval if enabled
    if (!ENABLE_REFRESH_INTERVAL) {
      return;
    }

    const interval = setInterval(() => {
      if (selectedDataKeys.length > 0 && startDate && endDate) {
        // Check if any custom fields are selected
        const customFields = selectedDataKeys.filter(
          (
            key,
          ): key is
            | "net_power"
            | "motor_power"
            | "total_solar_power"
            | "mppt_sum"
            | "battery_energy_ah"
            | "battery_soc"
            | "motor_power_consumption" =>
            key === "net_power" ||
            key === "motor_power" ||
            key === "total_solar_power" ||
            key === "mppt_sum" ||
            key === "battery_energy_ah" ||
            key === "battery_soc" ||
            key === "motor_power_consumption",
        );
        const regularFields = selectedDataKeys.filter(
          (key) =>
            ![
              "net_power",
              "motor_power",
              "total_solar_power",
              "mppt_sum",
              "battery_energy_ah",
              "battery_soc",
              "motor_power_consumption",
            ].includes(key),
        );

        if (customFields.length > 0) {
          // If custom fields are selected, fetch all telemetry data
          fetchTelemetryDataInRange(startDate, endDate).then((allData) => {
            if (!allData || !Array.isArray(allData)) return;

            const processedData = (allData as TelemetryData<number>[])
              .map((dataPoint: any) => {
                const result: any = {
                  timestamp: toCDT(
                    dataPoint.created_at ||
                      dataPoint.gps?.rx_time ||
                      new Date(),
                  ),
                };

                // Add regular fields
                regularFields.forEach((field) => {
                  const firstUnderscore = field.indexOf("_");
                  if (firstUnderscore !== -1) {
                    const category = field.substring(0, firstUnderscore);
                    const fieldName = field.substring(firstUnderscore + 1);
                    const value = getValueFromPath(
                      dataPoint,
                      `${category}.${fieldName}`,
                    );
                    if (value !== undefined) {
                      result[field] = value;
                    }
                  }
                });

                // Calculate custom fields
                customFields.forEach((field) => {
                  switch (field) {
                    case "net_power":
                      result[field] = calculateNetPower(dataPoint);
                      break;
                    case "motor_power":
                      result[field] = calculateMotorPower(dataPoint);
                      break;
                    case "total_solar_power":
                      result[field] = calculateTotalSolarPower(dataPoint);
                      break;
                    case "mppt_sum":
                      result[field] =
                        dataPoint.mppt1.output_v +
                        dataPoint.mppt2.output_v +
                        dataPoint.mppt3.output_v;
                      break;
                    case "net_power":
                      // Calculate battery power: voltage * current
                      // Only include if both voltage and current are non-zero
                      const voltage = dataPoint.battery?.main_bat_v;
                      const current = dataPoint.battery?.main_bat_c;
                      if (voltage && current) {
                        result[field] = voltage * current;
                      } else {
                        result[field] = 0;
                      }
                      break;
                    case "battery_energy_ah":
                      result[field] = calculateBatteryEnergyAh(dataPoint);
                      break;
                    case "battery_soc":
                      result[field] = calculateBatterySOC(dataPoint);
                      break;
                    case "motor_power_consumption":
                      const motorPowerConsumption =
                        calculateMotorPowerConsumption(dataPoint);
                      result[field] = motorPowerConsumption;
                      break;
                  }
                });

                return result;
              })
              .filter((dataPoint) => {
                // Filter out data points where any selected custom field has a value of 0 or null
                return !customFields.some(
                  (field) =>
                    dataPoint[field] === 0 || dataPoint[field] === null,
                );
              });

            setChartData(processedData);
          });
        } else {
          // If no custom fields, use the original approach
          Promise.all(
            selectedDataKeys.map((key) =>
              fetchTelemetryDataInRange(startDate, endDate, key).then(
                (data) => ({
                  key,
                  data,
                }),
              ),
            ),
          ).then((results) => {
            const mergedData: { [timestamp: string]: any } = {};
            results.forEach(({ key, data }) => {
              data?.forEach((point: any) => {
                const cdtTimestamp = toCDT(point.timestamp);
                const ts = cdtTimestamp.toISOString();
                if (!mergedData[ts])
                  mergedData[ts] = { timestamp: cdtTimestamp };
                mergedData[ts][key] = point.value;
              });
            });
            const mergedArray = Object.values(mergedData).sort(
              (a: any, b: any) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
            );
            setChartData(mergedArray);
          });
        }
      }
    }, 2000);
    setRefreshInterval(interval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataKeys, startDate, endDate]);

  // Filter chart data based on Y trim values
  const filteredChartData = chartData.filter((dataPoint) => {
    // Check if any of the selected data keys have values outside the trim range
    for (const key of selectedDataKeys) {
      const value = dataPoint[key];
      if (value !== undefined && value !== null) {
        if (minYTrim !== undefined && value < minYTrim) return false;
        if (maxYTrim !== undefined && value > maxYTrim) return false;
      }
    }
    return true;
  });

  // Generate dynamic chart
  const chartConfig = generateChartConfig(selectedDataKeys, lineColors);

  // Check for validation errors and return early if any exist
  const validationError = getValidationError();
  if (validationError) {
    return validationError;
  }

  return (
    <div>
      <div className="grid place-items-center grid-cols-3 gap-4">
        <div className="flex flex-col gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-between">
                {selectedDataKeys.length > 0
                  ? multiselectEnabled
                    ? `${selectedDataKeys.length} Selected`
                    : selectedDataKeys.length === 1
                      ? getLabelFromDataKey(selectedDataKeys[0])
                      : `${selectedDataKeys.length} Selected`
                  : "Select Statistics"}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
              {selectGroups.map((group) => (
                <div key={group.label}>
                  <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {group.options.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={selectedDataKeys.includes(
                        option.value.replace(".", "_"),
                      )}
                      onCheckedChange={(checked) => {
                        const value = option.value.replace(".", "_");
                        let updatedKeys: string[];

                        if (multiselectEnabled) {
                          // Multiselect mode: add/remove from array
                          updatedKeys = checked
                            ? [...selectedDataKeys, value]
                            : selectedDataKeys.filter((key) => key !== value);
                        } else {
                          // Single select mode: replace selection
                          updatedKeys = checked ? [value] : [];
                        }

                        handleValueChange(updatedKeys);
                      }}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="multiselect"
              checked={multiselectEnabled}
              onCheckedChange={(checked) => {
                setMultiselectEnabled(checked as boolean);
                // If disabling multiselect and multiple items are selected, keep only the first one
                if (!checked && selectedDataKeys.length > 1) {
                  setSelectedDataKeys([selectedDataKeys[0]]);
                }
              }}
            />
            <label
              htmlFor="multiselect"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable Multiselect
            </label>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            <Popover open={open1} onOpenChange={setOpen1}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker"
                  className="w-32 justify-between font-normal"
                >
                  {startDate ? startDate.toLocaleDateString() : "Start Date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={startDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setStartDate(date);
                    setOpen1(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              type="time"
              id="time-picker"
              step="1"
              defaultValue="01:00:00"
              onChange={(time) => {
                startDate?.setHours(parseInt(time.target.value.split(":")[0]));
                startDate?.setMinutes(
                  parseInt(time.target.value.split(":")[1]),
                );
              }}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            <Popover open={open2} onOpenChange={setOpen2}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker"
                  className="w-32 justify-between font-normal"
                >
                  {endDate ? endDate.toLocaleDateString() : "End Date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={endDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setEndDate(date);
                    setOpen2(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              type="time"
              id="time-picker"
              step="1"
              defaultValue="01:00:00"
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
      </div>

      {/* Y-Axis Trim Controls and Export */}
      <div className="grid place-items-center grid-cols-3 gap-4 mt-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="min-y-trim" className="text-sm font-medium">
            Min Y Value
          </label>
          <Input
            id="min-y-trim"
            type="number"
            placeholder="No minimum"
            value={minYTrim ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setMinYTrim(value === "" ? undefined : parseFloat(value));
            }}
            className="w-32"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="max-y-trim" className="text-sm font-medium">
            Max Y Value
          </label>
          <Input
            id="max-y-trim"
            type="number"
            placeholder="No maximum"
            value={maxYTrim ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setMaxYTrim(value === "" ? undefined : parseFloat(value));
            }}
            className="w-32"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Export Data</label>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-32"
                disabled={filteredChartData.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="z-50">
              <AlertDialogHeader>
                <AlertDialogTitle>Export Telemetry Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This will download a CSV file containing{" "}
                  {filteredChartData.length} data points for the selected fields
                  from {startDate?.toLocaleDateString()} to{" "}
                  {endDate?.toLocaleDateString()}.
                  {selectedDataKeys.length > 0 && (
                    <span className="block mt-2">
                      <strong>Selected fields:</strong>{" "}
                      {selectedDataKeys
                        .map((key) => getLabelFromDataKey(key))
                        .join(", ")}
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={exportToCSV}>
                  Download CSV
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <br></br>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={filteredChartData}
          margin={{
            left: 12,
            right: 12,
            top: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: Date) => {
              const date = value instanceof Date ? value : new Date(value);
              return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickCount={5}
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) =>
              Number.parseFloat(value.toFixed(1)).toString()
            }
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  // Get the timestamp from the payload data
                  if (payload && payload.length > 0 && payload[0].payload) {
                    const timestamp = payload[0].payload.timestamp;
                    try {
                      const date = new Date(timestamp);
                      if (!isNaN(date.getTime())) {
                        return date.toLocaleString();
                      }
                    } catch (error) {
                      console.error("Error parsing timestamp:", error);
                    }
                  }
                  return String(value);
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {selectedDataKeys.map((key) => {
            return (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={lineColors[selectedDataKeys.indexOf(key) % 6]}
                strokeWidth={2}
                isAnimationActive={false}
                dot={false}
              />
            );
          })}
        </LineChart>
      </ChartContainer>
    </div>
  );
}

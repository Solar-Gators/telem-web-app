import { TelemetryData, StatusType } from "./types";

export const telemetryFields = [
  "gps_rx_time",
  "gps_longitude",
  "gps_latitude",
  "gps_speed",
  "gps_num_sats",
  "battery_sup_bat_v",
  "battery_main_bat_v",
  "battery_main_bat_c",
  "battery_low_cell_v",
  "battery_high_cell_v",
  "battery_high_cell_t",
  "battery_cell_idx_low_v",
  "battery_cell_idx_high_t",
  "mppt1_input_v",
  "mppt1_input_c",
  "mppt1_output_v",
  "mppt1_output_c",
  "mppt2_input_v",
  "mppt2_input_c",
  "mppt2_output_v",
  "mppt2_output_c",
  "mppt3_input_v",
  "mppt3_input_c",
  "mppt3_output_v",
  "mppt3_output_c",
  "mitsuba_voltage",
  "mitsuba_current",
];

export function mapTelemetryData<T>(data: any): TelemetryData<T> {
  return {
    gps: {
      rx_time: data.gps_rx_time,
      longitude: data.gps_longitude,
      latitude: data.gps_latitude,
      speed: data.gps_speed,
      num_sats: data.gps_num_sats,
    },
    battery: {
      sup_bat_v: data.battery_sup_bat_v,
      main_bat_v: data.battery_main_bat_v,
      main_bat_c: data.battery_main_bat_c,
      low_cell_v: data.battery_low_cell_v,
      high_cell_v: data.battery_high_cell_v,
      high_cell_t: data.battery_high_cell_t,
      cell_idx_low_v: data.battery_cell_idx_low_v,
      cell_idx_high_t: data.battery_cell_idx_high_t,
    },
    mppt1: {
      input_v: data.mppt1_input_v,
      input_c: data.mppt1_input_c,
      output_v: data.mppt1_output_v,
      output_c: data.mppt1_output_c,
    },
    mppt2: {
      input_v: data.mppt2_input_v,
      input_c: data.mppt2_input_c,
      output_v: data.mppt2_output_v,
      output_c: data.mppt2_output_c,
    },
    mppt3: {
      input_v: data.mppt3_input_v,
      input_c: data.mppt3_input_c,
      output_v: data.mppt3_output_v,
      output_c: data.mppt3_output_c,
    },
    mitsuba: {
      voltage: data.mitsuba_voltage,
      current: data.mitsuba_current,
    },
  };
}

export function getSpeedStatus(
  data: TelemetryData<number>,
): StatusType | undefined {
  if (!data.gps || data.gps.speed === undefined) return;

  return data.gps.speed > 0 ? "good" : "warning";
}

export function getNetPowerStatus(
  data: TelemetryData<number>,
): StatusType | undefined {
  const netPower = calculateNetPower(data);
  return netPower > 0 ? "good" : "critical";
}

export function getMotorStatus(
  data: TelemetryData<number>,
): StatusType | undefined {
  if (!data.mitsuba || data.mitsuba.current === undefined) return;

  return data.mitsuba.current > 0 ? "good" : "warning";
}

export function calculateNetPower(data: TelemetryData<number>): number {
  const solarPower = calculateTotalSolarPower(data);
  const motorPower = calculateMotorPower(data);
  return (solarPower ?? 0) - motorPower;
}

export function calculateMotorPower(data: TelemetryData<number>): number {
  if (
    !data.mitsuba ||
    data.mitsuba.voltage === undefined ||
    data.mitsuba.current === undefined
  )
    return 0;

  return data.mitsuba.voltage * data.mitsuba.current;
}

export function calculateTotalSolarPower(
  data: TelemetryData<number>,
): number | null {
  if (
    !data.mppt1 ||
    !data.mppt1.output_v ||
    !data.mppt1.output_c ||
    !data.mppt2 ||
    !data.mppt2.output_v ||
    !data.mppt2.output_c ||
    !data.mppt3 ||
    !data.mppt3.output_v ||
    !data.mppt3.output_c
  ) {
    return null;
  }

  return (
    data.mppt1.output_v * data.mppt1.output_c +
    data.mppt2.output_v * data.mppt2.output_c +
    data.mppt3.output_v * data.mppt3.output_c
  );
}

export function calculateAverageSolarVoltage(
  data: TelemetryData<number>,
): number {
  if (!data.mppt1?.input_v || !data.mppt2?.input_v || !data.mppt3?.input_v) {
    return 0;
  }
  return (data.mppt1.input_v + data.mppt2.input_v + data.mppt3.input_v) / 3;
}

export function calculateTotalSolarCurrent(
  data: TelemetryData<number>,
): number {
  if (!data.mppt1?.input_c || !data.mppt2?.input_c || !data.mppt3?.input_c) {
    return 0;
  }
  return data.mppt1.input_c + data.mppt2.input_c + data.mppt3.input_c;
}

export function calculateMPPTPower(voltage: number, current: number): number {
  return voltage * current;
}

export function getBatteryStatus(
  voltage: number,
  type: string,
): StatusType | undefined {
  const lowVoltageThreshold = 3.0; // Example threshold
  const highVoltageThreshold = 4.2; // Example threshold

  if (voltage < lowVoltageThreshold) {
    return "critical";
  } else if (voltage > highVoltageThreshold) {
    return "warning";
  } else {
    return "good";
  }
}

export function getCellStatus(cellVoltage: number): StatusType | undefined {
  const lowVoltageThreshold = 3.0; // Example threshold
  const highVoltageThreshold = 4.2; // Example threshold

  if (cellVoltage < lowVoltageThreshold) {
    return "critical";
  } else if (cellVoltage > highVoltageThreshold) {
    return "warning";
  } else {
    return "good";
  }
}

export function calculateStateOfCharge(data: TelemetryData<number>): number {
  // Simplified SOC calculation based on voltage
  // This is a placeholder - actual SOC calculation would be more complex
  const nominalVoltage = 48; // Example nominal battery voltage
  if (!data.battery || data.battery.main_bat_v === undefined) return 0;
  return Math.min(
    100,
    Math.max(0, (data.battery.main_bat_v / nominalVoltage) * 100),
  );
}

// Battery voltage to Ah curve data
const VOLTAGE_TO_AH_DATA = [
  { voltage: 4.140895514, ah: 0.33125 },
  { voltage: 4.133148475, ah: 0.340036323 },
  { voltage: 4.126064567, ah: 0.348822645 },
  { voltage: 4.119602888, ah: 0.357608968 },
  { voltage: 4.113722536, ah: 0.366395291 },
  { voltage: 4.108382608, ah: 0.375181613 },
  { voltage: 4.103542202, ah: 0.383967936 },
  { voltage: 4.099160416, ah: 0.392754259 },
  { voltage: 4.095196346, ah: 0.401540581 },
  { voltage: 4.091609092, ah: 0.410326904 },
  { voltage: 4.088357751, ah: 0.419113226 },
  { voltage: 4.085401419, ah: 0.427899549 },
  { voltage: 4.082699195, ah: 0.436685872 },
  { voltage: 4.080210177, ah: 0.445472194 },
  { voltage: 4.077893462, ah: 0.454258517 },
  { voltage: 4.075708148, ah: 0.46304484 },
  { voltage: 4.073613626, ah: 0.471831162 },
  { voltage: 4.071584914, ah: 0.480617485 },
  { voltage: 4.06962016, ah: 0.489403808 },
  { voltage: 4.067719374, ah: 0.49819013 },
  { voltage: 4.065882569, ah: 0.506976453 },
  { voltage: 4.064109759, ah: 0.515762776 },
  { voltage: 4.062400955, ah: 0.524549098 },
  { voltage: 4.06075617, ah: 0.533335421 },
  { voltage: 4.059175416, ah: 0.542121743 },
  { voltage: 4.057658707, ah: 0.550908066 },
  { voltage: 4.056206054, ah: 0.559694389 },
  { voltage: 4.05481747, ah: 0.568480711 },
  { voltage: 4.053492968, ah: 0.577267034 },
  { voltage: 4.052232559, ah: 0.586053357 },
  { voltage: 4.051036257, ah: 0.594839679 },
  { voltage: 4.049904075, ah: 0.603626002 },
  { voltage: 4.048835825, ah: 0.612412325 },
  { voltage: 4.047829281, ah: 0.621198647 },
  { voltage: 4.046881016, ah: 0.62998497 },
  { voltage: 4.045987589, ah: 0.638771293 },
  { voltage: 4.045145556, ah: 0.647557615 },
  { voltage: 4.044351477, ah: 0.656343938 },
  { voltage: 4.043601909, ah: 0.665130261 },
  { voltage: 4.042893411, ah: 0.673916583 },
  { voltage: 4.042222539, ah: 0.682702906 },
  { voltage: 4.041585853, ah: 0.691489228 },
  { voltage: 4.04097991, ah: 0.700275551 },
  { voltage: 4.040401268, ah: 0.709061874 },
  { voltage: 4.039846486, ah: 0.717848196 },
  { voltage: 4.03931212, ah: 0.726634519 },
  { voltage: 4.03879473, ah: 0.735420842 },
  { voltage: 4.038290873, ah: 0.744207164 },
  { voltage: 4.037797107, ah: 0.752993487 },
  { voltage: 4.03730999, ah: 0.76177981 },
  { voltage: 4.03682608, ah: 0.770566132 },
  { voltage: 4.036341936, ah: 0.779352455 },
  { voltage: 4.035854114, ah: 0.788138778 },
  { voltage: 4.035359174, ah: 0.7969251 },
  { voltage: 4.034853673, ah: 0.805711423 },
  { voltage: 4.034334169, ah: 0.814497745 },
  { voltage: 4.03379722, ah: 0.823284068 },
  { voltage: 4.033239384, ah: 0.832070391 },
  { voltage: 4.032657219, ah: 0.840856713 },
  { voltage: 4.032047284, ah: 0.849643036 },
  { voltage: 4.031406135, ah: 0.858429359 },
  { voltage: 4.030730332, ah: 0.867215681 },
  { voltage: 4.030016431, ah: 0.876002004 },
  { voltage: 4.029261024, ah: 0.884788327 },
  { voltage: 4.028461917, ah: 0.893574649 },
  { voltage: 4.02761849, ah: 0.902360972 },
  { voltage: 4.026730226, ah: 0.911147295 },
  { voltage: 4.025796606, ah: 0.919933617 },
  { voltage: 4.024817115, ah: 0.92871994 },
  { voltage: 4.023791234, ah: 0.937506263 },
  { voltage: 4.022718447, ah: 0.946292585 },
  { voltage: 4.021598236, ah: 0.955078908 },
  { voltage: 4.020430084, ah: 0.96386523 },
  { voltage: 4.019213474, ah: 0.972651553 },
  { voltage: 4.017947889, ah: 0.981437876 },
  { voltage: 4.01663281, ah: 0.990224198 },
  { voltage: 4.015267722, ah: 0.999010521 },
  { voltage: 4.013852107, ah: 1.007796844 },
  { voltage: 4.012385448, ah: 1.016583166 },
  { voltage: 4.010867226, ah: 1.025369489 },
  { voltage: 4.009296926, ah: 1.034155812 },
  { voltage: 4.00767403, ah: 1.042942134 },
  { voltage: 4.005998021, ah: 1.051728457 },
  { voltage: 4.004268381, ah: 1.06051478 },
  { voltage: 4.002484593, ah: 1.069301102 },
  { voltage: 4.00064614, ah: 1.078087425 },
  { voltage: 3.998752505, ah: 1.086873747 },
  { voltage: 3.99680317, ah: 1.09566007 },
  { voltage: 3.994797619, ah: 1.104446393 },
  { voltage: 3.992735334, ah: 1.113232715 },
  { voltage: 3.990615798, ah: 1.122019038 },
  { voltage: 3.988438493, ah: 1.130805361 },
  { voltage: 3.986202902, ah: 1.139591683 },
  { voltage: 3.983908509, ah: 1.148378006 },
  { voltage: 3.981554796, ah: 1.157164329 },
  { voltage: 3.97914219, ah: 1.165950651 },
  { voltage: 3.976673881, ah: 1.174736974 },
  { voltage: 3.974153565, ah: 1.183523297 },
  { voltage: 3.97158494, ah: 1.192309619 },
  { voltage: 3.9689717, ah: 1.201095942 },
  { voltage: 3.966317543, ah: 1.209882265 },
  { voltage: 3.963626164, ah: 1.218668587 },
  { voltage: 3.96090126, ah: 1.22745491 },
  { voltage: 3.958146527, ah: 1.236241232 },
  { voltage: 3.955365661, ah: 1.245027555 },
  { voltage: 3.952562359, ah: 1.253813878 },
  { voltage: 3.949740317, ah: 1.2626002 },
  { voltage: 3.94690323, ah: 1.271386523 },
  { voltage: 3.944054796, ah: 1.280172846 },
  { voltage: 3.94119871, ah: 1.288959168 },
  { voltage: 3.938338669, ah: 1.297745491 },
  { voltage: 3.935478369, ah: 1.306531814 },
  { voltage: 3.932621506, ah: 1.315318136 },
  { voltage: 3.929771777, ah: 1.324104459 },
  { voltage: 3.926932877, ah: 1.332890782 },
  { voltage: 3.924108503, ah: 1.341677104 },
  { voltage: 3.921302352, ah: 1.350463427 },
  { voltage: 3.918518119, ah: 1.359249749 },
  { voltage: 3.9157595, ah: 1.368036072 },
  { voltage: 3.913030192, ah: 1.376822395 },
  { voltage: 3.910333891, ah: 1.385608717 },
  { voltage: 3.907674294, ah: 1.39439504 },
  { voltage: 3.905055096, ah: 1.403181363 },
  { voltage: 3.902479995, ah: 1.411967685 },
  { voltage: 3.899952685, ah: 1.420754008 },
  { voltage: 3.897476859, ah: 1.429540331 },
  { voltage: 3.895054763, ah: 1.438326653 },
  { voltage: 3.892685036, ah: 1.447112976 },
  { voltage: 3.890365766, ah: 1.455899299 },
  { voltage: 3.888095042, ah: 1.464685621 },
  { voltage: 3.88587095, ah: 1.473471944 },
  { voltage: 3.88369158, ah: 1.482258267 },
  { voltage: 3.881555018, ah: 1.491044589 },
  { voltage: 3.879459354, ah: 1.499830912 },
  { voltage: 3.877402675, ah: 1.508617234 },
  { voltage: 3.875383069, ah: 1.517403557 },
  { voltage: 3.873398624, ah: 1.52618988 },
  { voltage: 3.871447428, ah: 1.534976202 },
  { voltage: 3.869527568, ah: 1.543762525 },
  { voltage: 3.867637134, ah: 1.552548848 },
  { voltage: 3.865774213, ah: 1.56133517 },
  { voltage: 3.863936893, ah: 1.570121493 },
  { voltage: 3.862123262, ah: 1.578907816 },
  { voltage: 3.860331408, ah: 1.587694138 },
  { voltage: 3.858559419, ah: 1.596480461 },
  { voltage: 3.856805383, ah: 1.605266784 },
  { voltage: 3.855067388, ah: 1.614053106 },
  { voltage: 3.853343522, ah: 1.622839429 },
  { voltage: 3.851631872, ah: 1.631625752 },
  { voltage: 3.849930528, ah: 1.640412074 },
  { voltage: 3.848237577, ah: 1.649198397 },
  { voltage: 3.846551106, ah: 1.657984719 },
  { voltage: 3.844869204, ah: 1.666771042 },
  { voltage: 3.843189959, ah: 1.675557365 },
  { voltage: 3.841511459, ah: 1.684343687 },
  { voltage: 3.839831792, ah: 1.69313001 },
  { voltage: 3.838149046, ah: 1.701916333 },
  { voltage: 3.836461437, ah: 1.710702655 },
  { voltage: 3.834767957, ah: 1.719488978 },
  { voltage: 3.833067891, ah: 1.728275301 },
  { voltage: 3.831360525, ah: 1.737061623 },
  { voltage: 3.829645143, ah: 1.745847946 },
  { voltage: 3.82792103, ah: 1.754634269 },
  { voltage: 3.826187471, ah: 1.763420591 },
  { voltage: 3.824443751, ah: 1.772206914 },
  { voltage: 3.822689156, ah: 1.780993236 },
  { voltage: 3.82092297, ah: 1.789779559 },
  { voltage: 3.819144478, ah: 1.798565882 },
  { voltage: 3.817352966, ah: 1.807352204 },
  { voltage: 3.815547718, ah: 1.816138527 },
  { voltage: 3.813728019, ah: 1.82492485 },
  { voltage: 3.811893155, ah: 1.833711172 },
  { voltage: 3.810042409, ah: 1.842497495 },
  { voltage: 3.808175069, ah: 1.851283818 },
  { voltage: 3.806290417, ah: 1.86007014 },
  { voltage: 3.80438774, ah: 1.868856463 },
  { voltage: 3.802466322, ah: 1.877642786 },
  { voltage: 3.800525449, ah: 1.886429108 },
  { voltage: 3.798564405, ah: 1.895215431 },
  { voltage: 3.796582476, ah: 1.904001754 },
  { voltage: 3.794578946, ah: 1.912788076 },
  { voltage: 3.7925531, ah: 1.921574399 },
  { voltage: 3.790504224, ah: 1.930360721 },
  { voltage: 3.788431602, ah: 1.939147044 },
  { voltage: 3.78633452, ah: 1.947933367 },
  { voltage: 3.784212262, ah: 1.956719689 },
  { voltage: 3.782064114, ah: 1.965506012 },
  { voltage: 3.77988936, ah: 1.974292335 },
  { voltage: 3.77768736, ah: 1.983078657 },
  { voltage: 3.775458777, ah: 1.99186498 },
  { voltage: 3.773205374, ah: 2.000651303 },
  { voltage: 3.770928948, ah: 2.009437625 },
  { voltage: 3.768631299, ah: 2.018223948 },
  { voltage: 3.766314223, ah: 2.027010271 },
  { voltage: 3.76397952, ah: 2.035796593 },
  { voltage: 3.761628988, ah: 2.044582916 },
  { voltage: 3.759264424, ah: 2.053369238 },
  { voltage: 3.756887627, ah: 2.062155561 },
  { voltage: 3.754500395, ah: 2.070941884 },
  { voltage: 3.752104526, ah: 2.079728206 },
  { voltage: 3.749701819, ah: 2.088514529 },
  { voltage: 3.747294072, ah: 2.097300852 },
  { voltage: 3.744883083, ah: 2.106087174 },
  { voltage: 3.742470649, ah: 2.114873497 },
  { voltage: 3.74005857, ah: 2.12365982 },
  { voltage: 3.737648643, ah: 2.132446142 },
  { voltage: 3.735242667, ah: 2.141232465 },
  { voltage: 3.732842439, ah: 2.150018788 },
  { voltage: 3.730449758, ah: 2.15880511 },
  { voltage: 3.728066423, ah: 2.167591433 },
  { voltage: 3.725694231, ah: 2.176377756 },
  { voltage: 3.72333498, ah: 2.185164078 },
  { voltage: 3.72099047, ah: 2.193950401 },
  { voltage: 3.718662497, ah: 2.202736723 },
  { voltage: 3.71635286, ah: 2.211523046 },
  { voltage: 3.714063357, ah: 2.220309369 },
  { voltage: 3.711795787, ah: 2.229095691 },
  { voltage: 3.709551947, ah: 2.237882014 },
  { voltage: 3.707333637, ah: 2.246668337 },
  { voltage: 3.705142643, ah: 2.255454659 },
  { voltage: 3.702979699, ah: 2.264240982 },
  { voltage: 3.700843571, ah: 2.273027305 },
  { voltage: 3.698732811, ah: 2.281813627 },
  { voltage: 3.69664597, ah: 2.29059995 },
  { voltage: 3.694581602, ah: 2.299386273 },
  { voltage: 3.692538256, ah: 2.308172595 },
  { voltage: 3.690514485, ah: 2.316958918 },
  { voltage: 3.688508841, ah: 2.32574524 },
  { voltage: 3.686519875, ah: 2.334531563 },
  { voltage: 3.684546139, ah: 2.343317886 },
  { voltage: 3.682586185, ah: 2.352104208 },
  { voltage: 3.680638565, ah: 2.360890531 },
  { voltage: 3.678701831, ah: 2.369676854 },
  { voltage: 3.676774533, ah: 2.378463176 },
  { voltage: 3.674855224, ah: 2.387249499 },
  { voltage: 3.672942457, ah: 2.396035822 },
  { voltage: 3.671034781, ah: 2.404822144 },
  { voltage: 3.66913075, ah: 2.413608467 },
  { voltage: 3.667228914, ah: 2.42239479 },
  { voltage: 3.665327826, ah: 2.431181112 },
  { voltage: 3.663426038, ah: 2.439967435 },
  { voltage: 3.6615221, ah: 2.448753758 },
  { voltage: 3.659614566, ah: 2.45754008 },
  { voltage: 3.657701986, ah: 2.466326403 },
  { voltage: 3.655782913, ah: 2.475112725 },
  { voltage: 3.653855898, ah: 2.483899048 },
  { voltage: 3.651919492, ah: 2.492685371 },
  { voltage: 3.649972249, ah: 2.501471693 },
  { voltage: 3.648012719, ah: 2.510258016 },
  { voltage: 3.646039453, ah: 2.519044339 },
  { voltage: 3.644051021, ah: 2.527830661 },
  { voltage: 3.642047042, ah: 2.536616984 },
  { voltage: 3.640028814, ah: 2.545403307 },
  { voltage: 3.637997788, ah: 2.554189629 },
  { voltage: 3.635955413, ah: 2.562975952 },
  { voltage: 3.633903138, ah: 2.571762275 },
  { voltage: 3.631842414, ah: 2.580548597 },
  { voltage: 3.629774689, ah: 2.58933492 },
  { voltage: 3.627701414, ah: 2.598121242 },
  { voltage: 3.625624037, ah: 2.606907565 },
  { voltage: 3.623544009, ah: 2.615693888 },
  { voltage: 3.62146278, ah: 2.62448021 },
  { voltage: 3.619381797, ah: 2.633266533 },
  { voltage: 3.617302512, ah: 2.642052856 },
  { voltage: 3.615226374, ah: 2.650839178 },
  { voltage: 3.613154833, ah: 2.659625501 },
  { voltage: 3.611089337, ah: 2.668411824 },
  { voltage: 3.609031337, ah: 2.677198146 },
  { voltage: 3.606982282, ah: 2.685984469 },
  { voltage: 3.604943622, ah: 2.694770792 },
  { voltage: 3.602916806, ah: 2.703557114 },
  { voltage: 3.600903285, ah: 2.712343437 },
  { voltage: 3.598904507, ah: 2.72112976 },
  { voltage: 3.596921921, ah: 2.729916082 },
  { voltage: 3.594956979, ah: 2.738702405 },
  { voltage: 3.593011129, ah: 2.747488727 },
  { voltage: 3.591085821, ah: 2.75627505 },
  { voltage: 3.589182504, ah: 2.765061373 },
  { voltage: 3.587302628, ah: 2.773847695 },
  { voltage: 3.585447643, ah: 2.782634018 },
  { voltage: 3.583618998, ah: 2.791420341 },
  { voltage: 3.581818143, ah: 2.800206663 },
  { voltage: 3.580045997, ah: 2.808992986 },
  { voltage: 3.5783015, ah: 2.817779309 },
  { voltage: 3.576583131, ah: 2.826565631 },
  { voltage: 3.574889372, ah: 2.835351954 },
  { voltage: 3.573218701, ah: 2.844138277 },
  { voltage: 3.571569597, ah: 2.852924599 },
  { voltage: 3.569940542, ah: 2.861710922 },
  { voltage: 3.568330014, ah: 2.870497244 },
  { voltage: 3.566736493, ah: 2.879283567 },
  { voltage: 3.565158459, ah: 2.88806989 },
  { voltage: 3.563594392, ah: 2.896856212 },
  { voltage: 3.562042771, ah: 2.905642535 },
  { voltage: 3.560502076, ah: 2.914428858 },
  { voltage: 3.558970786, ah: 2.92321518 },
  { voltage: 3.557447382, ah: 2.932001503 },
  { voltage: 3.555930343, ah: 2.940787826 },
  { voltage: 3.554418149, ah: 2.949574148 },
  { voltage: 3.552909279, ah: 2.958360471 },
  { voltage: 3.551402213, ah: 2.967146794 },
  { voltage: 3.549895432, ah: 2.975933116 },
  { voltage: 3.548387414, ah: 2.984719439 },
  { voltage: 3.546876639, ah: 2.993505762 },
  { voltage: 3.545361587, ah: 3.002292084 },
  { voltage: 3.543840738, ah: 3.011078407 },
  { voltage: 3.542312571, ah: 3.019864729 },
  { voltage: 3.540775566, ah: 3.028651052 },
  { voltage: 3.539228204, ah: 3.037437375 },
  { voltage: 3.537668962, ah: 3.046223697 },
  { voltage: 3.536096322, ah: 3.05501002 },
  { voltage: 3.534508763, ah: 3.063796343 },
  { voltage: 3.532904764, ah: 3.072582665 },
  { voltage: 3.531282937, ah: 3.081368988 },
  { voltage: 3.529643138, ah: 3.090155311 },
  { voltage: 3.527985909, ah: 3.098941633 },
  { voltage: 3.526311799, ah: 3.107727956 },
  { voltage: 3.524621358, ah: 3.116514279 },
  { voltage: 3.522915136, ah: 3.125300601 },
  { voltage: 3.521193682, ah: 3.134086924 },
  { voltage: 3.519457545, ah: 3.142873246 },
  { voltage: 3.517707276, ah: 3.151659569 },
  { voltage: 3.515943423, ah: 3.160445892 },
  { voltage: 3.514166536, ah: 3.169232214 },
  { voltage: 3.512377166, ah: 3.178018537 },
  { voltage: 3.510575861, ah: 3.18680486 },
  { voltage: 3.50876317, ah: 3.195591182 },
  { voltage: 3.506939644, ah: 3.204377505 },
  { voltage: 3.505105832, ah: 3.213163828 },
  { voltage: 3.503262283, ah: 3.22195015 },
  { voltage: 3.501409548, ah: 3.230736473 },
  { voltage: 3.499548175, ah: 3.239522796 },
  { voltage: 3.497678714, ah: 3.248309118 },
  { voltage: 3.495801715, ah: 3.257095441 },
  { voltage: 3.493917727, ah: 3.265881764 },
  { voltage: 3.4920273, ah: 3.274668086 },
  { voltage: 3.490130983, ah: 3.283454409 },
  { voltage: 3.488229326, ah: 3.292240731 },
  { voltage: 3.486322878, ah: 3.301027054 },
  { voltage: 3.484412189, ah: 3.309813377 },
  { voltage: 3.482497808, ah: 3.318599699 },
  { voltage: 3.480580286, ah: 3.327386022 },
  { voltage: 3.478660171, ah: 3.336172345 },
  { voltage: 3.476738013, ah: 3.344958667 },
  { voltage: 3.474814341, ah: 3.35374499 },
  { voltage: 3.472888974, ah: 3.362531313 },
  { voltage: 3.470960877, ah: 3.371317635 },
  { voltage: 3.46902896, ah: 3.380103958 },
  { voltage: 3.467092134, ah: 3.388890281 },
  { voltage: 3.465149311, ah: 3.397676603 },
  { voltage: 3.463199402, ah: 3.406462926 },
  { voltage: 3.461241318, ah: 3.415249248 },
  { voltage: 3.45927397, ah: 3.424035571 },
  { voltage: 3.457296269, ah: 3.432821894 },
  { voltage: 3.455307127, ah: 3.441608216 },
  { voltage: 3.453305454, ah: 3.450394539 },
  { voltage: 3.451290162, ah: 3.459180862 },
  { voltage: 3.449260163, ah: 3.467967184 },
  { voltage: 3.447214367, ah: 3.476753507 },
  { voltage: 3.445151685, ah: 3.48553983 },
  { voltage: 3.443071029, ah: 3.494326152 },
  { voltage: 3.44097131, ah: 3.503112475 },
  { voltage: 3.438851438, ah: 3.511898798 },
  { voltage: 3.436710326, ah: 3.52068512 },
  { voltage: 3.434546885, ah: 3.529471443 },
  { voltage: 3.432360025, ah: 3.538257766 },
  { voltage: 3.430148658, ah: 3.547044088 },
  { voltage: 3.427911695, ah: 3.555830411 },
  { voltage: 3.425648047, ah: 3.564616733 },
  { voltage: 3.423356626, ah: 3.573403056 },
  { voltage: 3.421036342, ah: 3.582189379 },
  { voltage: 3.418686106, ah: 3.590975701 },
  { voltage: 3.416304831, ah: 3.599762024 },
  { voltage: 3.413891427, ah: 3.608548347 },
  { voltage: 3.411444805, ah: 3.617334669 },
  { voltage: 3.408963961, ah: 3.626120992 },
  { voltage: 3.40644997, ah: 3.634907315 },
  { voltage: 3.403906085, ah: 3.643693637 },
  { voltage: 3.40133566, ah: 3.65247996 },
  { voltage: 3.398742048, ah: 3.661266283 },
  { voltage: 3.396128604, ah: 3.670052605 },
  { voltage: 3.393498682, ah: 3.678838928 },
  { voltage: 3.390855636, ah: 3.687625251 },
  { voltage: 3.388202819, ah: 3.696411573 },
  { voltage: 3.385543586, ah: 3.705197896 },
  { voltage: 3.382881291, ah: 3.713984218 },
  { voltage: 3.380219288, ah: 3.722770541 },
  { voltage: 3.377560931, ah: 3.731556864 },
  { voltage: 3.374909573, ah: 3.740343186 },
  { voltage: 3.37226857, ah: 3.749129509 },
  { voltage: 3.369641274, ah: 3.757915832 },
  { voltage: 3.36703104, ah: 3.766702154 },
  { voltage: 3.364441222, ah: 3.775488477 },
  { voltage: 3.361875173, ah: 3.7842748 },
  { voltage: 3.359336249, ah: 3.793061122 },
  { voltage: 3.356827802, ah: 3.801847445 },
  { voltage: 3.354353188, ah: 3.810633768 },
  { voltage: 3.351915759, ah: 3.81942009 },
  { voltage: 3.34951887, ah: 3.828206413 },
  { voltage: 3.347165876, ah: 3.836992735 },
  { voltage: 3.344860129, ah: 3.845779058 },
  { voltage: 3.342604984, ah: 3.854565381 },
  { voltage: 3.340403795, ah: 3.863351703 },
  { voltage: 3.338259916, ah: 3.872138026 },
  { voltage: 3.336176701, ah: 3.880924349 },
  { voltage: 3.334157504, ah: 3.889710671 },
  { voltage: 3.332205668, ah: 3.898496994 },
  { voltage: 3.330321747, ah: 3.907283317 },
  { voltage: 3.328499792, ah: 3.916069639 },
  { voltage: 3.326732932, ah: 3.924855962 },
  { voltage: 3.325014296, ah: 3.933642285 },
  { voltage: 3.323337011, ah: 3.942428607 },
  { voltage: 3.321694205, ah: 3.95121493 },
  { voltage: 3.320079008, ah: 3.960001253 },
  { voltage: 3.318484548, ah: 3.968787575 },
  { voltage: 3.316903952, ah: 3.977573898 },
  { voltage: 3.31533035, ah: 3.98636022 },
  { voltage: 3.313756868, ah: 3.995146543 },
  { voltage: 3.312176637, ah: 4.003932866 },
  { voltage: 3.310582783, ah: 4.012719188 },
  { voltage: 3.308968436, ah: 4.021505511 },
  { voltage: 3.307326724, ah: 4.030291834 },
  { voltage: 3.305650106, ah: 4.039078156 },
  { voltage: 3.303917945, ah: 4.047864479 },
  { voltage: 3.302097658, ah: 4.056650802 },
  { voltage: 3.300156226, ah: 4.065437124 },
  { voltage: 3.298060628, ah: 4.074223447 },
  { voltage: 3.295777843, ah: 4.08300977 },
  { voltage: 3.293274853, ah: 4.091796092 },
  { voltage: 3.290518636, ah: 4.100582415 },
  { voltage: 3.287479918, ah: 4.109368737 },
  { voltage: 3.284166688, ah: 4.11815506 },
  { voltage: 3.280608299, ah: 4.126941383 },
  { voltage: 3.276834355, ah: 4.135727705 },
  { voltage: 3.27287446, ah: 4.144514028 },
  { voltage: 3.268758219, ah: 4.153300351 },
  { voltage: 3.264515237, ah: 4.162086673 },
  { voltage: 3.260175044, ah: 4.170872996 },
  { voltage: 3.255757384, ah: 4.179659319 },
  { voltage: 3.251262552, ah: 4.188445641 },
  { voltage: 3.246688545, ah: 4.197231964 },
  { voltage: 3.242033359, ah: 4.206018287 },
  { voltage: 3.237294993, ah: 4.214804609 },
  { voltage: 3.232471443, ah: 4.223590932 },
  { voltage: 3.227560706, ah: 4.232377255 },
  { voltage: 3.222560779, ah: 4.241163577 },
  { voltage: 3.21746966, ah: 4.2499499 },
  { voltage: 3.212285346, ah: 4.258736222 },
  { voltage: 3.207005832, ah: 4.267522545 },
  { voltage: 3.201629118, ah: 4.276308868 },
  { voltage: 3.196153199, ah: 4.28509519 },
  { voltage: 3.190576074, ah: 4.293881513 },
  { voltage: 3.184895738, ah: 4.302667836 },
  { voltage: 3.179110189, ah: 4.311454158 },
  { voltage: 3.173217424, ah: 4.320240481 },
  { voltage: 3.167215441, ah: 4.329026804 },
  { voltage: 3.161102235, ah: 4.337813126 },
  { voltage: 3.154875806, ah: 4.346599449 },
  { voltage: 3.148534148, ah: 4.355385772 },
  { voltage: 3.14207526, ah: 4.364172094 },
  { voltage: 3.135497139, ah: 4.372958417 },
  { voltage: 3.128797782, ah: 4.381744739 },
  { voltage: 3.121975185, ah: 4.390531062 },
  { voltage: 3.115027346, ah: 4.399317385 },
  { voltage: 3.107952263, ah: 4.408103707 },
  { voltage: 3.100747931, ah: 4.41689003 },
  { voltage: 3.093412349, ah: 4.425676353 },
  { voltage: 3.085943512, ah: 4.434462675 },
  { voltage: 3.07833942, ah: 4.443248998 },
  { voltage: 3.070600085, ah: 4.452035321 },
  { voltage: 3.062735105, ah: 4.460821643 },
  { voltage: 3.054756916, ah: 4.469607966 },
  { voltage: 3.046677954, ah: 4.478394289 },
  { voltage: 3.038510657, ah: 4.487180611 },
  { voltage: 3.030267461, ah: 4.495966934 },
  { voltage: 3.021960803, ah: 4.504753257 },
  { voltage: 3.013603119, ah: 4.513539579 },
  { voltage: 3.005206848, ah: 4.522325902 },
  { voltage: 2.996784425, ah: 4.531112224 },
  { voltage: 2.988348288, ah: 4.539898547 },
  { voltage: 2.979910873, ah: 4.54868487 },
  { voltage: 2.971484617, ah: 4.557471192 },
  { voltage: 2.963081957, ah: 4.566257515 },
  { voltage: 2.954715329, ah: 4.575043838 },
  { voltage: 2.946397171, ah: 4.58383016 },
  { voltage: 2.93813992, ah: 4.592616483 },
  { voltage: 2.929956012, ah: 4.601402806 },
  { voltage: 2.921857884, ah: 4.610189128 },
  { voltage: 2.913857972, ah: 4.618975451 },
  { voltage: 2.905968715, ah: 4.627761774 },
  { voltage: 2.898202548, ah: 4.636548096 },
  { voltage: 2.890571909, ah: 4.645334419 },
  { voltage: 2.883089234, ah: 4.654120741 },
  { voltage: 2.87576696, ah: 4.662907064 },
  { voltage: 2.868617523, ah: 4.671693387 },
  { voltage: 2.861653362, ah: 4.680479709 },
  { voltage: 2.854886912, ah: 4.689266032 },
  { voltage: 2.848330611, ah: 4.698052355 },
  { voltage: 2.841996894, ah: 4.706838677 },
  { voltage: 2.8358982, ah: 4.715625 },
];

function voltToAh(inputVoltage: number): number {
  // Check if the input voltage is within the interpolation range
  const minVoltage = Math.min(...VOLTAGE_TO_AH_DATA.map((d) => d.voltage));
  const maxVoltage = Math.max(...VOLTAGE_TO_AH_DATA.map((d) => d.voltage));

  if (inputVoltage < minVoltage || inputVoltage > maxVoltage) {
    // Return boundary values if outside range
    if (inputVoltage < minVoltage) {
      return VOLTAGE_TO_AH_DATA.find((d) => d.voltage === maxVoltage)?.ah || 0;
    } else {
      return VOLTAGE_TO_AH_DATA.find((d) => d.voltage === minVoltage)?.ah || 0;
    }
  }

  // Linear interpolation
  for (let i = 0; i < VOLTAGE_TO_AH_DATA.length - 1; i++) {
    const current = VOLTAGE_TO_AH_DATA[i];
    const next = VOLTAGE_TO_AH_DATA[i + 1];

    if (inputVoltage >= current.voltage && inputVoltage <= next.voltage) {
      const ratio =
        (inputVoltage - current.voltage) / (next.voltage - current.voltage);
      return current.ah + ratio * (next.ah - current.ah);
    }
  }

  // Fallback - return closest match
  const closest = VOLTAGE_TO_AH_DATA.reduce((prev, curr) =>
    Math.abs(curr.voltage - inputVoltage) <
    Math.abs(prev.voltage - inputVoltage)
      ? curr
      : prev,
  );
  return closest.ah;
}

export function calculateBatteryEnergyAh(data: TelemetryData<number>): number {
  if (!data.battery || data.battery.main_bat_v === undefined) return 0;

  // Convert telemetry main pack voltage to actual pack voltage
  const actualPackVoltage = (29 / 13) * data.battery.main_bat_v;

  // Get average parallel group voltage
  const avgParallelGroupVoltage = actualPackVoltage / 29;

  // Convert to Ah using the curve (this gives consumed Ah)
  const consumedAh = voltToAh(avgParallelGroupVoltage);

  // Return remaining energy: total capacity (4.8 Ah) minus consumed Ah
  const remainingAh = 4.8 - consumedAh;

  return Math.max(0, remainingAh); // Ensure we don't return negative values
}

export function calculateBatterySOC(data: TelemetryData<number>): number {
  const remainingAh = calculateBatteryEnergyAh(data);
  // SOC = remaining energy / total capacity, converted to percentage
  const soc = (remainingAh / 4.8) * 100;
  return Math.max(0, Math.min(100, soc)); // Clamp between 0 and 100
}

export function calculateMotorPowerConsumption(
  data: TelemetryData<number>,
): number | null {
  // Check if all required values are non-zero
  const mainBatV = data.battery?.main_bat_v;
  const mainBatC = data.battery?.main_bat_c;
  const mppt1OutputV = data.mppt1?.output_v;
  const mppt1OutputC = data.mppt1?.output_c;
  const mppt2OutputV = data.mppt2?.output_v;
  const mppt2OutputC = data.mppt2?.output_c;
  const mppt3OutputV = data.mppt3?.output_v;
  const mppt3OutputC = data.mppt3?.output_c;

  // Return null if any required value is missing or zero
  if (
    !mainBatV ||
    !mainBatC ||
    !mppt1OutputV ||
    !mppt1OutputC ||
    !mppt2OutputV ||
    !mppt2OutputC ||
    !mppt3OutputV ||
    !mppt3OutputC
  ) {
    return null;
  }

  // Calculate battery power: voltage * current
  const batteryPower = mainBatV * mainBatC;

  // Calculate total array power: sum of each MPPT's power
  const arrayPower =
    mppt1OutputV * mppt1OutputC +
    mppt2OutputV * mppt2OutputC +
    mppt3OutputV * mppt3OutputC;

  // Motor power consumption = battery power - array power
  return arrayPower - batteryPower;
}

export function getCustomValue(
  data: TelemetryData<number>,
  path: string,
): number | undefined {
  switch (path) {
    case "custom.soc":
      return calculateStateOfCharge(data);
    case "custom.motorPower":
      return calculateMotorPower(data);
    case "custom.battery_energy_ah":
      return calculateBatteryEnergyAh(data);
    case "custom.battery_soc":
      return calculateBatterySOC(data);
    default:
      return undefined;
  }
}

export function getLatestTimestamp(data: TelemetryData<Date>): Date {
  const timestamps: number[] = [];

  const extractTimestamps = (obj: any) => {
    for (const key in obj) {
      if (obj[key] instanceof Date) {
        timestamps.push(obj[key].getTime());
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        extractTimestamps(obj[key]);
      }
    }
  };

  extractTimestamps(data);

  return new Date(Math.max(...timestamps));
}

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nihongoku.app",
  appName: "Nihongoku",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
};

export default config;

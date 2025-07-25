import 'dotenv/config';
console.log("API_BASE from env:", process.env.API_BASE);

export default ({ config }) => {
  return {
    ...config,
    name: "ajor-app",
    slug: "ajor-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "ajorapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.ajor.ajorapp",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      permissions: ["INTERNET", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"], 
    },
    ios: {
      bundleIdentifier: "com.ajor.ajorapp"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      API_BASE: process.env.API_BASE, //|| "https://ajo-app-22jy.onrender.com",
      router: {},
      eas: {
        projectId: "8dc7d274-e8d6-4c12-8689-8415dc9ab806",
      },
    },
  };
};

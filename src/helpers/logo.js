import defaultLogo from "../openIMIS.png";

export default function getConfiguredLogo(config, key = 'value') {
  const logoBase64 = config?.["fe-core"]?.logo?.[key];
  if (
    logoBase64 &&
    (logoBase64.startsWith("data:image/png;base64,") ||
     logoBase64.startsWith("data:image/jpeg;base64,") ||
     logoBase64.startsWith("data:image/svg+xml;base64,"))
  ) {
    return logoBase64;
  }
  return defaultLogo;
}

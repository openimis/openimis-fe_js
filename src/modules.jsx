
export const packages = [
  "@openimis/fe-core",
  "@openimis/fe-location",
  "@openimis/fe-medical",
  "@openimis/fe-medical_pricelist"
];


export function loadModules(cfg = {}) {
  const loadedModules = [];

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-core")
      .then(module => {
        loadedModules.push(module.CoreModule(cfg["fe-core"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-core". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-core". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-core". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-core". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-location")
      .then(module => {
        loadedModules.push(module.LocationModule(cfg["fe-location"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-location". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-location". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-location". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-location". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-medical")
      .then(module => {
        loadedModules.push(module.MedicalModule(cfg["fe-medical"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-medical". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-medical". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-medical". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-medical". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-medical_pricelist")
      .then(module => {
        loadedModules.push(module.MedicalPriceListModule(cfg["fe-medical_pricelist"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-medical_pricelist". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-medical_pricelist". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-medical_pricelist". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-medical_pricelist". More details can be found in the developer console.`);
  }

  return loadedModules;
}

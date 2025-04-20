
export const packages = [
  "@openimis/fe-core",
  "@openimis/fe-individual",
  "@openimis/fe-social_protection",
  "@openimis/fe-opensearch_reports",
  "@openimis/fe-home",
  "@openimis/fe-location",
  "@openimis/fe-insuree",
  "@openimis/fe-medical",
  "@openimis/fe-medical_pricelist",
  "@openimis/fe-product",
  "@openimis/fe-policy",
  "@openimis/fe-payer",
  "@openimis/fe-contribution",
  "@openimis/fe-payment",
  "@openimis/fe-claim",
  "@openimis/fe-claim_batch",
  "@openimis/fe-admin",
  "@openimis/fe-tools",
  "@openimis/fe-profile",
  "@openimis/fe-calculation",
  "@openimis/fe-policyholder",
  "@openimis/fe-contribution_plan",
  "@openimis/fe-payment_cycle",
  "@openimis/fe-contract",
  "@openimis/fe-tasks_management",
  "@openimis/fe-invoice",
  "@openimis/fe-grievance_social_protection",
  "@openimis/fe-language_fr",
  "@openimis/fe-claim_sampling",
  "@openimis/fe-deduplication",
  "@openimis/fe-payroll"
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
    import("@openimis/fe-individual")
      .then(module => {
        loadedModules.push(module.IndividualModule(cfg["fe-individual"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-individual". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-individual". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-individual". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-individual". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-social_protection")
      .then(module => {
        loadedModules.push(module.SocialProtectionModule(cfg["fe-social_protection"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-social_protection". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-social_protection". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-social_protection". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-social_protection". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-opensearch_reports")
      .then(module => {
        loadedModules.push(module.OpenSearchReportsModule(cfg["fe-opensearch_reports"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-opensearch_reports". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-opensearch_reports". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-opensearch_reports". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-opensearch_reports". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-home")
      .then(module => {
        loadedModules.push(module.HomeModule(cfg["fe-home"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-home". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-home". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-home". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-home". More details can be found in the developer console.`);
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
    import("@openimis/fe-insuree")
      .then(module => {
        loadedModules.push(module.InsureeModule(cfg["fe-insuree"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-insuree". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-insuree". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-insuree". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-insuree". More details can be found in the developer console.`);
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

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-product")
      .then(module => {
        loadedModules.push(module.ProductModule(cfg["fe-product"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-product". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-product". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-product". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-product". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-policy")
      .then(module => {
        loadedModules.push(module.PolicyModule(cfg["fe-policy"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-policy". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-policy". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-policy". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-policy". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-payer")
      .then(module => {
        loadedModules.push(module.PayerModule(cfg["fe-payer"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-payer". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-payer". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-payer". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-payer". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-contribution")
      .then(module => {
        loadedModules.push(module.ContributionModule(cfg["fe-contribution"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-contribution". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-contribution". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-contribution". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-contribution". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-payment")
      .then(module => {
        loadedModules.push(module.PaymentModule(cfg["fe-payment"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-payment". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-payment". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-payment". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-payment". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-claim")
      .then(module => {
        loadedModules.push(module.ClaimModule(cfg["fe-claim"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-claim". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-claim". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-claim". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-claim". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-claim_batch")
      .then(module => {
        loadedModules.push(module.ClaimBatchModule(cfg["fe-claim_batch"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-claim_batch". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-claim_batch". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-claim_batch". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-claim_batch". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-admin")
      .then(module => {
        loadedModules.push(module.AdminModule(cfg["fe-admin"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-admin". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-admin". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-admin". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-admin". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-tools")
      .then(module => {
        loadedModules.push(module.ToolsModule(cfg["fe-tools"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-tools". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-tools". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-tools". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-tools". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-profile")
      .then(module => {
        loadedModules.push(module.ProfileModule(cfg["fe-profile"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-profile". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-profile". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-profile". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-profile". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-calculation")
      .then(module => {
        loadedModules.push(module.CalculationModule(cfg["fe-calculation"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-calculation". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-calculation". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-calculation". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-calculation". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-policyholder")
      .then(module => {
        loadedModules.push(module.PolicyHolderModule(cfg["fe-policyholder"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-policyholder". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-policyholder". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-policyholder". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-policyholder". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-contribution_plan")
      .then(module => {
        loadedModules.push(module.ContributionPlanModule(cfg["fe-contribution_plan"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-contribution_plan". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-contribution_plan". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-contribution_plan". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-contribution_plan". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-payment_cycle")
      .then(module => {
        loadedModules.push(module.PaymentCycleModule(cfg["fe-payment_cycle"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-payment_cycle". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-payment_cycle". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-payment_cycle". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-payment_cycle". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-contract")
      .then(module => {
        loadedModules.push(module.ContractModule(cfg["fe-contract"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-contract". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-contract". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-contract". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-contract". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-tasks_management")
      .then(module => {
        loadedModules.push(module.TasksManagementModule(cfg["fe-tasks_management"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-tasks_management". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-tasks_management". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-tasks_management". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-tasks_management". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-invoice")
      .then(module => {
        loadedModules.push(module.InvoiceModule(cfg["fe-invoice"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-invoice". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-invoice". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-invoice". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-invoice". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-grievance_social_protection")
      .then(module => {
        loadedModules.push(module.GrievanceSocialProtectionModule(cfg["fe-grievance_social_protection"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-grievance_social_protection". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-grievance_social_protection". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-grievance_social_protection". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-grievance_social_protection". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-language_fr")
      .then(module => {
        loadedModules.push(module.LanguageFrModule(cfg["fe-language_fr"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-language_fr". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-language_fr". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-language_fr". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-language_fr". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-claim_sampling")
      .then(module => {
        loadedModules.push(module.ClaimSamplingModule(cfg["fe-claim_sampling"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-claim_sampling". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-claim_sampling". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-claim_sampling". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-claim_sampling". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-deduplication")
      .then(module => {
        loadedModules.push(module.DeduplicationModule(cfg["fe-deduplication"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-deduplication". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-deduplication". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-deduplication". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-deduplication". More details can be found in the developer console.`);
  }

  try {
    // Using dynamic import for Vite compatibility
    import("@openimis/fe-payroll")
      .then(module => {
        loadedModules.push(module.PayrollModule(cfg["fe-payroll"] || {}));
      })
      .catch(error => {
        console.error(`Failed to load module "@openimis/fe-payroll". Error: ${error}`);
        alert(`Failed to load module "@openimis/fe-payroll". More details can be found in the developer console.`);
      });
  } catch (error) {
    console.error(`Failed to import module "@openimis/fe-payroll". Error: ${error}`);
    alert(`Failed to import module "@openimis/fe-payroll". More details can be found in the developer console.`);
  }

  return loadedModules;
}

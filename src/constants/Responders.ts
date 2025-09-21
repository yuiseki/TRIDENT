export const responders: {
  name: string;
  field: string;
  domain: string;
}[] = [
  // System-wide coordination
  { name: "OCHA", field: "Coordination", domain: "Inter-Cluster Coordination" },

  // Protection cluster + AoRs
  { name: "UNHCR", field: "Protection", domain: "Cluster" },
  { name: "UNFPA", field: "Protection", domain: "GBV AoR" },
  { name: "UNICEF", field: "Protection", domain: "Child Protection AoR" },
  { name: "UNMAS", field: "Protection", domain: "Mine Action AoR" },
  { name: "NRC", field: "Protection", domain: "HLP AoR" },
  { name: "UN-Habitat", field: "Protection", domain: "HLP AoR" },

  // CCCM
  { name: "IOM", field: "CCCM", domain: "Cluster (Natural disasters lead)" },
  { name: "UNHCR", field: "CCCM", domain: "Cluster (Conflict lead)" },

  // Shelter
  { name: "UNHCR", field: "Shelter", domain: "Cluster (Conflict lead)" },
  {
    name: "IFRC",
    field: "Shelter",
    domain: "Cluster (Natural disasters convenor/lead)",
  },

  // Education
  { name: "UNICEF", field: "Education", domain: "Cluster (Co-lead)" },
  {
    name: "Save the Children",
    field: "Education",
    domain: "Cluster (Co-lead)",
  },

  // Food Security
  { name: "FAO", field: "Food Security", domain: "Cluster (Co-lead)" },
  { name: "WFP", field: "Food Security", domain: "Cluster (Co-lead)" },

  // Health
  { name: "WHO", field: "Health", domain: "Cluster" },

  // Nutrition
  { name: "UNICEF", field: "Nutrition", domain: "Cluster" },

  // WASH
  { name: "UNICEF", field: "WASH", domain: "Cluster" },

  // Logistics
  { name: "WFP", field: "Logistics", domain: "Cluster" },

  // Emergency Telecommunications
  { name: "WFP", field: "Emergency Telecommunications", domain: "Cluster" },

  // Early Recovery
  { name: "UNDP", field: "Early Recovery", domain: "Cluster" },
];

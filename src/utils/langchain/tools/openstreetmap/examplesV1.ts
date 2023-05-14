export const examplesV1: {
  input: string;
  area: string;
  tags: string[];
  query: string[];
}[] = [
  {
    input: "Police Stations in New York City",
    area: "City of New York",
    tags: ['nwr["amenity"="police"]'],
    query: [
      `[out:json][timeout:30000];
area["name"="City of New York"]->.searchArea;
(
  nwr["amenity"="police"](area.searchArea);
);
out geom;`,
    ],
  },
  {
    input: "United Nations Facilities in New York City",
    area: "City of New York",
    tags: [
      'nwr["name"~"United Nations"]["building"="yes"]',
      'nwr["name"~"United Nations"]["building:part"="yes"]',
    ],
    query: [
      `[out:json][timeout:30000];
area["name"="City of New York"]->.searchArea;
(
  nwr["name"~"United Nations"]["building"="yes"](area.searchArea);
  nwr["name"~"United Nations"]["building:part"="yes"](area.searchArea);
);
out geom;`,
    ],
  },
  {
    input: "Hospitals and Schools in Taito-ku",
    area: "Taito",
    tags: [],
    query: [],
  },
  {
    input: "Hotels in Kyoto",
    area: "Kyoto",
    tags: [],
    query: [],
  },
  {
    input: "Shelter in the capital of Sudan",
    area: "Khartoum",
    tags: [],
    query: [],
  },
  {
    input: "Military Facilities in South Sudan",
    area: "South Sudan",
    tags: [],
    query: [],
  },
];

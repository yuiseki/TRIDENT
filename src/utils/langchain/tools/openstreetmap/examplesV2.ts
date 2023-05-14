import { TridentMaps } from "@/types/TridentMaps";

export const examplesV2: TridentMaps[] = [
  {
    areas: [
      {
        name: "台東区",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:ja"="台東区"];
out geom;`,
        subjects: [
          {
            name: "公園",
            style: {
              fillColor: "lightgreen",
              emoji: "🏞",
            },
            query: `[out:json][timeout:30000];
area["name:ja"="台東区"]->.searchArea;
(
  nwr["leisure"="park"](area.searchArea);
);
out geom;`,
          },
          {
            name: "駅",
            style: {
              fillColor: "lightblue",
              emoji: "🚉",
            },
            query: `[out:json][timeout:30000];
area["name:ja"="台東区"]->.searchArea;
(
  nwr["railway"="station"](area.searchArea);
);
out geom;`,
          },
        ],
      },
      {
        name: "千代田区",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:ja"="千代田区"];
out geom;`,
        subjects: [
          {
            name: "公園",
            style: {
              fillColor: "lightgreen",
              emoji: "🏞",
            },
            query: `[out:json][timeout:30000];
area["name:ja"="千代田区"]->.searchArea;
(
  nwr["leisure"="park"](area.searchArea);
);
out geom;`,
          },
          {
            name: "駅",
            style: {
              fillColor: "lightblue",
              emoji: "🚉",
            },
            query: `[out:json][timeout:30000];
area["name:ja"="千代田区"]->.searchArea;
(
  nwr["railway"="station"](area.searchArea);
);
out geom;`,
          },
        ],
      },
    ],
  },
  {
    areas: [
      {
        name: "City of New York",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name"="City of New York"];
out geom;`,
        subjects: [
          {
            name: "Police Stations",
            style: {
              fillColor: "blue",
              emoji: "👮",
            },
            query: `[out:json][timeout:30000];
area["name"="City of New York"]->.searchArea;
(
  nwr["amenity"="police"](area.searchArea);
);
out geom;`,
          },
          {
            name: "Stations",
            style: {
              fillColor: "yellow",
              emoji: "🚉",
            },
            query: `[out:json][timeout:30000];
area["name"="City of New York"]->.searchArea;
(
  nwr["railway"="station"](area.searchArea);
);
out geom;`,
          },
          {
            name: "Hotels",
            style: {
              fillColor: "white",
              emoji: "🏨",
            },
            query: `[out:json][timeout:30000];
area["name"="City of New York"]->.searchArea;
(
  nwr["tourism"="hotel"](area.searchArea);
);
out geom;`,
          },
          {
            name: "United Nations",
            style: {
              fillColor: "lightblue",
              emoji: "🇺🇳",
            },
            query: `[out:json][timeout:30000];
area["name"="City of New York"]->.searchArea;
(
  nwr["name"~"United Nations"]["building"="yes"](area.searchArea);
  nwr["name"~"United Nations"]["building:part"="yes"](area.searchArea);
);
out geom;`,
          },
        ],
      },
    ],
  },
  {
    areas: [
      {
        name: "Municipality of Prizren",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Municipality of Prizren"];
out geom;`,
        subjects: [
          {
            name: "Police Stations",
            style: {
              fillColor: "blue",
              emoji: "👮",
            },
            query: `[out:json][timeout:30000];
area["name:en"="Municipality of Prizren"]->.searchArea;
(
  nwr["amenity"="police"](area.searchArea);
);
out geom;`,
          },
          {
            name: "Hotels",
            style: {
              fillColor: "white",
              emoji: "🏨",
            },
            query: `[out:json][timeout:30000];
area["name:en"="Municipality of Prizren"]->.searchArea;
(
  nwr["tourism"="hotel"](area.searchArea);
);
out geom;`,
          },
        ],
      },
    ],
  },
  {
    areas: [
      {
        name: "Sudan",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Sudan"];
out geom;`,
        subjects: [
          {
            name: "Military facilities",
            style: {
              fillColor: "yellow",
              emoji: "🪖",
            },
            query: `[out:json][timeout:30000];
area["name:en"="Sudan"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea);
);
out geom;`,
          },
        ],
      },
      {
        name: "South Sudan",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="South Sudan"];
out geom;`,
        subjects: [
          {
            name: "Military facilities",
            style: {
              fillColor: "yellow",
              emoji: "🪖",
            },
            query: `[out:json][timeout:30000];
area["name:en"="South Sudan"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea);
);
out geom;`,
          },
        ],
      },
    ],
  },
  {
    areas: [
      {
        name: "Belgorod Oblast, Russia",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Belgorod Oblast"];
out geom;`,
        subjects: [
          {
            name: "Military facilities",
            style: {
              fillColor: "yellow",
              emoji: "🪖",
            },
            query: `[out:json][timeout:30000];
area["name:en"="Belgorod Oblast"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea);
);
out geom;`,
          },
        ],
      },
      {
        name: "Voronezh Oblast, Russia",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Voronezh Oblast"];
out geom;`,
        subjects: [
          {
            name: "Military facilities",
            style: {
              fillColor: "yellow",
              emoji: "🪖",
            },
            query: `[out:json][timeout:30000];
area["name:en"="Voronezh Oblast"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea);
);
out geom;`,
          },
        ],
      },
      {
        name: "Bryansk Oblast, Russia",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Bryansk Oblast"];
out geom;`,
        subjects: [
          {
            name: "Military facilities",
            style: {
              fillColor: "yellow",
              emoji: "🪖",
            },
            query: `[out:json][timeout:30000];
area["name:en"="Bryansk Oblast"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea);
);
out geom;`,
          },
        ],
      },
      {
        name: "Kursk Oblast, Russia",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Kursk Oblast"];
out geom;`,
        subjects: [
          {
            name: "Military facilities",
            style: {
              fillColor: "yellow",
              emoji: "🪖",
            },
            query: `[out:json][timeout:30000];
area["name:en"="Kursk Oblast"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea);
);
out geom;`,
          },
        ],
      },
      {
        name: "Rostov Oblast, Russia",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Rostov Oblast"];
out geom;`,
        subjects: [
          {
            name: "Military facilities",
            style: {
              fillColor: "yellow",
              emoji: "🪖",
            },
            query: `[out:json][timeout:30000];
area["name:en"="Rostov Oblast"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea);
);
out geom;`,
          },
        ],
      },
      {
        name: "Ukraine",
        style: {
          borderColor: "yellow",
          fillColor: "lightyellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Ukraine"];
out geom;`,
        subjects: [
          {
            name: "Military facilities",
            style: {
              fillColor: "yellow",
              emoji: "🪖",
            },
            query: `[out:json][timeout:30000];
area["name:en"="Ukraine"]->.searchArea;
(
  nwr["landuse"="military"](area.searchArea);
);
out geom;`,
          },
        ],
      },
    ],
  },
];
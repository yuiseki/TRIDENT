import { TridentMaps } from "@/types/TridentMaps";

export const examplesV2: TridentMaps[] = [
  {
    areas: [
      {
        name: "台東区",
        style: {
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:ja"="台東区"];
out geom;`,
        concerns: [
          {
            name: "公園",
            style: {
              color: "green",
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
              color: "blue",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:ja"="千代田区"];
out geom;`,
        concerns: [
          {
            name: "公園",
            style: {
              color: "green",
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
              color: "blue",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name"="City of New York"];
out geom;`,
        concerns: [
          {
            name: "Police Stations",
            style: {
              color: "blue",
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
              color: "yellow",
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
              color: "white",
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
              color: "blue",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Municipality of Prizren"];
out geom;`,
        concerns: [
          {
            name: "Police Stations",
            style: {
              color: "blue",
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
              color: "white",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Sudan"];
out geom;`,
        concerns: [
          {
            name: "Military facilities",
            style: {
              color: "yellow",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="South Sudan"];
out geom;`,
        concerns: [
          {
            name: "Military facilities",
            style: {
              color: "yellow",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Belgorod Oblast"];
out geom;`,
        concerns: [
          {
            name: "Military facilities",
            style: {
              color: "yellow",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Voronezh Oblast"];
out geom;`,
        concerns: [
          {
            name: "Military facilities",
            style: {
              color: "yellow",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Bryansk Oblast"];
out geom;`,
        concerns: [
          {
            name: "Military facilities",
            style: {
              color: "yellow",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Kursk Oblast"];
out geom;`,
        concerns: [
          {
            name: "Military facilities",
            style: {
              color: "yellow",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Rostov Oblast"];
out geom;`,
        concerns: [
          {
            name: "Military facilities",
            style: {
              color: "yellow",
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
          color: "yellow",
          emoji: "🚩",
        },
        query: `[out:json][timeout:30000];
relation["name:en"="Ukraine"];
out geom;`,
        concerns: [
          {
            name: "Military facilities",
            style: {
              color: "yellow",
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

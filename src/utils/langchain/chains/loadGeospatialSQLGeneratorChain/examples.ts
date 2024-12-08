export const examples: Array<{
  input: string;
  output: string;
  answer: string;
}> = [
  {
    input: "After Antarctica, which country has the largest area?",
    output: `SELECT name as name, ST_AREA(geom) as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE name != 'Antarctica'
ORDER BY value DESC
LIMIT 1`,
    answer: "Russia",
  },
  {
    input: "Which country is closest to Japan?",
    output: `SELECT name as name, ST_DISTANCE(geom, (SELECT geom FROM countries WHERE name = 'Japan')) as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE name != 'Japan'
ORDER BY value ASC
LIMIT 1`,
    answer: "Russia",
  },
  {
    input: "Which country is closest to Australia?",
    output: `SELECT name as name, ST_DISTANCE(geom, (SELECT geom FROM countries WHERE name = 'Australia')) as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE name != 'Australia'
ORDER BY value ASC
LIMIT 1`,
    answer: "Indonesia",
  },
  {
    input: "Which land area is larger, Japan or Taiwan?",
    output: `SELECT name as name, ST_AREA(geom) as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE name = 'Japan' OR name = 'Taiwan'
ORDER BY value DESC
LIMIT 1`,
    answer: "Japan",
  },
  {
    input: "Which land area is larger, Brazil or Russia?",
    output: `SELECT name as name, ST_AREA(geom) as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE name = 'Brazil' OR name = 'Russia'
ORDER BY value DESC
LIMIT 1`,
    answer: "Russia",
  },
  {
    input: "Which country has the longest coastline?",
    output: `SELECT name as name, ST_LENGTH(geom) as value, ST_AsGeoJSON(geom) as geom
FROM countries
WHERE geom IS NOT NULL
ORDER BY value DESC
LIMIT 1`,
    answer: "Indonesia",
  },
  {
    input: "Which country shares a border with both China and India?",
    output: `SELECT name as name,
ST_INTERSECTS(geom, (SELECT geom FROM countries WHERE name = 'China')) AS is_border_with_china,
ST_INTERSECTS(geom, (SELECT geom FROM countries WHERE name = 'India')) AS is_border_with_india
FROM countries
WHERE name != 'China' AND name != 'India'
ORDER BY is_border_with_china DESC, is_border_with_india DESC
LIMIT 1`,
    answer: "Bhutan",
  },
  {
    input: "Which country shares a border with both India and Pakistan?",
    output: `SELECT name as name, 
ST_INTERSECTS(geom, (SELECT geom FROM countries WHERE name = 'India')) AS is_border_with_india,
ST_INTERSECTS(geom, (SELECT geom FROM countries WHERE name = 'Pakistan')) AS is_border_with_pakistan
FROM countries
WHERE name != 'India' AND name != 'Pakistan'
ORDER BY is_border_with_india DESC, is_border_with_pakistan DESC
LIMIT 1`,
    answer: "China",
  },
  {
    input: "List all countries that border China.",
    output: `SELECT name as name, ST_AsGeoJSON(geom) as geom,
FROM countries
WHERE name != 'China' AND ST_INTERSECTS(geom, (SELECT geom FROM countries WHERE name = 'China'))`,
    answer:
      "Afghanistan,Bhutan,Hong Kong,India,Kazakhstan,Kyrgyzstan,Laos,Mongolia,Myanmar,Nepal,North Korea,Pakistan,Russia,Siachen Glacier,Tajikistan,Vietnam",
  },
  {
    input: "List all countries that border Lebanon.",
    output: `SELECT name as name, ST_AsGeoJSON(geom) as geom,
FROM countries
WHERE name != 'Lebanon' AND ST_INTERSECTS(geom, (SELECT geom FROM countries WHERE name = 'Lebanon'))`,
    answer: "Israel,Syria",
  },
];

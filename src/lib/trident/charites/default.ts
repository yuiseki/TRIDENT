// TRIDENT CharitesのOPFSのデフォルトの内容

export const TridentCharitesDefaultContents = [
  {
    path: "style.yml",
    content: `# prompt: 基本のファイルなので絶対に変更するな
version: 8
name: TRIDENT Charites Like OPFS Style 
metadata: {}
sources:
  openmaptiles:
    type: vector
    url: https://tile.openstreetmap.jp/data/planet.json
sprite: https://openmaptiles.github.io/osm-bright-gl-style/sprite
glyphs: https://tile.openstreetmap.jp/fonts/{fontstack}/{range}.pbf
layers:
  - !!inc/file layers/background.yml
  - !!inc/file layers/water.yml
  - !!inc/file layers/landcover-park-green.yml
  - !!inc/file layers/highway.yml
  - !!inc/file layers/road-major.yml
  - !!inc/file layers/boundary-land-level-4.yml
  - !!inc/file layers/boundary-land-level-2.yml
  - !!inc/file layers/place-settlement.yml
  - !!inc/file layers/place-country-2.yml`,
  },
  {
    path: "layers/background.yml",
    content: `# prompt: 地図の背景色＝地図上の各国の色を定義しているファイル。国の色を変更する場合にはこのファイルを変更する
id: background
type: background
paint:
  background-color: '#45516E'`,
  },
  {
    path: "layers/water.yml",
    content: `# prompt: 地図上の水の色を定義しているファイル
id: water
type: fill
source: openmaptiles
source-layer: water
filter:
  - all
  - - '!='
    - intermittent
    - 1
  - - '!='
    - brunnel
    - tunnel
layout:
  visibility: visible
paint:
  fill-antialias: false
  fill-color: '#38435C'`,
  },
  {
    path: "layers/landcover-park-green.yml",
    content: `# prompt: 公園の色を決めているファイル
id: landcover-park-green
type: fill
source: openmaptiles
source-layer: landcover
filter:
  - any
  - - '=='
    - class
    - park
  - - '=='
    - class
    - grass
paint:
  fill-color: hsl(204, 17%, 35%)
  fill-opacity: 0.3`,
  },
  {
    path: "layers/highway.yml",
    content: `# prompt: 高速道路の色を定義しているファイル
id: highway
type: line
minzoom: 10
source: openmaptiles
source-layer: transportation
filter:
  - all
  - - '=='
    - $type
    - LineString
  - - '!in'
    - brunnel
    - bridge
    - tunnel
    - ramp
  - - in
    - class
    - primary
    - secondary
paint:
  line-color: '#3C4357'
  line-opacity: 1
  line-dasharray: [2, 2]
  line-width:
    base: 1.2
    stops:
      - - 8.5
        - 1.2
      - - 9
        - 0.5
      - - 20
        - 18`,
  },
  {
    path: "layers/road-major.yml",
    content: `# prompt: 主要道路の色を定義しているファイル
id: road-major
type: line
minzoom: 10
source: openmaptiles
source-layer: transportation
filter:
  - all
  - - '=='
    - $type
    - LineString
  - - 'in'
    - class
    - motorway
    - trunk
    - primary
paint:
  line-color: '#888'
  line-width:
    base: 1.4
    stops:
      - - 10
        - 0.75
      - - 11
        - 1.5
      - - 20
        - 2`,
  },
  {
    path: "layers/boundary-land-level-4.yml",
    content: `# prompt: 州や都道府県の境界線の色を定義しているファイル
id: boundary-land-level-4
type: line
source: openmaptiles
source-layer: boundary
minzoom: 5
filter:
  - all
  - - '>='
    - admin_level
    - 3
  - - <=
    - admin_level
    - 8
  - - '!='
    - maritime
    - 1
layout:
  line-join: round
  visibility: visible
paint:
  line-color: hsla(195, 47%, 62%, 0.26)
  line-dasharray:
    - 3
    - 1
    - 1
    - 1
  line-width:
    base: 1.4
    stops:
      - - 4
        - 0.4
      - - 5
        - 1
      - - 12
        - 3`,
  },
  {
    path: "layers/boundary-land-level-2.yml",
    content: `# prompt: 国境線の色を定義しているファイル。 boundary-land-level-2 は国の境界線を示す
id: boundary-land-level-2
type: line
source: openmaptiles
source-layer: boundary
filter:
  - all
  - - '=='
    - admin_level
    - 2
  - - '!='
    - maritime
    - 1
  - - '!='
    - disputed
    - 1
layout:
  line-cap: round
  line-join: round
  visibility: visible
paint:
  line-color: hsl(214, 63%, 76%)
  line-width:
    base: 1
    stops:
      - - 0
        - 0.6
      - - 4
        - 1.4
      - - 5
        - 2
      - - 12
        - 8`,
  },
  {
    path: "layers/place-settlement.yml",
    content: `# prompt: 地域の名前の色を定義しているファイル
id: place-settlement
type: symbol
source: openmaptiles
source-layer: place
filter:
  - all
  - - 'in'
    - class
    - city
    - town
    - village
layout:
  text-field: |-
    {name:latin}
    {name:nonlatin}
  text-font:
    - Open Sans Regular
  text-max-width: 8
  text-size:
    base: 1.2
    stops:
      - - 7
        - 14
      - - 11
        - 24
  visibility: visible
paint:
  text-color: hsl(195, 41%, 49%)
  text-halo-color: hsla(228, 60%, 21%, 0.7)
  text-halo-width: 1.2`,
  },
  {
    path: "layers/place-country-2.yml",
    content: `# prompt: 国の名前の色を定義しているファイル
id: place-country-2
type: symbol
source: openmaptiles
source-layer: place
filter:
  - all
  - - '=='
    - class
    - country
layout:
  text-field: '{name:latin}'
  text-font:
    - Open Sans Regular
  text-max-width: 6.25
  text-size:
    stops:
      - - 1
        - 11
      - - 4
        - 17
  text-transform: uppercase
  visibility: visible
paint:
  text-color: rgb(153, 153, 153)
  text-halo-blur: 1
  text-halo-color: hsla(228, 60%, 21%, 0.7)
  text-halo-width: 1.4`,
  },
];

declare module "*.wasm" {
  const value: any;
  export default value;
}

declare module '*?url' {
  const src: string
  export default src
}

export const decodePolyline = (encoded: string, mul: number = 1e6) => {
  //precision
  const inv = 1.0 / mul;
  const decoded = [];
  const previous = [0, 0];
  let i = 0;
  //for each byte
  while (i < encoded.length) {
    //for each coord (lat, lon)
    const ll = [0, 0];
    for (let j = 0; j < 2; j++) {
      let shift = 0;
      let byte = 0x20;
      //keep decoding bytes until you have this coord
      while (byte >= 0x20) {
        byte = encoded.charCodeAt(i++) - 63;
        ll[j] |= (byte & 0x1f) << shift;
        shift += 5;
      }
      //add previous offset to get final value and remember for next one
      ll[j] = previous[j] + (ll[j] & 1 ? ~(ll[j] >> 1) : ll[j] >> 1);
      previous[j] = ll[j];
    }
    //scale by precision and chop off long coords also flip the positions so
    //its the far more standard lon,lat instead of lat,lon
    decoded.push([ll[1] * inv, ll[0] * inv]);
  }
  //hand back the list of coordinates
  return decoded;
};

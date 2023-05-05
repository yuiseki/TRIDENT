const endpoint = "https://api.reliefweb.int/v1/disasters";
const params = new URLSearchParams();
params.append("appname", "TRIDENT");
params.append("profile", "list");
params.append("preset", "latest");
params.append("limit", "100");
const url = `${endpoint}?${params.toString()}`;
const apiRes = await fetch(url);
const apiJson = await apiRes.json();
for await (const data of apiJson.data) {
  console.log(data.id);
  console.log(data.score);
  console.log(data.href);
  console.log(JSON.stringify(data.fields, null, 2));
}

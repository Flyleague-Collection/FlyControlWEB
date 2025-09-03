from json import load, dump

data = load(open("./public/data/TRACONBoundaries.geojson", "r", encoding="utf8"))

features = []

for feature in data["features"]:
    types = feature.get("type")
    if types == "Feature":
        features.append(feature)
    elif types == "FeatureCollection":
        features.append(*feature["features"])
    else:
        print(f"Unsupport type {types}, {feature}")
        
for feature in features:
    properties = feature["properties"]
    id = properties["id"]
    prefix = properties["prefix"][0]
    if id != prefix:
        properties[id] = f"{id}_{prefix}"

data["features"] = features

dump(data, open("./public/data/TRACONBoundaries.geojson", "w", encoding="utf8"))
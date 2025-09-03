const config = await (await fetch("/config.json")).json() as Config;
export const airports = await (await fetch("/data/airports.json")).json() as Airports;

export default config;

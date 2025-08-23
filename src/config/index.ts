const config = await (await fetch("/config.json")).json() as Config;

export default config;

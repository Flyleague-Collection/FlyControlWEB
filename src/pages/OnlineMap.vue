<script setup lang="ts">
import {ref, onMounted, onUnmounted, watch} from 'vue';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {fromLonLat} from 'ol/proj';
import {Style, Icon, Stroke, Fill} from 'ol/style';
import Overlay from 'ol/Overlay';
import 'ol/ol.css';
import request from "@/utils/request.js";
import AxiosXHR = Axios.AxiosXHR;
import {Layer} from "ol/layer.js";
import {showError} from "@/utils/message.js";
import {LineString} from "ol/geom.js";
import {GeoJSON, MVT} from "ol/format.js";
import {join} from "lodash";
import {get as getProjection} from 'ol/proj.js';
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from 'ol/source/VectorTile.js';
import {TileGrid} from "ol/tilegrid.js";
import {applyStyle} from 'ol-mapbox-style';
import config from "@/config/index.js";

const resolutions = [];
for (let i = 0; i <= 8; ++i) {
    resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
}

function tileUrlFunction(tileCoord) {
    return (
        'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
        '{z}/{x}/{y}.vector.pbf?access_token=' + config.mapbox_token
    )
        .replace('{z}', String(tileCoord[0] * 2 - 1))
        .replace('{x}', String(tileCoord[1]))
        .replace('{y}', String(tileCoord[2]))
        .replace(
            '{a-d}',
            'abcd'.substr(((tileCoord[1] << tileCoord[0]) + tileCoord[2]) % 4, 1)
        );
}

const layers = {
    OSM: new TileLayer({
        title: 'OSM',
        visible: true,
        source: new OSM()
    }),
    Mapbox: new VectorTileLayer({
        title: 'Mapbox',
        visible: false,
        source: new VectorTileSource({
            attributions:
                '<a href="https://www.mapbox.com/about/maps">© Mapbox</a> ' +
                '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a> ' +
                '<a href="https://www.maxar.com/">© Maxar</a>',
            format: new MVT(),
            tileGrid: new TileGrid({
                extent: getProjection('EPSG:3857')?.getExtent(),
                resolutions: resolutions,
                tileSize: 512
            }),
            tileUrlFunction: tileUrlFunction
        })
    })
}

// 地图引用
const mapContainer = ref<HTMLElement>();
const map = ref<OlMap | null>(null);
const selectedFeature = ref<Feature | null>(null);
const popup = ref<Overlay>();
const popupContent = ref<string>('');
const selectedLayer = ref("OSM");
const mapBoxAvailable = ref(false)

watch(() => selectedLayer.value, (value: string, oldValue: string) => {
    const oldLayers = layers[oldValue]
    const newLayers = layers[value]
    if (oldLayers && newLayers) {
        oldLayers.setVisible(false)
        newLayers.setVisible(true)
    }
})

let onlineData: GetOnlineClientResponse;

const fetchWhazzupData = async () => {
    const response = await request.get(`/clients`) as AxiosXHR<GetOnlineClientResponse>
    if (response.status == 200) {
        onlineData = response.data
    }
}

let lineLayer: Layer;
let aircraftLayer: Layer;
let centerSource: VectorSource;
const centerFeatureMap: Map<string, Feature> = new Map();
let centerLayer: Layer;
let approachSource: VectorSource;
const approachFeatureMap: Map<string, Feature> = new Map();
let approachLayer: Layer;
let lineFeature: Feature | null = null;
let interval: number;

const createStyle = (heading: number): Style => {
    return new Style({
        image: new Icon({
            src: '/images/aircraft.png',
            scale: 0.5,
            anchor: [0.5, 0.5],
            opacity: 0.9,
            rotation: heading * Math.PI / 180.0
        })
    });
}

// 初始化地图
onMounted(async () => {
    if (!mapContainer.value) return;

    await fetchWhazzupData();
    mapBoxAvailable.value = config.mapbox_token != ""

    if (mapBoxAvailable.value) {
        await applyStyle(layers.Mapbox, 'mapbox://styles/mapbox/streets-v12', {accessToken: config.mapbox_token});
    } else {
        showError("未设置Mapbox Token, Mapbox 瓦片服务不可用")
    }

    // 创建地图
    map.value = new OlMap({
        target: mapContainer.value,
        layers: [layers.OSM, layers.Mapbox],
        view: new View({
            center: fromLonLat([120, 30]),
            zoom: 4
        })
    });

    lineLayer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
            stroke: new Stroke({
                color: config.flight_path_color,
                width: 3
            })
        })
    });

    aircraftLayer = new VectorLayer({
        source: new VectorSource()
    })

    const centerSourceFormat = new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    })

    centerSource = new VectorSource({
        features: centerSourceFormat.readFeatures(await (await fetch("/data/Boundaries.geojson")).json())
    })

    centerSource.forEachFeature(feature => {
        centerFeatureMap.set(feature.get("id") as string, feature)
    })

    centerLayer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
            stroke: new Stroke({
                color: config.atc_border,
                width: 2
            }),
            fill: new Fill({
                color: config.atc_fill
            })
        })
    })

    const approachSourceFormat = new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    })

    approachSource = new VectorSource({
        features: approachSourceFormat.readFeatures(await (await fetch("/data/TRACONBoundaries.geojson")).json())
    })

    approachSource.forEachFeature(feature => {
        approachFeatureMap.set(feature.get("id") as string, feature)
    })

    approachLayer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
            stroke: new Stroke({
                color: config.atc_border,
                width: 2
            }),
            fill: new Fill({
                color: config.atc_fill
            })
        })
    })

    map.value.addLayer(lineLayer);
    map.value.addLayer(approachLayer);
    map.value.addLayer(centerLayer);
    map.value.addLayer(aircraftLayer);

    // 添加标记
    onlineData.pilots.forEach(pilot => {
        const feature = new Feature({
            geometry: new Point(fromLonLat([pilot.longitude, pilot.latitude])),
            isPilot: true,
            callsign: pilot.callsign,
            flightPlan: pilot.flight_plan,
            groundSpeed: pilot.ground_speed,
            altitude: pilot.altitude
        });

        feature.setStyle(createStyle(pilot.heading));
        aircraftLayer.getSource().addFeature(feature);
    });
    onlineData.controllers.forEach(controller => {
        if (controller.facility == 6) {
            // CTR
            const tmp = controller.callsign.split("_");
            const callsign = tmp.slice(0, tmp.length - 1);
            const feature = centerFeatureMap.get(join(callsign, '-'))?.clone()
            feature?.set("isPilot", false)
            feature?.set("callsign", controller.callsign)
            feature?.set("frequency", controller.frequency)
            feature?.set("atis", controller.atc_info)
            feature?.set("cid", controller.cid)
            centerLayer.getSource().addFeature(feature);
        } else if (controller.facility == 5) {
            // APP
            const tmp = controller.callsign.split("_");
            const callsign = tmp.slice(0, tmp.length - 1);
            const feature = approachFeatureMap.get(join(callsign, '_'))?.clone()
            feature?.set("isPilot", false)
            feature?.set("callsign", controller.callsign)
            feature?.set("frequency", controller.frequency)
            feature?.set("atis", controller.atc_info)
            feature?.set("cid", controller.cid)
            approachLayer.getSource().addFeature(feature);
        }
    })

    // 初始化弹出框
    initializePopup();

    // 添加点击事件处理
    setupClickHandler();

    interval = setInterval(async () => {
        await fetchWhazzupData();
        aircraftLayer.getSource().clear();
        onlineData.pilots.forEach(pilot => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([pilot.longitude, pilot.latitude])),
                isPilot: true,
                callsign: pilot.callsign,
                flightPlan: pilot.flight_plan,
                groundSpeed: pilot.ground_speed,
                altitude: pilot.altitude
            })

            feature.setStyle(createStyle(pilot.heading));
            aircraftLayer.getSource().addFeature(feature);
        });

        centerLayer.getSource().clear();
        approachLayer.getSource().clear();
        onlineData.controllers.forEach(controller => {
            if (controller.facility == 6) {
                // CTR
                const tmp = controller.callsign.split("_");
                const callsign = tmp.slice(0, tmp.length - 1);
                const feature = centerFeatureMap.get(join(callsign, '-'))?.clone()
                feature?.set("isPilot", false)
                feature?.set("callsign", controller.callsign)
                feature?.set("frequency", controller.frequency)
                feature?.set("atis", controller.atc_info)
                feature?.set("cid", controller.cid)
                centerLayer.getSource().addFeature(feature);
            } else if (controller.facility == 5) {
                // APP
                const tmp = controller.callsign.split("_");
                const callsign = tmp.slice(0, tmp.length - 1);
                const feature = approachFeatureMap.get(join(callsign, '-'))?.clone()
                feature?.set("isPilot", false)
                feature?.set("callsign", controller.callsign)
                feature?.set("frequency", controller.frequency)
                feature?.set("atis", controller.atc_info)
                feature?.set("cid", controller.cid)
                approachLayer.getSource().addFeature(feature);
            }
        })
    }, 15000)

});


const drawLine = async (callsign: string) => {
    if (lineFeature != null) {
        lineLayer.getSource().clear();
        lineFeature = null;
    }

    const response = (await request.get(`/clients/paths?callsign=${callsign}`)) as AxiosXHR<{
        latitude: number;
        longitude: number,
        altitude: number
    }[]>;
    if (response.status != 200) {
        showError("获取飞行路径失败")
        return;
    }

    const pointsData = response.data

    const coordinates = pointsData.map(point =>
        fromLonLat([point.longitude, point.latitude])
    );

    lineFeature = new Feature({geometry: new LineString(coordinates)});

    lineLayer.getSource().addFeature(lineFeature);
}


const removeLine = () => {
    if (lineFeature == null) {
        return
    }

    lineLayer.getSource().clear();
    lineFeature = null;
}

// 初始化弹出框
const initializePopup = () => {
    if (!map.value) return;

    const popupElement = document.getElementById('popup');
    if (!popupElement) return;

    popup.value = new Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        offset: [0, -40],
        autoPan: {
            animation: {
                duration: 250
            }
        }
    });

    map.value?.addOverlay(popup.value);
};

// 设置点击事件处理
const setupClickHandler = () => {
    if (!map.value) return;

    map.value?.on('click', async (event) => {
        // 关闭弹出框
        closePopup();

        // 获取点击的要素
        const feature = map.value?.forEachFeatureAtPixel(
            event.pixel,
            (feature) => feature
        );

        if (feature) {
            // 显示弹出框
            showPopup(feature, event.coordinate);
            const isPilot = feature.get("isPilot") as boolean;
            if (isPilot) {
                await drawLine(feature.get("callsign") as string);
            }

            // 阻止事件冒泡
            event.stopPropagation();
        } else {
            selectedFeature.value = null;
        }
    });
};

// 显示弹出框
const showPopup = (feature: Feature, coordinate: number[]) => {
    if (!popup.value) return;

    const isPilot = feature.get("isPilot") as boolean;
    if (isPilot) {
        const callsign = feature.get('callsign') as string;
        const flightPlan = feature.get('flightPlan') as FlightPlanModel;
        const groundSpeed = feature.get('groundSpeed') as number;
        const altitude = feature.get('altitude') as number;

        popupContent.value = `
            <h3>${callsign}</h3>
            <p>地速：${groundSpeed}kt</p>
            <p>高度：${altitude}ft</p>
          `;
    } else {
        const callsign = feature.get('callsign') as string;
        const frequency = (Number(feature.get('frequency')) / 1000).toFixed(3);
        const cid = feature.get('cid') as number;
        const atcInfo = join(feature.get('atis') as string[], '<br/>');

        popupContent.value = `
        <h3>${callsign}</h3>
        <p>频率: ${frequency}</p>
        <p>CID: ${cid}</p>
        <p>ATC-INFO: </p>
        <p>${atcInfo}</p>
        `
    }

    popup.value.setPosition(coordinate);
};

// 关闭弹出框
const closePopup = () => {
    if (popup.value) {
        popup.value.setPosition(undefined);
        removeLine();
    }
};

// 组件卸载时清理
onUnmounted(() => {
    if (map.value) {
        map.value.setTarget(undefined);
        map.value = null;
    }
    clearInterval(interval);
});

</script>

<template>
    <div class="map-wrapper">
        <div ref="mapContainer" id="map" class="map-container"></div>
        <div id="popup" class="ol-popup">
            <a href="#" id="popup-closer" class="ol-popup-closer" @click="closePopup">&times;</a>
            <div id="popup-content" v-html="popupContent"></div>
        </div>
        <div class="ol-switch">
            <el-radio-group v-model="selectedLayer">
                <el-radio value="OSM" label="OSM"/>
                <el-radio value="Mapbox" label="Mapbox" :disabled="!mapBoxAvailable"/>
            </el-radio-group>
        </div>
    </div>
</template>

<style scoped>
.map-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
}

.map-container {
    width: 100%;
    height: 100%;
}

.el-radio-group {
    flex-direction: column;
    align-items: flex-start;

    .el-radio {
        margin: 0;
    }
}

.ol-switch {
    position: absolute;
    top: .5em;
    left: .5em;
}

.ol-popup {
    position: absolute;
    background-color: white;
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #ccc;
    bottom: 12px;
    left: -50px;
    min-width: 200px;
}

.ol-popup-closer {
    position: absolute;
    top: 5px;
    right: 5px;
    text-decoration: none;
    color: #333;
    font-size: 1.2em;
}
</style>
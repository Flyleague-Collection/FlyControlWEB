import {defineStore} from "pinia";
import {Ref, ref} from "vue";

export const useServerConfigStore = defineStore("server-config-store", () => {
    const config: Ref<ServerConfig> = ref({
            limits: {
                username_length_min: 4,
                username_length_max: 16,
                password_length_min: 6,
                password_length_max: 64,
                email_length_min: 4,
                email_length_max: 64,
                cid_min: 1,
                cid_max: 9999,
                simulator_server: true
            },
            facilities: [
                {
                    id: 0,
                    short_name: "Pilot",
                    long_name: "Pilot"
                },
                {
                    id: 1,
                    short_name: "OBS",
                    long_name: "Observer"
                },
                {
                    id: 2,
                    short_name: "DEL",
                    long_name: "Clearance Delivery"
                },
                {
                    id: 3,
                    short_name: "GND",
                    long_name: "Ground"
                },
                {
                    id: 4,
                    short_name: "TWR",
                    long_name: "Tower"
                },
                {
                    id: 5,
                    short_name: "APP",
                    long_name: "Approach/Departure"
                },
                {
                    id: 6,
                    short_name: "CTR",
                    long_name: "Enroute"
                },
                {
                    id: 7,
                    short_name: "FSS",
                    long_name: "Flight Service Station"
                }
            ],
            ratings: [
                {
                    id: -1,
                    short_name: "Baned",
                    long_name: "Suspended"
                },
                {
                    id: 0,
                    short_name: "Normal",
                    long_name: "Normal"
                },
                {
                    id: 1,
                    short_name: "OBS",
                    long_name: "Observer"
                },
                {
                    id: 2,
                    short_name: "S1",
                    long_name: "Tower Trainee"
                },
                {
                    id: 3,
                    short_name: "S2",
                    long_name: "Tower Controller"
                },
                {
                    id: 4,
                    short_name: "S3",
                    long_name: "Senior Student"
                },
                {
                    id: 5,
                    short_name: "C1",
                    long_name: "Enroute Controller"
                },
                {
                    id: 6,
                    short_name: "C2",
                    long_name: "Controller 2 (not in use)"
                },
                {
                    id: 7,
                    short_name: "C3",
                    long_name: "Senior Controller"
                },
                {
                    id: 8,
                    short_name: "I1",
                    long_name: "Instructor"
                },
                {
                    id: 9,
                    short_name: "I2",
                    long_name: "Instructor 2 (not in use)"
                },
                {
                    id: 10,
                    short_name: "I3",
                    long_name: "Senior Instructor"
                },
                {
                    id: 11,
                    short_name: "SUP",
                    long_name: "Supervisor"
                },
                {
                    id: 12,
                    short_name: "ADM",
                    long_name: "Administrator"
                }
            ]
        }
    )

    return {config, ratings: config.value.ratings, facilities: config.value.facilities}
})

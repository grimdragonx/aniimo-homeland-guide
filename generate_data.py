import json
import csv
import os

data = [
    {
        "id": "001",
        "name": "Emberpup",
        "stage": "Lumin",
        "primary_element": "Fire",
        "secondary_element": None,
        "evolution_line": "Emberpup -> Flameruff -> Scorchhowl / Inferlupa",
        "best_role": "Early-game Campfire Cooking & Smelting",
        "forms": {
            "basic": {
                "name": "Emberpup (Standard)",
                "element": "Fire",
                "condition": "Default / Sunny",
                "abilities": {"Fire": 1, "Carry": 1},
                "perk": "Reliable starter kitchen helper with low hunger drain."
            },
            "weather": [
                {
                    "name": "Emberpup (Heatwave)",
                    "element": "Fire",
                    "condition": "Heatwave / Drought",
                    "abilities": {"Fire": 2, "Artisanship": 1},
                    "perk": "Furnace and cooking speeds increased by 20% during intense heat."
                }
            ],
            "prismana": {
                "name": "Prismana Emberpup",
                "element": "Fire / Light",
                "condition": "Prismana Flow weather or Prismana Pact",
                "abilities": {"Fire": 2, "Light": 1, "Carry": 1},
                "perk": "Prismatic Ember: +15% cooking speed and cooks don't burn even when unattended."
            }
        }
    },
    {
        "id": "002",
        "name": "Flameruff",
        "stage": "Gamma",
        "primary_element": "Fire",
        "secondary_element": None,
        "evolution_line": "Emberpup -> Flameruff -> Scorchhowl / Inferlupa",
        "best_role": "Mid-tier Smeltery, Metalworking & Fast Transport",
        "forms": {
            "basic": {
                "name": "Flameruff (Standard)",
                "element": "Fire",
                "condition": "Default",
                "abilities": {"Fire": 2, "Artisanship": 1, "Carry": 2},
                "perk": "Handles both continuous kiln firing and transporting refined bars to storage."
            },
            "weather": [
                {
                    "name": "Flameruff (Thunderstorm)",
                    "element": "Fire / Lightning",
                    "condition": "Thunderstorm",
                    "abilities": {"Fire": 2, "Lightning": 1, "Carry": 2},
                    "perk": "Provides backup electrical charge while maintaining forge heat."
                }
            ],
            "prismana": {
                "name": "Prismana Flameruff",
                "element": "Fire / Light",
                "condition": "Prismana Flow event or Crystal Trigger",
                "abilities": {"Fire": 3, "Artisanship": 2, "Carry": 2},
                "perk": "Prismatic Flame: +20% bonus ingots per smelt cycle and reduced fuel consumption."
            }
        }
    },
    {
        "id": "003",
        "name": "Scorchhowl",
        "stage": "Nova",
        "primary_element": "Fire",
        "secondary_element": None,
        "evolution_line": "Emberpup -> Flameruff -> Scorchhowl",
        "best_role": "High-Volume Metallurgy & High-Tier Crafting",
        "forms": {
            "basic": {
                "name": "Scorchhowl (Standard)",
                "element": "Fire",
                "condition": "Default",
                "abilities": {"Fire": 3, "Artisanship": 2, "Carry": 2},
                "perk": "Master smelter capable of maintaining blast furnace temperatures uninterrupted."
            },
            "weather": [
                {
                    "name": "Scorchhowl (Thunderstorm)",
                    "element": "Fire / Lightning",
                    "condition": "Thunderstorm in Beast Fang Ridge",
                    "abilities": {"Fire": 3, "Lightning": 2, "Carry": 3},
                    "perk": "Overcharged Forge: Dual smelting and automated electric machinery driving."
                }
            ],
            "prismana": {
                "name": "Prismana Scorchhowl",
                "element": "Fire / Light",
                "condition": "Prismana Flow weather (Beast Fang Ridge)",
                "abilities": {"Fire": 4, "Lightning": 2, "Artisanship": 3},
                "perk": "Blazing Foundry: +30% smelting speed, -25% stamina drain; chance to double alloy output."
            }
        }
    },
    {
        "id": "004",
        "name": "Inferlupa",
        "stage": "Nova",
        "primary_element": "Fire",
        "secondary_element": "Dark",
        "evolution_line": "Emberpup -> Flameruff -> Inferlupa",
        "best_role": "Night-Shift Smeltery, Dark Transmutation & Kiln Operations",
        "forms": {
            "basic": {
                "name": "Inferlupa (Standard)",
                "element": "Fire / Dark",
                "condition": "Default",
                "abilities": {"Fire": 3, "Dark": 2, "Artisanship": 2},
                "perk": "Night worker: does not lose sanity or efficiency when working overnight shifts."
            },
            "weather": [
                {
                    "name": "Inferlupa (Blood Moon / Eclipse)",
                    "element": "Fire / Dark",
                    "condition": "Night / Eclipse Weather",
                    "abilities": {"Fire": 3, "Dark": 3, "Artisanship": 2},
                    "perk": "Shadow Forge: Dark catalyst refining speed increased by 35% during moonlit hours."
                }
            ],
            "prismana": {
                "name": "Prismana Inferlupa",
                "element": "Fire / Dark / Prismatic",
                "condition": "Special Prismana In-game Event",
                "abilities": {"Fire": 4, "Dark": 3, "Artisanship": 3},
                "perk": "Prismatic Nether: 100% nocturnal uptime; +25% dark material conversion speed; never slacks."
            }
        }
    },
    {
        "id": "005",
        "name": "Celestis",
        "stage": "Lumin",
        "primary_element": "Dark",
        "secondary_element": None,
        "evolution_line": "Celestis -> Stellarys",
        "best_role": "Homeland Morale Maintenance & Quiet Night Gathering",
        "forms": {
            "basic": {
                "name": "Celestis (Standard)",
                "element": "Dark",
                "condition": "Default",
                "abilities": {"Dark": 1, "Leisure": 1},
                "perk": "Comforting presence: gently lowers fatigue of nearby working Aniimo."
            },
            "weather": [
                {
                    "name": "Celestis (Moonlit / Clear Night)",
                    "element": "Dark",
                    "condition": "Clear Night",
                    "abilities": {"Dark": 2, "Leisure": 2},
                    "perk": "Moonlight Serenade: Increases sanity regeneration in sleeping quarters by 20%."
                }
            ],
            "prismana": {
                "name": "Prismana Celestis",
                "element": "Dark / Light",
                "condition": "Prismana Flow weather",
                "abilities": {"Dark": 2, "Light": 1, "Leisure": 2},
                "perk": "Astral Rest: Restores base worker morale +15% and increases Bud Ticket generation."
            }
        }
    },
    {
        "id": "006",
        "name": "Stellarys",
        "stage": "Gamma",
        "primary_element": "Dark",
        "secondary_element": None,
        "evolution_line": "Celestis -> Stellarys",
        "best_role": "High-Tier Morale Station & Long-Distance Night Hauling",
        "forms": {
            "basic": {
                "name": "Stellarys (Standard)",
                "element": "Dark",
                "condition": "Default",
                "abilities": {"Dark": 2, "Leisure": 2, "Carry": 1},
                "perk": "Manages recreational zones and keeps worker contentment high across the camp."
            },
            "weather": [
                {
                    "name": "Stellarys (Rainstorm)",
                    "element": "Dark / Water",
                    "condition": "Rainstorm",
                    "abilities": {"Dark": 2, "Water": 2, "Leisure": 2},
                    "perk": "Starlit Rain: Waters crops while maintaining worker morale during storms."
                }
            ],
            "prismana": {
                "name": "Prismana Stellarys",
                "element": "Dark / Light",
                "condition": "Prismana Flow weather",
                "abilities": {"Dark": 3, "Light": 2, "Leisure": 3},
                "perk": "Celestial Harmony: Homeland overall production speed +10% globally when assigned to Leisure."
            }
        }
    },
    {
        "id": "007",
        "name": "Chirpi",
        "stage": "Lumin",
        "primary_element": "Wind",
        "secondary_element": None,
        "evolution_line": "Chirpi -> Tromber / Cornet / Tubster",
        "best_role": "Early Farm Seeding, Wind Gathering & Light Logistics",
        "forms": {
            "basic": {
                "name": "Chirpi (Standard)",
                "element": "Wind",
                "condition": "Default",
                "abilities": {"Wind": 1, "Grass": 1, "Carry": 1},
                "perk": "Quick flyer that picks up dropped crop seeds and deposits them in seed bins."
            },
            "weather": [
                {
                    "name": "Chirpi (Rainstorm)",
                    "element": "Wind / Water",
                    "condition": "Rainstorm",
                    "abilities": {"Wind": 1, "Water": 1, "Grass": 1},
                    "perk": "Light rain boosts seed germination speed when Chirpi tends the patch."
                }
            ],
            "prismana": {
                "name": "Prismana Chirpi",
                "element": "Wind / Grass",
                "condition": "Prismana Flow or Hatchinator rare roll",
                "abilities": {"Wind": 2, "Grass": 2, "Leisure": 2},
                "perk": "Breezy Melodies: Speeds up crop growth cycle by 10% across all adjacent garden plots."
            }
        }
    },
    {
        "id": "008",
        "name": "Tromber",
        "stage": "Nova",
        "primary_element": "Wind",
        "secondary_element": None,
        "evolution_line": "Chirpi -> Tromber",
        "best_role": "Camp-Wide Morale Buffs & Advanced Wind Power",
        "forms": {
            "basic": {
                "name": "Tromber (Standard)",
                "element": "Wind",
                "condition": "Default",
                "abilities": {"Wind": 3, "Leisure": 3, "Carry": 2},
                "perk": "Horn Resonance: Periodically sounds a chime that prevents work exhaustion in nearby workers."
            },
            "weather": [
                {
                    "name": "Tromber (Rainstorm)",
                    "element": "Wind / Water",
                    "condition": "Rainstorm / Thunderstorm",
                    "abilities": {"Wind": 3, "Water": 2, "Leisure": 3},
                    "perk": "Storm Chime: Fully prevents negative wet/damp mood debuffs on outdoor workers."
                }
            ],
            "prismana": {
                "name": "Prismana Tromber",
                "element": "Wind / Light",
                "condition": "Prismana Flow weather",
                "abilities": {"Wind": 4, "Water": 2, "Leisure": 4},
                "perk": "Brass Anthem: +25% morale recovery and doubles Bud Ticket drops from recreational activities."
            }
        }
    },
    {
        "id": "009",
        "name": "Cornet",
        "stage": "Nova",
        "primary_element": "Wind",
        "secondary_element": None,
        "evolution_line": "Chirpi -> Cornet",
        "best_role": "High-Speed Windmill Operation, Grain Milling & Artisan Benches",
        "forms": {
            "basic": {
                "name": "Cornet (Standard)",
                "element": "Wind",
                "condition": "Default",
                "abilities": {"Wind": 3, "Artisanship": 2, "Carry": 2},
                "perk": "High air current precision that speeds up grain grinding and cloth looms."
            },
            "weather": [
                {
                    "name": "Cornet (Highland Gale)",
                    "element": "Wind / Lightning",
                    "condition": "Highland Storm / High Winds",
                    "abilities": {"Wind": 4, "Lightning": 1, "Artisanship": 2},
                    "perk": "Aerodynamic Precision: Windmills produce 50% more flour and textiles per minute."
                }
            ],
            "prismana": {
                "name": "Prismana Cornet",
                "element": "Wind / Light",
                "condition": "Prismana Flow weather",
                "abilities": {"Wind": 4, "Light": 2, "Artisanship": 3},
                "perk": "Resonant Gust: +30% mill output and +20% bench assembly speed across all blueprints."
            }
        }
    },
    {
        "id": "010",
        "name": "Tubster",
        "stage": "Nova",
        "primary_element": "Wind",
        "secondary_element": "Earth",
        "evolution_line": "Chirpi -> Tubster",
        "best_role": "Heavy Weight Cargo Transport & Excavation Site Clearing",
        "forms": {
            "basic": {
                "name": "Tubster (Standard)",
                "element": "Wind / Earth",
                "condition": "Default",
                "abilities": {"Wind": 3, "Earth": 2, "Carry": 3},
                "perk": "Heavy Lifter: Can transport entire stacks of heavy stones and timber in a single trip."
            },
            "weather": [
                {
                    "name": "Tubster (Sandstorm)",
                    "element": "Earth / Wind",
                    "condition": "Sandstorm in Arid Bluffs",
                    "abilities": {"Earth": 3, "Wind": 2, "Carry": 3},
                    "perk": "Grounded Force: Immune to weather slow-down, quarry clearing speed +25%."
                }
            ],
            "prismana": {
                "name": "Prismana Tubster",
                "element": "Wind / Earth / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Wind": 3, "Earth": 3, "Carry": 4},
                "perk": "Titan Porter: +50% carry capacity; clears Homeland transport backlogs instantly."
            }
        }
    },
    {
        "id": "011",
        "name": "Nimbi",
        "stage": "Lumin",
        "primary_element": "Wind",
        "secondary_element": "Water",
        "evolution_line": "Nimbi -> Turbo / Dreaple",
        "best_role": "Early Garden Irrigation & Water Bucket Transport",
        "forms": {
            "basic": {
                "name": "Nimbi (Standard)",
                "element": "Wind / Water",
                "condition": "Default",
                "abilities": {"Wind": 1, "Water": 1, "Carry": 1},
                "perk": "Gentle Cloud: Hovers effortlessly over farm plots to water freshly planted seeds."
            },
            "weather": [
                {
                    "name": "Nimbi (Rainstorm)",
                    "element": "Water / Wind",
                    "condition": "Rainstorm",
                    "abilities": {"Water": 2, "Wind": 1, "Carry": 1},
                    "perk": "Soaking Mist: Waters all tiles in a 3x3 radius simultaneously."
                }
            ],
            "prismana": {
                "name": "Prismana Nimbi",
                "element": "Water / Wind / Light",
                "condition": "Prismana Flow weather",
                "abilities": {"Water": 2, "Wind": 2, "Perfumery": 1},
                "perk": "Cloud Dew: +20% watering efficiency; watered crops gain higher base quality rating."
            }
        }
    },
    {
        "id": "012",
        "name": "Turbo",
        "stage": "Gamma",
        "primary_element": "Wind",
        "secondary_element": "Lightning",
        "evolution_line": "Nimbi -> Turbo",
        "best_role": "Electrical Grid Power Generation & Assembly Lines",
        "forms": {
            "basic": {
                "name": "Turbo (Standard)",
                "element": "Wind / Lightning",
                "condition": "Default",
                "abilities": {"Lightning": 2, "Wind": 2, "Artisanship": 1},
                "perk": "High RPM dynamo turning: powers electrical generators and automated sorters."
            },
            "weather": [
                {
                    "name": "Turbo (Thunderstorm)",
                    "element": "Lightning / Wind",
                    "condition": "Thunderstorm",
                    "abilities": {"Lightning": 3, "Wind": 2, "Artisanship": 2},
                    "perk": "Capacitor Surge: Doubled electrical power output during storms; powers grid for free."
                }
            ],
            "prismana": {
                "name": "Prismana Turbo",
                "element": "Lightning / Wind / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Lightning": 3, "Wind": 3, "Artisanship": 2},
                "perk": "Overclock Generator: +35% continuous electricity generation; machines run 15% faster."
            }
        }
    },
    {
        "id": "013",
        "name": "Dreaple",
        "stage": "Gamma",
        "primary_element": "Wind",
        "secondary_element": "Dark",
        "evolution_line": "Nimbi -> Dreaple",
        "best_role": "Homeland Perfumery, Scent Alchemy & Sleep Enhancements",
        "forms": {
            "basic": {
                "name": "Dreaple (Standard)",
                "element": "Wind / Dark",
                "condition": "Default",
                "abilities": {"Dark": 2, "Wind": 2, "Perfumery": 2},
                "perk": "Distills fragrant sleeping mists and high-grade essences at the Perfumery station."
            },
            "weather": [
                {
                    "name": "Dreaple (Misty Fog)",
                    "element": "Dark / Wind",
                    "condition": "Fog / Overcast",
                    "abilities": {"Dark": 2, "Wind": 2, "Perfumery": 3},
                    "perk": "Dream Vapor: Perfumery brew time shortened by 30% under heavy fog."
                }
            ],
            "prismana": {
                "name": "Prismana Dreaple",
                "element": "Dark / Wind / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Dark": 3, "Wind": 3, "Perfumery": 3},
                "perk": "Dream Essence: +25% potion/incense yield; scents created increase whole RV work speed."
            }
        }
    },
    {
        "id": "014",
        "name": "Budsquire",
        "stage": "Lumin",
        "primary_element": "Grass",
        "secondary_element": None,
        "evolution_line": "Budsquire -> Thornblade / Melloblum",
        "best_role": "Early Farm Sowing, Weeding & Garden Planting",
        "forms": {
            "basic": {
                "name": "Budsquire (Standard)",
                "element": "Grass",
                "condition": "Default",
                "abilities": {"Grass": 1, "Water": 1, "Artisanship": 1},
                "perk": "Planting specialist: digs holes and seeds soil plots with high care."
            },
            "weather": [
                {
                    "name": "Budsquire (Rainstorm)",
                    "element": "Grass / Water",
                    "condition": "Rainstorm",
                    "abilities": {"Grass": 2, "Water": 2},
                    "perk": "Sprout Rush: Dual sowing and watering immediately after rainfall."
                }
            ],
            "prismana": {
                "name": "Prismana Budsquire",
                "element": "Grass / Light",
                "condition": "Prismana Flow weather",
                "abilities": {"Grass": 2, "Water": 2, "Artisanship": 2},
                "perk": "Budding Sprout: +15% crop harvest yield and faster seedling establishment."
            }
        }
    },
    {
        "id": "015",
        "name": "Thornblade",
        "stage": "Gamma",
        "primary_element": "Grass",
        "secondary_element": "Earth",
        "evolution_line": "Budsquire -> Thornblade",
        "best_role": "Lumber Yard Logging, Tree Pruning & Advanced Planters",
        "forms": {
            "basic": {
                "name": "Thornblade (Standard)",
                "element": "Grass / Earth",
                "condition": "Default",
                "abilities": {"Grass": 2, "Earth": 1, "Artisanship": 2},
                "perk": "Sharp vine blades chop timber and trim farm hedges at rapid speed."
            },
            "weather": [
                {
                    "name": "Thornblade (Rainstorm)",
                    "element": "Grass / Water",
                    "condition": "Rainstorm",
                    "abilities": {"Grass": 3, "Water": 1, "Artisanship": 2},
                    "perk": "Overgrowth: Wood production from homeland logging stations increased by 30%."
                }
            ],
            "prismana": {
                "name": "Prismana Thornblade",
                "element": "Grass / Earth / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Grass": 3, "Earth": 2, "Artisanship": 3},
                "perk": "Rapid Flora: +25% logging output; crafts wooden furniture and crates with 20% less timber."
            }
        }
    },
    {
        "id": "016",
        "name": "Melloblum",
        "stage": "Nova",
        "primary_element": "Grass",
        "secondary_element": None,
        "evolution_line": "Budsquire -> Melloblum",
        "best_role": "Top-Tier Organic Farming, Master Perfumery & Bud Coin Farming",
        "forms": {
            "basic": {
                "name": "Melloblum (Standard)",
                "element": "Grass",
                "condition": "Default",
                "abilities": {"Grass": 3, "Perfumery": 3, "Leisure": 2},
                "perk": "Nectar Bloom: Harvests exquisite flowers and crafts top-tier luxury botanical oils."
            },
            "weather": [
                {
                    "name": "Melloblum (Sunny / Floral Bloom)",
                    "element": "Grass",
                    "condition": "Sunny Weather / Spring",
                    "abilities": {"Grass": 4, "Perfumery": 3, "Leisure": 3},
                    "perk": "Pollination Wave: Triples crop mutation chances into high-star gourmet variants."
                }
            ],
            "prismana": {
                "name": "Prismana Melloblum",
                "element": "Grass / Light / Prismatic",
                "condition": "Special Prismana In-game Event",
                "abilities": {"Grass": 4, "Perfumery": 4, "Leisure": 3},
                "perk": "Sweet Nectar: Doubles fertilizer efficacy; periodically gifts extra Bud Tickets directly to base inventory."
            }
        }
    },
    {
        "id": "017",
        "name": "Bonesky",
        "stage": "Lumin",
        "primary_element": "Ice",
        "secondary_element": "Dark",
        "evolution_line": "Bonesky -> Fenrier -> Glynsera",
        "best_role": "Early Cold Storage Food Preservation & Night Carrying",
        "forms": {
            "basic": {
                "name": "Bonesky (Standard)",
                "element": "Ice / Dark",
                "condition": "Default",
                "abilities": {"Ice": 1, "Dark": 1, "Carry": 1},
                "perk": "Chilling presence: prevents raw food spoilage in low-tier coolers."
            },
            "weather": [
                {
                    "name": "Bonesky (Nighttime / Blizzard)",
                    "element": "Ice / Dark",
                    "condition": "Night or Blizzard",
                    "abilities": {"Ice": 2, "Dark": 2, "Carry": 1},
                    "perk": "Frost Howl: Preserves ice boxes twice as long with zero melt rate."
                }
            ],
            "prismana": {
                "name": "Prismana Bonesky",
                "element": "Ice / Dark / Light",
                "condition": "Prismana Flow weather",
                "abilities": {"Ice": 2, "Dark": 2, "Artisanship": 2},
                "perk": "Frost Bone: +15% cold tool crafting speed; preserves ingredients without consuming ice."
            }
        }
    },
    {
        "id": "018",
        "name": "Fenrier",
        "stage": "Gamma",
        "primary_element": "Ice",
        "secondary_element": None,
        "evolution_line": "Bonesky -> Fenrier -> Glynsera",
        "best_role": "Refrigeration Station Maintenance & Heavy Snow Hauling",
        "forms": {
            "basic": {
                "name": "Fenrier (Standard)",
                "element": "Ice",
                "condition": "Default",
                "abilities": {"Ice": 2, "Carry": 2, "Earth": 1},
                "perk": "Sturdy hound that keeps multiple industrial freezer units chilled simultaneously."
            },
            "weather": [
                {
                    "name": "Fenrier (Snowfield)",
                    "element": "Ice",
                    "condition": "Snowfield Weather",
                    "abilities": {"Ice": 3, "Carry": 2, "Earth": 1},
                    "perk": "Sub-zero Endurance: Speed increases by 25% across cold outdoor zones."
                }
            ],
            "prismana": {
                "name": "Prismana Fenrier",
                "element": "Ice / Earth / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Ice": 3, "Earth": 2, "Carry": 3},
                "perk": "Glacier Prowl: +25% transport speed and +20% output when operating ice crushers."
            }
        }
    },
    {
        "id": "019",
        "name": "Glynsera",
        "stage": "Nova",
        "primary_element": "Ice",
        "secondary_element": None,
        "evolution_line": "Bonesky -> Fenrier -> Glynsera",
        "best_role": "Master Cryo Preservation, Ice Sculpting & Zero-Spoilage Hub",
        "forms": {
            "basic": {
                "name": "Glynsera (Standard)",
                "element": "Ice",
                "condition": "Default",
                "abilities": {"Ice": 3, "Artisanship": 2, "Leisure": 2},
                "perk": "Deep Freeze Master: Halts decay timer entirely for all foods stored in connected RV pantries."
            },
            "weather": [
                {
                    "name": "Glynsera (Blizzard)",
                    "element": "Ice",
                    "condition": "Snowfield / Blizzard",
                    "abilities": {"Ice": 4, "Artisanship": 2, "Leisure": 2},
                    "perk": "Arctic Domain: Automatically keeps entire Homeland food reserve chilled without dedicated ice."
                }
            ],
            "prismana": {
                "name": "Prismana Glynsera",
                "element": "Ice / Light / Prismatic",
                "condition": "Special Prismana In-game Event",
                "abilities": {"Ice": 4, "Light": 2, "Artisanship": 3},
                "perk": "Prismatic Cryo: Never sleeps or tires at cooling stations; provides +30% cooling speed."
            }
        }
    },
    {
        "id": "020",
        "name": "Baleetle",
        "stage": "Lumin",
        "primary_element": "Earth",
        "secondary_element": None,
        "evolution_line": "Baleetle -> Waleetle / Bouldus",
        "best_role": "Early Quarry Mining, Stone Smashing & Brick Making",
        "forms": {
            "basic": {
                "name": "Baleetle (Standard)",
                "element": "Earth",
                "condition": "Default",
                "abilities": {"Earth": 1, "Carry": 1, "Artisanship": 1},
                "perk": "Hard horn breaks surface boulders and hauls stone fragments to masonry tables."
            },
            "weather": [
                {
                    "name": "Baleetle (Sandstorm)",
                    "element": "Earth",
                    "condition": "Sandstorm",
                    "abilities": {"Earth": 2, "Carry": 1},
                    "perk": "Sand Drill: 25% faster mining rate when dust storms blow."
                }
            ],
            "prismana": {
                "name": "Prismana Baleetle",
                "element": "Earth / Light",
                "condition": "Prismana Flow weather",
                "abilities": {"Earth": 2, "Carry": 2, "Artisanship": 2},
                "perk": "Sturdy Shell: Mining durability doubled; +20% bonus cobblestone and clay."
            }
        }
    },
    {
        "id": "021",
        "name": "Waleetle",
        "stage": "Nova",
        "primary_element": "Earth",
        "secondary_element": None,
        "evolution_line": "Baleetle -> Waleetle",
        "best_role": "Master Masonry, Rare Gem Polishing & Precision Construction",
        "forms": {
            "basic": {
                "name": "Waleetle (Standard)",
                "element": "Earth",
                "condition": "Default",
                "abilities": {"Earth": 3, "Artisanship": 3, "Carry": 2},
                "perk": "Artisan carver: turns raw rock into high-tier RV upgrade components and architectural tiles."
            },
            "weather": [
                {
                    "name": "Waleetle (Snowfield)",
                    "element": "Earth / Ice",
                    "condition": "Snowfield in Berylline Vale",
                    "abilities": {"Earth": 3, "Ice": 2, "Artisanship": 3},
                    "perk": "Frost Chiseling: Gemstone polishing yields higher quality jewelry components."
                }
            ],
            "prismana": {
                "name": "Prismana Waleetle",
                "element": "Earth / Prismatic",
                "condition": "Special Prismana In-game Event",
                "abilities": {"Earth": 4, "Artisanship": 3, "Carry": 3},
                "perk": "Core Excavator: +40% rare ore extraction rate and +25% building construction speed."
            }
        }
    },
    {
        "id": "022",
        "name": "Bouldus",
        "stage": "Nova",
        "primary_element": "Earth",
        "secondary_element": None,
        "evolution_line": "Baleetle -> Bouldus",
        "best_role": "Maximum Quarry Extraction & Heavy Bulk Transport",
        "forms": {
            "basic": {
                "name": "Bouldus (Standard)",
                "element": "Earth",
                "condition": "Default",
                "abilities": {"Earth": 4, "Carry": 3},
                "perk": "Living quarry hammer: pulverizes heavy ore veins faster than any regular tool."
            },
            "weather": [
                {
                    "name": "Bouldus (Sandstorm)",
                    "element": "Earth / Fire",
                    "condition": "Sandstorm",
                    "abilities": {"Earth": 4, "Fire": 1, "Carry": 3},
                    "perk": "Friction Crusher: Naturally smelts low-tier stone into bricks as it breaks them."
                }
            ],
            "prismana": {
                "name": "Prismana Bouldus",
                "element": "Earth / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Earth": 5, "Carry": 3},
                "perk": "Titan Quarry: Highest base mining speed in Aniimo; virtually unbreakable morale."
            }
        }
    },
    {
        "id": "023",
        "name": "Skippy",
        "stage": "Lumin",
        "primary_element": "Water",
        "secondary_element": None,
        "evolution_line": "Skippy -> Pranky -> Glacy / Leafy",
        "best_role": "Early Plot Irrigation & Pond Maintenance",
        "forms": {
            "basic": {
                "name": "Skippy (Standard)",
                "element": "Water",
                "condition": "Default",
                "abilities": {"Water": 1, "Carry": 1},
                "perk": "Playful hopper that fills homeland water troughs and hydrates seedlings."
            },
            "weather": [
                {
                    "name": "Skippy (Rainstorm)",
                    "element": "Water",
                    "condition": "Rainstorm",
                    "abilities": {"Water": 2, "Carry": 1},
                    "perk": "Rain Dance: Extends soil moisture retention duration by 50%."
                }
            ],
            "prismana": {
                "name": "Prismana Skippy",
                "element": "Water / Grass",
                "condition": "Prismana Flow weather",
                "abilities": {"Water": 2, "Grass": 1, "Carry": 2},
                "perk": "Spring Splash: +15% farm irrigation speed and waters adjacent soil plots automatically."
            }
        }
    },
    {
        "id": "024",
        "name": "Pranky",
        "stage": "Gamma",
        "primary_element": "Water",
        "secondary_element": None,
        "evolution_line": "Skippy -> Pranky -> Glacy / Leafy",
        "best_role": "Mid-Tier Irrigation, Brewing & Homeland Beverage Crafting",
        "forms": {
            "basic": {
                "name": "Pranky (Standard)",
                "element": "Water",
                "condition": "Default",
                "abilities": {"Water": 2, "Artisanship": 2, "Leisure": 1},
                "perk": "Clever worker that brews juices, fills water tanks, and keeps watering automated."
            },
            "weather": [
                {
                    "name": "Pranky (Thunderstorm)",
                    "element": "Water / Lightning",
                    "condition": "Thunderstorm",
                    "abilities": {"Water": 2, "Lightning": 1, "Artisanship": 2},
                    "perk": "Electrolyzed Water: Boosts growth speed of water-loving crops by 25%."
                }
            ],
            "prismana": {
                "name": "Prismana Pranky",
                "element": "Water / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Water": 3, "Artisanship": 2, "Leisure": 2},
                "perk": "Fluid Craft: +20% beverage and potion production speed; provides amusement to base."
            }
        }
    },
    {
        "id": "025",
        "name": "Glacy",
        "stage": "Nova",
        "primary_element": "Water",
        "secondary_element": "Ice",
        "evolution_line": "Skippy -> Pranky -> Glacy",
        "best_role": "Dual High-Volume Irrigation & Cold Storage Preservation",
        "forms": {
            "basic": {
                "name": "Glacy (Standard)",
                "element": "Water / Ice",
                "condition": "Default",
                "abilities": {"Water": 3, "Ice": 3, "Leisure": 2},
                "perk": "Versatile worker that seamlessly switches between crop watering and chilling food stores."
            },
            "weather": [
                {
                    "name": "Glacy (Snowfield)",
                    "element": "Ice / Water",
                    "condition": "Snowfield Weather",
                    "abilities": {"Ice": 4, "Water": 2, "Leisure": 2},
                    "perk": "Permafrost: Freezes storage bins indefinitely with zero power or ice block drain."
                }
            ],
            "prismana": {
                "name": "Prismana Glacy",
                "element": "Water / Ice / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Water": 4, "Ice": 4, "Leisure": 3},
                "perk": "Crystal Springs: Irrigation water grants frost-resistance to delicate exotic crops."
            }
        }
    },
    {
        "id": "026",
        "name": "Leafy",
        "stage": "Nova",
        "primary_element": "Water",
        "secondary_element": "Grass",
        "evolution_line": "Skippy -> Pranky -> Leafy",
        "best_role": "All-in-One Automated Farm Overseer (Planting + Watering + Gathering)",
        "forms": {
            "basic": {
                "name": "Leafy (Standard)",
                "element": "Water / Grass",
                "condition": "Default",
                "abilities": {"Water": 3, "Grass": 3, "Perfumery": 2},
                "perk": "The ultimate crop caretaker: plants seeds, waters beds, and extracts botanical oils."
            },
            "weather": [
                {
                    "name": "Leafy (Rainstorm)",
                    "element": "Water / Grass",
                    "condition": "Rainstorm",
                    "abilities": {"Water": 4, "Grass": 3, "Perfumery": 2},
                    "perk": "Monsoon Bloom: Crops mature in half the regular time during heavy downpours."
                }
            ],
            "prismana": {
                "name": "Prismana Leafy",
                "element": "Water / Grass / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Water": 4, "Grass": 4, "Perfumery": 3},
                "perk": "Miracle Bloom: +50% crop maturation speed and chance for triple rare crop drops."
            }
        }
    },
    {
        "id": "027",
        "name": "Pomegg",
        "stage": "Lumin",
        "primary_element": "Grass",
        "secondary_element": "Light",
        "evolution_line": "Pomegg -> Dazmand / Pomawk",
        "best_role": "Hatchinator Egg Warming & Homeland Morning Energy",
        "forms": {
            "basic": {
                "name": "Pomegg (Standard)",
                "element": "Grass / Light",
                "condition": "Default",
                "abilities": {"Grass": 1, "Light": 1, "Leisure": 1},
                "perk": "Nest warmer: placing Pomegg near Hatchinators speeds up egg incubation slightly."
            },
            "weather": [
                {
                    "name": "Pomegg (Sunny)",
                    "element": "Light / Grass",
                    "condition": "Sunny Weather",
                    "abilities": {"Light": 2, "Grass": 1, "Leisure": 1},
                    "perk": "Solar Yolk: Egg incubation speed increased by 15% under direct sunlight."
                }
            ],
            "prismana": {
                "name": "Prismana Pomegg",
                "element": "Light / Grass / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Light": 2, "Grass": 2, "Leisure": 2},
                "perk": "Sunshine Warmth: +20% Hatchinator incubation speed and guarantees positive hatchling traits."
            }
        }
    },
    {
        "id": "028",
        "name": "Dazmand",
        "stage": "Nova",
        "primary_element": "Light",
        "secondary_element": "Earth",
        "evolution_line": "Pomegg -> Dazmand",
        "best_role": "High-Value Jewelry Crafting, Relic Restoration & Base Illumination",
        "forms": {
            "basic": {
                "name": "Dazmand (Standard)",
                "element": "Light / Earth",
                "condition": "Default",
                "abilities": {"Light": 3, "Earth": 3, "Artisanship": 2},
                "perk": "Master jeweler: converts mined gems into high-selling artifacts for Bud Coins."
            },
            "weather": [
                {
                    "name": "Dazmand (Sunny)",
                    "element": "Light / Earth",
                    "condition": "Sunny Weather",
                    "abilities": {"Light": 4, "Earth": 3, "Artisanship": 2},
                    "perk": "Solar Refraction: Illuminates the entire base plot, preventing darkness productivity penalties."
                }
            ],
            "prismana": {
                "name": "Prismana Dazmand",
                "element": "Light / Earth / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Light": 4, "Earth": 4, "Artisanship": 3},
                "perk": "Prismatic Jewel: +35% jewelry crafting speed; relics sell for +25% bonus Bud Coins."
            }
        }
    },
    {
        "id": "029",
        "name": "Pomawk",
        "stage": "Nova",
        "primary_element": "Grass",
        "secondary_element": "Wind",
        "evolution_line": "Pomegg -> Pomawk",
        "best_role": "High-Speed Crop Harvester & Barn Storage Logistics",
        "forms": {
            "basic": {
                "name": "Pomawk (Standard)",
                "element": "Grass / Wind",
                "condition": "Default",
                "abilities": {"Grass": 3, "Wind": 3, "Carry": 2},
                "perk": "Swoops across fields to immediately reap ripe crops and fly them to farm silos."
            },
            "weather": [
                {
                    "name": "Pomawk (Storm)",
                    "element": "Wind / Grass",
                    "condition": "High Wind / Storm",
                    "abilities": {"Wind": 4, "Grass": 2, "Carry": 2},
                    "perk": "Gale Swoop: Harvest speed doubled when outdoor air speed is elevated."
                }
            ],
            "prismana": {
                "name": "Prismana Pomawk",
                "element": "Grass / Wind / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Grass": 4, "Wind": 4, "Carry": 3},
                "perk": "Gale Harvest: +30% crop auto-harvest speed; zero crop waste or drop loss."
            }
        }
    },
    {
        "id": "030",
        "name": "Luminelle",
        "stage": "Nova",
        "primary_element": "Light",
        "secondary_element": None,
        "evolution_line": "Single Stage / Sacred",
        "best_role": "Daylight Amplification, Alchemy Extraction & Luxury Incense",
        "forms": {
            "basic": {
                "name": "Luminelle (Standard)",
                "element": "Light",
                "condition": "Default",
                "abilities": {"Light": 3, "Perfumery": 2, "Leisure": 2},
                "perk": "Holy glow: radiates calming light that prevents worker depression and stress."
            },
            "weather": [
                {
                    "name": "Luminelle (Aurora / Rainbow Mist)",
                    "element": "Light / Water",
                    "condition": "Aurora / Rainbow Rain",
                    "abilities": {"Light": 3, "Water": 2, "Perfumery": 3},
                    "perk": "Prism Infusion: Perfumery scents created during rainbow mist give double buff time."
                }
            ],
            "prismana": {
                "name": "Prismana Luminelle",
                "element": "Light / Prismatic",
                "condition": "Prismana Flow weather (Rare spawn)",
                "abilities": {"Light": 4, "Perfumery": 4, "Leisure": 3},
                "perk": "Radiant Aura: Passively generates 50 bonus Bud Tickets each in-game dawn."
            }
        }
    },
    {
        "id": "031",
        "name": "Sherro",
        "stage": "Gamma",
        "primary_element": "Lightning",
        "secondary_element": "Earth",
        "evolution_line": "Sherro -> (Undiscovered Nova)",
        "best_role": "Automated Generator Charging & Industrial Ore Crushing",
        "forms": {
            "basic": {
                "name": "Sherro (Standard)",
                "element": "Lightning / Earth",
                "condition": "Default",
                "abilities": {"Lightning": 2, "Earth": 2, "Carry": 2},
                "perk": "Electric grounder: powers electric forges and crushes tough rock simultaneously."
            },
            "weather": [
                {
                    "name": "Sherro (Thunderstorm)",
                    "element": "Lightning / Earth",
                    "condition": "Thunderstorm in Echoback Landing",
                    "abilities": {"Lightning": 3, "Earth": 2, "Carry": 2},
                    "perk": "Lightning Rod: Absorbs strikes to recharge RV battery storage to 100% capacity."
                }
            ],
            "prismana": {
                "name": "Prismana Sherro",
                "element": "Lightning / Earth / Prismatic",
                "condition": "Prismana Flow weather",
                "abilities": {"Lightning": 3, "Earth": 3, "Carry": 3},
                "perk": "Dynamo Battery: Keeps high-tier RV machines powered for 12 hours without fuel."
            }
        }
    },
    {
        "id": "032",
        "name": "Rookey",
        "stage": "Lumin",
        "primary_element": "Earth",
        "secondary_element": None,
        "evolution_line": "Rookey -> (Undiscovered Branch)",
        "best_role": "Early Masonry, Basic Stonecrafting & Base Foundations",
        "forms": {
            "basic": {
                "name": "Rookey (Standard)",
                "element": "Earth",
                "condition": "Default",
                "abilities": {"Earth": 1, "Carry": 1, "Artisanship": 1},
                "perk": "Small rocky creature that shapes rough stones into uniform foundation blocks."
            },
            "weather": [
                {
                    "name": "Rookey (Snowfield)",
                    "element": "Earth / Ice",
                    "condition": "Snowfield in Russet Highlands",
                    "abilities": {"Earth": 1, "Ice": 1, "Artisanship": 2},
                    "perk": "Frost Carving: Crafts ice blocks and reinforced stone tiles with increased speed."
                }
            ],
            "prismana": {
                "name": "Prismana Rookey",
                "element": "Earth / Ice / Light",
                "condition": "Prismana Flow weather",
                "abilities": {"Earth": 2, "Ice": 2, "Artisanship": 2},
                "perk": "Apprentice Sculptor: +20% stone crafting speed and 10% chance to refund building materials."
            }
        }
    }
]

out_dir = r"e:\Coding Space\aniimo-homeland-guide\data"
os.makedirs(out_dir, exist_ok=True)

# Write JSON
json_path = os.path.join(out_dir, "aniimo_homeland_data.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"Wrote JSON to {json_path}")

# Write CSV
csv_path = os.path.join(out_dir, "aniimo_homeland_data.csv")
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "ID", "Name", "Stage", "Evolution Line", "Primary Element", "Best Homeland Role",
        "Basic Form Name", "Basic Element", "Basic Abilities",
        "Weather Forms Count", "Weather Form Details",
        "Prismana Form Name", "Prismana Element", "Prismana Abilities", "Prismana Special Trait"
    ])
    for item in data:
        basic = item["forms"]["basic"]
        b_abils = ", ".join([f"{k} Lv.{v}" for k, v in basic["abilities"].items()])
        w_forms = item["forms"].get("weather", [])
        w_details = " | ".join([
            f"{wf['name']} ({wf['condition']}): {wf['element']} - " + ", ".join([f"{k} Lv.{v}" for k, v in wf['abilities'].items()])
            for wf in w_forms
        ])
        prismana = item["forms"]["prismana"]
        p_abils = ", ".join([f"{k} Lv.{v}" for k, v in prismana["abilities"].items()])
        
        writer.writerow([
            item["id"],
            item["name"],
            item["stage"],
            item["evolution_line"],
            item["primary_element"],
            item["best_role"],
            basic["name"],
            basic["element"],
            b_abils,
            len(w_forms),
            w_details,
            prismana["name"],
            prismana["element"],
            p_abils,
            prismana["perk"]
        ])
print(f"Wrote CSV to {csv_path}")

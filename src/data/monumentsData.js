export const getMonumentsData = (t) => [
  {
    id: 'airfield',
    name: t('mon_airfield_name'),
    image: './monuments/airfield.webp',
    cards: ["green","blue"],
    shortDesc: t('mon_airfield_short_desc'),
    facilities: [
      t('mon_airfield_fac_0'),
      t('mon_airfield_fac_1'),
      t('mon_airfield_fac_2')
    ],
    rads: 11,
    videoGuide: 'https://youtu.be/8wx4DDLaIEE?si=RapFtJBchN0xloJT&t=76',
    cctv: ["AIRFIELDGARAGE"],
    description: t('mon_airfield_desc'),
    puzzle: [
      t('mon_airfield_puzzle_0'),
      t('mon_airfield_puzzle_1'),
      t('mon_airfield_puzzle_2'),
      t('mon_airfield_puzzle_3'),
      t('mon_airfield_puzzle_4')
    ],
    loot: [
      t('mon_airfield_loot_0'),
      t('mon_airfield_loot_1'),
      t('mon_airfield_loot_2'),
      t('mon_airfield_loot_3')
    ],
  },
  {
    id: 'water-treatment',
    name: t('mon_water_treatment_name'),
    image: './monuments/water-treatment.jpg',
    cards: ["blue"],
    shortDesc: t('mon_water_treatment_short_desc'),
    facilities: [
      t('mon_water_treatment_fac_0'),
      t('mon_water_treatment_fac_1'),
      t('mon_water_treatment_fac_2')
    ],
    rads: 11,
    videoGuide: 'https://youtu.be/sXNogIdTzqM?si=OBGFpkrJ7NGdT0AU',
    description: t('mon_water_treatment_desc'),
    puzzle: [
      t('mon_water_treatment_puzzle_0'),
      t('mon_water_treatment_puzzle_1'),
      t('mon_water_treatment_puzzle_2'),
      t('mon_water_treatment_puzzle_3'),
      t('mon_water_treatment_puzzle_4')
    ],
    loot: [
      t('mon_water_treatment_loot_0'),
      t('mon_water_treatment_loot_1'),
      t('mon_water_treatment_loot_2')
    ],
  },
  {
    id: 'launch-site',
    name: t('mon_launch_site_name'),
    image: './monuments/launch-site.jpg',
    cards: ["green","red"],
    shortDesc: t('mon_launch_site_short_desc'),
    facilities: [
      t('mon_launch_site_fac_0'),
      t('mon_launch_site_fac_1'),
      t('mon_launch_site_fac_2')
    ],
    rads: 25,
    videoGuide: 'https://youtu.be/z6EJXkI7Ha0?si=aS3mcRyYI1S0JjmK',
    cctv: ["SILOEXIT1","SILOSHIPPING","SILOEXIT2","SILOTOWER","SILOMISSILE"],
    description: t('mon_launch_site_desc'),
    puzzle: [
      t('mon_launch_site_puzzle_0'),
      t('mon_launch_site_puzzle_1'),
      t('mon_launch_site_puzzle_2'),
      t('mon_launch_site_puzzle_3'),
      t('mon_launch_site_puzzle_4'),
      t('mon_launch_site_puzzle_5')
    ],
    loot: [
      t('mon_launch_site_loot_0'),
      t('mon_launch_site_loot_1'),
      t('mon_launch_site_loot_2')
    ],
  },
  {
    id: 'train-yard',
    name: t('mon_train_yard_name'),
    image: './monuments/train-yard.webp',
    cards: ["green","blue"],
    shortDesc: t('mon_train_yard_short_desc'),
    facilities: [
      t('mon_train_yard_fac_0'),
      t('mon_train_yard_fac_1'),
      t('mon_train_yard_fac_2'),
      t('mon_train_yard_fac_3')
    ],
    rads: 11,
    videoGuide: 'https://youtu.be/62AxSu4iTFk?si=fPVgTJ82C-o-hWIy',
    description: t('mon_train_yard_desc'),
    puzzle: [
      t('mon_train_yard_puzzle_0'),
      t('mon_train_yard_puzzle_1'),
      t('mon_train_yard_puzzle_2'),
      t('mon_train_yard_puzzle_3'),
      t('mon_train_yard_puzzle_4'),
      t('mon_train_yard_puzzle_5')
    ],
    loot: [
      t('mon_train_yard_loot_0'),
      t('mon_train_yard_loot_1'),
      t('mon_train_yard_loot_2')
    ],
    sections: [
      {
        title: t('mon_train_yard_sec_title_0'),
        content: t('mon_train_yard_sec_content_0')
      },
      {
        title: t('mon_train_yard_sec_title_1'),
        content: t('mon_train_yard_sec_content_1'),
        image: './monuments/train-yard-unloading.jpg'
      },
      {
        title: t('mon_train_yard_sec_title_2'),
        content: t('mon_train_yard_sec_content_2'),
        image: './monuments/train-yard-map.jpg'
      },
    ],
  },
  {
    id: 'military-tunnels',
    name: t('mon_military_tunnels_name'),
    image: './monuments/military-tunnels.webp',
    cards: ["green","blue","red"],
    shortDesc: t('mon_military_tunnels_short_desc'),
    facilities: [
      t('mon_military_tunnels_fac_0'),
      t('mon_military_tunnels_fac_1')
    ],
    rads: 11,
    videoGuide: 'https://youtu.be/i2Y1Le3T_7E?si=WE2_gqJONEnw65Pm',
    description: t('mon_military_tunnels_desc'),
    puzzle: [
      t('mon_military_tunnels_puzzle_0'),
      t('mon_military_tunnels_puzzle_1'),
      t('mon_military_tunnels_puzzle_2'),
      t('mon_military_tunnels_puzzle_3'),
      t('mon_military_tunnels_puzzle_4')
    ],
    loot: [
      t('mon_military_tunnels_loot_0'),
      t('mon_military_tunnels_loot_1'),
      t('mon_military_tunnels_loot_2')
    ],
  },
  {
    id: 'large-oil-rig',
    name: t('mon_large_oil_rig_name'),
    image: './monuments/large-oil-rig.jpg',
    cards: ["green","blue","red"],
    shortDesc: t('mon_large_oil_rig_short_desc'),
    facilities: [
      t('mon_large_oil_rig_fac_0'),
      t('mon_large_oil_rig_fac_1')
    ],
    rads: 0,
    cctv: ["OILRIG2L6D","OILRIG2L6C","OILRIG2L6B","OILRIG2L6A","OILRIG2EXHAUST","OILRIG2HELI","OILRIG2L5","OILRIG2L4","OILRIG2L3B","OILRIG2L3A","OILRIG2L2","OILRIG2L1","OILRIG2DOCK"],
    description: t('mon_large_oil_rig_desc'),
    puzzle: [
      t('mon_large_oil_rig_puzzle_0'),
      t('mon_large_oil_rig_puzzle_1'),
      t('mon_large_oil_rig_puzzle_2'),
      t('mon_large_oil_rig_puzzle_3'),
      t('mon_large_oil_rig_puzzle_4')
    ],
    loot: [
      t('mon_large_oil_rig_loot_0'),
      t('mon_large_oil_rig_loot_1'),
      t('mon_large_oil_rig_loot_2')
    ],
  },
  {
    id: 'dome',
    name: t('mon_dome_name'),
    image: './monuments/dome.webp',
    cards: [],
    shortDesc: t('mon_dome_short_desc'),
    facilities: [
      t('mon_dome_fac_0'),
      t('mon_dome_fac_1')
    ],
    rads: 11,
    videoGuide: 'https://youtu.be/UnQiygythLY?si=a-L5cGvVrV6y_W38',
    cctv: ["DOME1","DOMETOP"],
    description: t('mon_dome_desc'),
    puzzle: [
      t('mon_dome_puzzle_0'),
      t('mon_dome_puzzle_1'),
      t('mon_dome_puzzle_2'),
      t('mon_dome_puzzle_3')
    ],
    loot: [
      t('mon_dome_loot_0'),
      t('mon_dome_loot_1')
    ],
  },
  {
    id: 'arctic-base',
    name: t('mon_arctic_base_name'),
    image: './monuments/arctic-base.jpg',
    cards: ["blue"],
    shortDesc: t('mon_arctic_base_short_desc'),
    facilities: [
      t('mon_arctic_base_fac_0'),
      t('mon_arctic_base_fac_1'),
      t('mon_arctic_base_fac_2')
    ],
    rads: 0,
    videoGuide: 'https://youtu.be/cZgSJNUE0x8?si=21_8EwbXoxp5eKEI',
    description: t('mon_arctic_base_desc'),
    puzzle: [
      t('mon_arctic_base_puzzle_0'),
      t('mon_arctic_base_puzzle_1'),
      t('mon_arctic_base_puzzle_2')
    ],
    loot: [
      t('mon_arctic_base_loot_0'),
      t('mon_arctic_base_loot_1'),
      t('mon_arctic_base_loot_2')
    ],
  },
  {
    id: 'sewer-branch',
    name: t('mon_sewer_branch_name'),
    image: './monuments/sewer-branch.jpg',
    cards: ["green"],
    shortDesc: t('mon_sewer_branch_short_desc'),
    facilities: [
      t('mon_sewer_branch_fac_0'),
      t('mon_sewer_branch_fac_1')
    ],
    rads: 11,
    videoGuide: 'https://youtu.be/XQLWHoa44cs?si=yP0UAFvCZLDl15D2',
    description: t('mon_sewer_branch_desc'),
    puzzle: [
      t('mon_sewer_branch_puzzle_0'),
      t('mon_sewer_branch_puzzle_1'),
      t('mon_sewer_branch_puzzle_2'),
      t('mon_sewer_branch_puzzle_3')
    ],
    loot: [
      t('mon_sewer_branch_loot_0'),
      t('mon_sewer_branch_loot_1'),
      t('mon_sewer_branch_loot_2')
    ],
  },
  {
    id: 'satellite-dish',
    name: t('mon_satellite_dish_name'),
    image: './monuments/satellite-dish.jpg',
    cards: ["green"],
    shortDesc: t('mon_satellite_dish_short_desc'),
    facilities: [
      t('mon_satellite_dish_fac_0'),
      t('mon_satellite_dish_fac_1')
    ],
    rads: 11,
    videoGuide: 'https://youtu.be/O7YrrG_jTMM?si=e7UQ2ozPwQCVjiQ9',
    description: t('mon_satellite_dish_desc'),
    puzzle: [
      t('mon_satellite_dish_puzzle_0'),
      t('mon_satellite_dish_puzzle_1'),
      t('mon_satellite_dish_puzzle_2')
    ],
    loot: [
      t('mon_satellite_dish_loot_0'),
      t('mon_satellite_dish_loot_1')
    ],
  },
  {
    id: 'small-harbor',
    name: t('mon_small_harbor_name'),
    image: './monuments/small-harbor.jpg',
    cards: ["green"],
    shortDesc: t('mon_small_harbor_short_desc'),
    facilities: [
      t('mon_small_harbor_fac_0'),
      t('mon_small_harbor_fac_1')
    ],
    rads: 0,
    videoGuide: 'https://youtu.be/iMYODoGRNss?si=MyspHHiLYKakxUvW&t=364',
    description: t('mon_small_harbor_desc'),
    puzzle: [
      t('mon_small_harbor_puzzle_0'),
      t('mon_small_harbor_puzzle_1')
    ],
    loot: [
      t('mon_small_harbor_loot_0'),
      t('mon_small_harbor_loot_1'),
      t('mon_small_harbor_loot_2')
    ],
  },
  {
    id: 'large-harbor',
    name: t('mon_large_harbor_name'),
    image: './monuments/large-harbor.jpg',
    cards: ["green"],
    shortDesc: t('mon_large_harbor_short_desc'),
    facilities: [
      t('mon_large_harbor_fac_0'),
      t('mon_large_harbor_fac_1')
    ],
    rads: 0,
    videoGuide: 'https://youtu.be/iMYODoGRNss?si=rrNwBmSdjHZG6Dqn&t=385',
    description: t('mon_large_harbor_desc'),
    puzzle: [
      t('mon_large_harbor_puzzle_0'),
      t('mon_large_harbor_puzzle_1')
    ],
    loot: [
      t('mon_large_harbor_loot_0'),
      t('mon_large_harbor_loot_1')
    ],
  },
  {
    id: 'power-plant',
    name: t('mon_power_plant_name'),
    image: './monuments/power-plant.webp',
    cards: ["green","blue"],
    shortDesc: t('mon_power_plant_short_desc'),
    facilities: [
      t('mon_power_plant_fac_0'),
      t('mon_power_plant_fac_1'),
      t('mon_power_plant_fac_2')
    ],
    rads: 25,
    videoGuide: 'https://youtu.be/X2J1dVdfIn8?si=qktL0L54MmGufLlr',
    description: t('mon_power_plant_desc'),
    puzzle: [
      t('mon_power_plant_puzzle_0'),
      t('mon_power_plant_puzzle_1'),
      t('mon_power_plant_puzzle_2'),
      t('mon_power_plant_puzzle_3')
    ],
    loot: [
      t('mon_power_plant_loot_0'),
      t('mon_power_plant_loot_1')
    ],
  },
  {
    id: 'junkyard',
    name: t('mon_junkyard_name'),
    image: './monuments/junkyard.avif',
    cards: ["green"],
    shortDesc: t('mon_junkyard_short_desc'),
    facilities: [
      t('mon_junkyard_fac_0'),
      t('mon_junkyard_fac_1')
    ],
    rads: 0,
    videoGuide: 'https://youtu.be/PCwdIP0yBmw?si=0_sW7rugzlBUKMbx',
    description: t('mon_junkyard_desc'),
    puzzle: [
      t('mon_junkyard_puzzle_0'),
      t('mon_junkyard_puzzle_1'),
      t('mon_junkyard_puzzle_2')
    ],
    loot: [
      t('mon_junkyard_loot_0'),
      t('mon_junkyard_loot_1'),
      t('mon_junkyard_loot_2')
    ],
  },
  {
    id: 'excavator',
    name: t('mon_excavator_name'),
    image: './monuments/excavator.jpg',
    cards: [],
    shortDesc: t('mon_excavator_short_desc'),
    facilities: [
      t('mon_excavator_fac_0')
    ],
    rads: 11,
    videoGuide: 'https://youtu.be/nJewy701c-A?si=RvRrHlmAywacT-TF',
    description: t('mon_excavator_desc'),
    puzzle: [
      t('mon_excavator_puzzle_0'),
      t('mon_excavator_puzzle_1'),
      t('mon_excavator_puzzle_2')
    ],
    loot: [
      t('mon_excavator_loot_0')
    ],
  },
  {
    id: 'supermarket',
    name: t('mon_supermarket_name'),
    image: './monuments/supermarket.webp',
    cards: [],
    shortDesc: t('mon_supermarket_short_desc'),
    facilities: [
      t('mon_supermarket_fac_0')
    ],
    rads: 0,
    videoGuide: '',
    description: t('mon_supermarket_desc'),
    puzzle: [
      t('mon_supermarket_puzzle_0'),
      t('mon_supermarket_puzzle_1')
    ],
    loot: [
      t('mon_supermarket_loot_0'),
      t('mon_supermarket_loot_1'),
      t('mon_supermarket_loot_2')
    ],
  },
];

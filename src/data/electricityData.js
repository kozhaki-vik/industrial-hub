import turretsImg from '../assets/schemes/turrets.jpg';
import furnaceImg from '../assets/schemes/furnace.jpg';
import raidImg from '../assets/schemes/raid.jpg';

export const getElectricityData = (t) => [
  {
    id: 'turrets',
    title: t('elec_turrets_title'),
    desc: t('elec_turrets_short_desc'),
    power: t('elec_turrets_power'),
    reserve: t('elec_turrets_reserve'),
    image: turretsImg,
    rustricianUrl: 'https://www.rustrician.io/?circuit=44eba7e8233da8393f6e499c184cc522',
    description: t('elec_turrets_desc'),
    components: [
      t('elec_turrets_comp_0'),
      t('elec_turrets_comp_1'),
      t('elec_turrets_comp_2'),
      t('elec_turrets_comp_3')
    ],
    note: t('elec_turrets_note'),
  },
  {
    id: 'furnace',
    title: t('elec_furnace_title'),
    desc: t('elec_furnace_short_desc'),
    power: t('elec_furnace_power'),
    reserve: t('elec_furnace_reserve'),
    image: furnaceImg,
    rustricianUrl: 'https://www.rustrician.io/?circuit=8b4c2b9a1d4e7f0c3d5a2b8e1f0c4d7b',
    description: t('elec_furnace_desc'),
    components: [
      t('elec_furnace_comp_0'),
      t('elec_furnace_comp_1'),
      t('elec_furnace_comp_2'),
      t('elec_furnace_comp_3'),
      t('elec_furnace_comp_4')
    ],
    note: t('elec_furnace_note'),
  },
  {
    id: 'raid',
    title: t('elec_raid_title'),
    desc: t('elec_raid_short_desc'),
    power: t('elec_raid_power'),
    reserve: t('elec_raid_reserve'),
    image: raidImg,
    rustricianUrl: 'https://www.rustrician.io/?circuit=1a2b3c4d5e6f7g8h9i0j',
    description: t('elec_raid_desc'),
    components: [
      t('elec_raid_comp_0'),
      t('elec_raid_comp_1'),
      t('elec_raid_comp_2'),
      t('elec_raid_comp_3')
    ],
    note: t('elec_raid_note'),
  },
];


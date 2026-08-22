import itemsRu from './items_ru.json';

const images = import.meta.glob('../assets/items/*.png', { eager: true, import: 'default' }) as Record<string, string>;

const rawItemsDB = [
  {
    "shortname": "2module car chassis",
    "localizedName": "2module car chassis"
  },
  {
    "shortname": "2module car",
    "localizedName": "2module car"
  },
  {
    "shortname": "3module car chassis",
    "localizedName": "3module car chassis"
  },
  {
    "shortname": "3module car",
    "localizedName": "3module car"
  },
  {
    "shortname": "4module car chassis",
    "localizedName": "4module car chassis"
  },
  {
    "shortname": "4module car",
    "localizedName": "4module car"
  },
  {
    "shortname": "50cal.mounted.left",
    "localizedName": "50cal Mounted Left"
  },
  {
    "shortname": "50cal.mounted",
    "localizedName": "50cal Mounted"
  },
  {
    "shortname": "50cal.mounted.right",
    "localizedName": "50cal Mounted Right"
  },
  {
    "shortname": "abovegroundpool",
    "localizedName": "Abovegroundpool"
  },
  {
    "shortname": "abyss.barrel.horizontal",
    "localizedName": "Abyss Barrel Horizontal"
  },
  {
    "shortname": "abyss.barrel.vertical",
    "localizedName": "Abyss Barrel Vertical"
  },
  {
    "shortname": "advancedblueprintfragment",
    "localizedName": "Advancedblueprintfragment"
  },
  {
    "shortname": "advancedcoolingtea",
    "localizedName": "Advancedcoolingtea"
  },
  {
    "shortname": "advancedcraftingtea_quality",
    "localizedName": "Advancedcraftingtea Quality"
  },
  {
    "shortname": "advancedwarmingtea",
    "localizedName": "Advancedwarmingtea"
  },
  {
    "shortname": "advanceharvestingtea",
    "localizedName": "Advanceharvestingtea"
  },
  {
    "shortname": "aiming.module.mlrs",
    "localizedName": "Aiming Module Mlrs"
  },
  {
    "shortname": "ammo.grenadelauncher.buckshot",
    "localizedName": "Ammo Grenadelauncher Buckshot"
  },
  {
    "shortname": "ammo.grenadelauncher.he",
    "localizedName": "Ammo Grenadelauncher He"
  },
  {
    "shortname": "ammo.grenadelauncher.smoke",
    "localizedName": "Ammo Grenadelauncher Smoke"
  },
  {
    "shortname": "ammo.handmade.shell",
    "localizedName": "Ammo Handmade Shell"
  },
  {
    "shortname": "ammo.nailgun.nails",
    "localizedName": "Ammo Nailgun Nails"
  },
  {
    "shortname": "ammo.paintball",
    "localizedName": "Ammo Paintball"
  },
  {
    "shortname": "ammo.pistol.fire",
    "localizedName": "Ammo Pistol Fire"
  },
  {
    "shortname": "ammo.pistol.hv",
    "localizedName": "Ammo Pistol Hv"
  },
  {
    "shortname": "ammo.pistol",
    "localizedName": "Ammo Pistol"
  },
  {
    "shortname": "ammo.rifle.explosive",
    "localizedName": "Ammo Rifle Explosive"
  },
  {
    "shortname": "ammo.rifle.hv",
    "localizedName": "Ammo Rifle Hv"
  },
  {
    "shortname": "ammo.rifle.incendiary",
    "localizedName": "Ammo Rifle Incendiary"
  },
  {
    "shortname": "ammo.rifle",
    "localizedName": "Ammo Rifle"
  },
  {
    "shortname": "ammo.rocket.basic",
    "localizedName": "Ammo Rocket Basic"
  },
  {
    "shortname": "ammo.rocket.fire",
    "localizedName": "Ammo Rocket Fire"
  },
  {
    "shortname": "ammo.rocket.hv",
    "localizedName": "Ammo Rocket Hv"
  },
  {
    "shortname": "ammo.rocket.mlrs",
    "localizedName": "Ammo Rocket Mlrs"
  },
  {
    "shortname": "ammo.rocket.sam",
    "localizedName": "Ammo Rocket Sam"
  },
  {
    "shortname": "ammo.rocket.seeker",
    "localizedName": "Ammo Rocket Seeker"
  },
  {
    "shortname": "ammo.rocket.smoke",
    "localizedName": "Ammo Rocket Smoke"
  },
  {
    "shortname": "ammo.shotgun.fire",
    "localizedName": "Ammo Shotgun Fire"
  },
  {
    "shortname": "ammo.shotgun",
    "localizedName": "Ammo Shotgun"
  },
  {
    "shortname": "ammo.shotgun.slug",
    "localizedName": "Ammo Shotgun Slug"
  },
  {
    "shortname": "ammo.snowballgun",
    "localizedName": "Ammo Snowballgun"
  },
  {
    "shortname": "anchor",
    "localizedName": "Anchor"
  },
  {
    "shortname": "antiradpills",
    "localizedName": "Antiradpills"
  },
  {
    "shortname": "apple",
    "localizedName": "Apple"
  },
  {
    "shortname": "apple.spoiled",
    "localizedName": "Apple Spoiled"
  },
  {
    "shortname": "arcade.machine.chippy",
    "localizedName": "Arcade Machine Chippy"
  },
  {
    "shortname": "arrow.bone",
    "localizedName": "Arrow Bone"
  },
  {
    "shortname": "arrow.fire",
    "localizedName": "Arrow Fire"
  },
  {
    "shortname": "arrow.hv",
    "localizedName": "Arrow Hv"
  },
  {
    "shortname": "arrow.wooden",
    "localizedName": "Arrow Wooden"
  },
  {
    "shortname": "attackhelicopter",
    "localizedName": "Attackhelicopter"
  },
  {
    "shortname": "attire.banditguard",
    "localizedName": "Attire Banditguard"
  },
  {
    "shortname": "attire.bunny.onesie",
    "localizedName": "Attire Bunny Onesie"
  },
  {
    "shortname": "attire.bunnyears",
    "localizedName": "Attire Bunnyears"
  },
  {
    "shortname": "attire.egg.suit",
    "localizedName": "Attire Egg Suit"
  },
  {
    "shortname": "attire.hide.boots",
    "localizedName": "Attire Hide Boots"
  },
  {
    "shortname": "attire.hide.helterneck",
    "localizedName": "Attire Hide Helterneck"
  },
  {
    "shortname": "attire.hide.pants",
    "localizedName": "Attire Hide Pants"
  },
  {
    "shortname": "attire.hide.poncho",
    "localizedName": "Attire Hide Poncho"
  },
  {
    "shortname": "attire.hide.skirt",
    "localizedName": "Attire Hide Skirt"
  },
  {
    "shortname": "attire.hide.vest",
    "localizedName": "Attire Hide Vest"
  },
  {
    "shortname": "attire.nesthat",
    "localizedName": "Attire Nesthat"
  },
  {
    "shortname": "attire.ninja.suit",
    "localizedName": "Attire Ninja Suit"
  },
  {
    "shortname": "attire.reindeer.headband",
    "localizedName": "Attire Reindeer Headband"
  },
  {
    "shortname": "attire.snowman.helmet",
    "localizedName": "Attire Snowman Helmet"
  },
  {
    "shortname": "autoturret",
    "localizedName": "Autoturret"
  },
  {
    "shortname": "axe.salvaged",
    "localizedName": "Axe Salvaged"
  },
  {
    "shortname": "ball",
    "localizedName": "Ball"
  },
  {
    "shortname": "ballista.bolt.hammerhead",
    "localizedName": "Ballista Bolt Hammerhead"
  },
  {
    "shortname": "ballista.bolt.incendiary",
    "localizedName": "Ballista Bolt Incendiary"
  },
  {
    "shortname": "ballista.bolt.piercer",
    "localizedName": "Ballista Bolt Piercer"
  },
  {
    "shortname": "ballista.bolt.pitchfork",
    "localizedName": "Ballista Bolt Pitchfork"
  },
  {
    "shortname": "ballista.mounted",
    "localizedName": "Ballista Mounted"
  },
  {
    "shortname": "ballista.static",
    "localizedName": "Ballista Static"
  },
  {
    "shortname": "bamboo.barrel",
    "localizedName": "Bamboo Barrel"
  },
  {
    "shortname": "bandage",
    "localizedName": "Bandage"
  },
  {
    "shortname": "barrelcostume",
    "localizedName": "Barrelcostume"
  },
  {
    "shortname": "barricade.concrete",
    "localizedName": "Barricade Concrete"
  },
  {
    "shortname": "barricade.medieval",
    "localizedName": "Barricade Medieval"
  },
  {
    "shortname": "barricade.metal",
    "localizedName": "Barricade Metal"
  },
  {
    "shortname": "barricade.sandbags",
    "localizedName": "Barricade Sandbags"
  },
  {
    "shortname": "barricade.stone",
    "localizedName": "Barricade Stone"
  },
  {
    "shortname": "barricade.wood.cover",
    "localizedName": "Barricade Wood Cover"
  },
  {
    "shortname": "barricade.wood",
    "localizedName": "Barricade Wood"
  },
  {
    "shortname": "barricade.woodwire",
    "localizedName": "Barricade Woodwire"
  },
  {
    "shortname": "basicblueprintfragment",
    "localizedName": "Basicblueprintfragment"
  },
  {
    "shortname": "bathtub.planter",
    "localizedName": "Bathtub Planter"
  },
  {
    "shortname": "batteringram",
    "localizedName": "Batteringram"
  },
  {
    "shortname": "battery.small",
    "localizedName": "Battery Small"
  },
  {
    "shortname": "bbq",
    "localizedName": "Bbq"
  },
  {
    "shortname": "beachchair.camo",
    "localizedName": "Beachchair Camo"
  },
  {
    "shortname": "beachchair.flamingo",
    "localizedName": "Beachchair Flamingo"
  },
  {
    "shortname": "beachchair.leaves",
    "localizedName": "Beachchair Leaves"
  },
  {
    "shortname": "beachchair.pizza",
    "localizedName": "Beachchair Pizza"
  },
  {
    "shortname": "beachchair",
    "localizedName": "Beachchair"
  },
  {
    "shortname": "beachchair.target",
    "localizedName": "Beachchair Target"
  },
  {
    "shortname": "beachchair.tarp",
    "localizedName": "Beachchair Tarp"
  },
  {
    "shortname": "beachchair.zenlabs",
    "localizedName": "Beachchair Zenlabs"
  },
  {
    "shortname": "beachparasol.camo",
    "localizedName": "Beachparasol Camo"
  },
  {
    "shortname": "beachparasol.flamingo",
    "localizedName": "Beachparasol Flamingo"
  },
  {
    "shortname": "beachparasol.leaves",
    "localizedName": "Beachparasol Leaves"
  },
  {
    "shortname": "beachparasol.pizza",
    "localizedName": "Beachparasol Pizza"
  },
  {
    "shortname": "beachparasol",
    "localizedName": "Beachparasol"
  },
  {
    "shortname": "beachparasol.target",
    "localizedName": "Beachparasol Target"
  },
  {
    "shortname": "beachparasol.tarp",
    "localizedName": "Beachparasol Tarp"
  },
  {
    "shortname": "beachparasol.zenlabs",
    "localizedName": "Beachparasol Zenlabs"
  },
  {
    "shortname": "beachtable",
    "localizedName": "Beachtable"
  },
  {
    "shortname": "beachtowel.brownstripes",
    "localizedName": "Beachtowel Brownstripes"
  },
  {
    "shortname": "beachtowel.cobalt",
    "localizedName": "Beachtowel Cobalt"
  },
  {
    "shortname": "beachtowel.dye",
    "localizedName": "Beachtowel Dye"
  },
  {
    "shortname": "beachtowel.fish",
    "localizedName": "Beachtowel Fish"
  },
  {
    "shortname": "beachtowel",
    "localizedName": "Beachtowel"
  },
  {
    "shortname": "beachtowel.shell",
    "localizedName": "Beachtowel Shell"
  },
  {
    "shortname": "beachtowel.stripes",
    "localizedName": "Beachtowel Stripes"
  },
  {
    "shortname": "beachtowel.waves",
    "localizedName": "Beachtowel Waves"
  },
  {
    "shortname": "beanbagseatfabric",
    "localizedName": "Beanbagseatfabric"
  },
  {
    "shortname": "beanbagseatleather",
    "localizedName": "Beanbagseatleather"
  },
  {
    "shortname": "bearmeat.burned",
    "localizedName": "Bearmeat Burned"
  },
  {
    "shortname": "bearmeat.cooked",
    "localizedName": "Bearmeat Cooked"
  },
  {
    "shortname": "bearmeat",
    "localizedName": "Bearmeat"
  },
  {
    "shortname": "bearmeat.spoiled",
    "localizedName": "Bearmeat Spoiled"
  },
  {
    "shortname": "bed",
    "localizedName": "Bed"
  },
  {
    "shortname": "beehive",
    "localizedName": "Beehive"
  },
  {
    "shortname": "bicycle",
    "localizedName": "Bicycle"
  },
  {
    "shortname": "bigcatmeat.cooked",
    "localizedName": "Bigcatmeat Cooked"
  },
  {
    "shortname": "bigcatmeat",
    "localizedName": "Bigcatmeat"
  },
  {
    "shortname": "bigcatmeat.spoiled",
    "localizedName": "Bigcatmeat Spoiled"
  },
  {
    "shortname": "black.berry",
    "localizedName": "Black Berry"
  },
  {
    "shortname": "black.raspberries",
    "localizedName": "Black Raspberries"
  },
  {
    "shortname": "bleach",
    "localizedName": "Bleach"
  },
  {
    "shortname": "blood",
    "localizedName": "Blood"
  },
  {
    "shortname": "blowpipe",
    "localizedName": "Blowpipe"
  },
  {
    "shortname": "blue.berry",
    "localizedName": "Blue Berry"
  },
  {
    "shortname": "blueberries",
    "localizedName": "Blueberries"
  },
  {
    "shortname": "bluedogtags",
    "localizedName": "Bluedogtags"
  },
  {
    "shortname": "blueidtag",
    "localizedName": "Blueidtag"
  },
  {
    "shortname": "blueprintbase",
    "localizedName": "Blueprintbase"
  },
  {
    "shortname": "blunderbuss",
    "localizedName": "Blunderbuss"
  },
  {
    "shortname": "boat.planner",
    "localizedName": "Boat Planner"
  },
  {
    "shortname": "boatbuildingstation",
    "localizedName": "Boatbuildingstation"
  },
  {
    "shortname": "bone.armor.suit",
    "localizedName": "Bone Armor Suit"
  },
  {
    "shortname": "bone.club",
    "localizedName": "Bone Club"
  },
  {
    "shortname": "bone.fragments",
    "localizedName": "Bone Fragments"
  },
  {
    "shortname": "boogieboard.corrugated",
    "localizedName": "Boogieboard Corrugated"
  },
  {
    "shortname": "boogieboard.crashtest",
    "localizedName": "Boogieboard Crashtest"
  },
  {
    "shortname": "boogieboard.flames",
    "localizedName": "Boogieboard Flames"
  },
  {
    "shortname": "boogieboard.marbled",
    "localizedName": "Boogieboard Marbled"
  },
  {
    "shortname": "boogieboard",
    "localizedName": "Boogieboard"
  },
  {
    "shortname": "boogieboard.shark",
    "localizedName": "Boogieboard Shark"
  },
  {
    "shortname": "boogieboard.stars",
    "localizedName": "Boogieboard Stars"
  },
  {
    "shortname": "boombox",
    "localizedName": "Boombox"
  },
  {
    "shortname": "boomerang",
    "localizedName": "Boomerang"
  },
  {
    "shortname": "boots.frog",
    "localizedName": "Boots Frog"
  },
  {
    "shortname": "botabag",
    "localizedName": "Botabag"
  },
  {
    "shortname": "bottle.vodka",
    "localizedName": "Bottle Vodka"
  },
  {
    "shortname": "bow.compound",
    "localizedName": "Bow Compound"
  },
  {
    "shortname": "bow.hunting.legacybow.skin",
    "localizedName": "Bow Hunting Legacybow Skin"
  },
  {
    "shortname": "bow.hunting",
    "localizedName": "Bow Hunting"
  },
  {
    "shortname": "box.repair.bench",
    "localizedName": "Box Repair Bench"
  },
  {
    "shortname": "box.wooden.large.component.ammo.skin",
    "localizedName": "Box Wooden Large Component Ammo Skin"
  },
  {
    "shortname": "box.wooden.large.component.armor.skin",
    "localizedName": "Box Wooden Large Component Armor Skin"
  },
  {
    "shortname": "box.wooden.large.component.charcoal.skin",
    "localizedName": "Box Wooden Large Component Charcoal Skin"
  },
  {
    "shortname": "box.wooden.large.component.clothing.skin",
    "localizedName": "Box Wooden Large Component Clothing Skin"
  },
  {
    "shortname": "box.wooden.large.component.components.skin",
    "localizedName": "Box Wooden Large Component Components Skin"
  },
  {
    "shortname": "box.wooden.large.component.explosives.skin",
    "localizedName": "Box Wooden Large Component Explosives Skin"
  },
  {
    "shortname": "box.wooden.large.component.food.skin",
    "localizedName": "Box Wooden Large Component Food Skin"
  },
  {
    "shortname": "box.wooden.large.component.guns.skin",
    "localizedName": "Box Wooden Large Component Guns Skin"
  },
  {
    "shortname": "box.wooden.large.component.meds.skin",
    "localizedName": "Box Wooden Large Component Meds Skin"
  },
  {
    "shortname": "box.wooden.large.component.metal.skin",
    "localizedName": "Box Wooden Large Component Metal Skin"
  },
  {
    "shortname": "box.wooden.large.component.ore.skin",
    "localizedName": "Box Wooden Large Component Ore Skin"
  },
  {
    "shortname": "box.wooden.large.component.scrap.skin",
    "localizedName": "Box Wooden Large Component Scrap Skin"
  },
  {
    "shortname": "box.wooden.large.component.stone.skin",
    "localizedName": "Box Wooden Large Component Stone Skin"
  },
  {
    "shortname": "box.wooden.large.component.sulfur.skin",
    "localizedName": "Box Wooden Large Component Sulfur Skin"
  },
  {
    "shortname": "box.wooden.large.component.tools.skin",
    "localizedName": "Box Wooden Large Component Tools Skin"
  },
  {
    "shortname": "box.wooden.large.component.wood.skin",
    "localizedName": "Box Wooden Large Component Wood Skin"
  },
  {
    "shortname": "box.wooden.large.medieval.skin",
    "localizedName": "Box Wooden Large Medieval Skin"
  },
  {
    "shortname": "box.wooden.large",
    "localizedName": "Box Wooden Large"
  },
  {
    "shortname": "box.wooden.large.skin.woodstorage.ammowoodenbox",
    "localizedName": "Box Wooden Large Skin Woodstorage Ammowoodenbox"
  },
  {
    "shortname": "box.wooden.large.skin.woodstorage.christmasstorage",
    "localizedName": "Box Wooden Large Skin Woodstorage Christmasstorage"
  },
  {
    "shortname": "box.wooden.large.skin.woodstorage.firstaidgreen",
    "localizedName": "Box Wooden Large Skin Woodstorage Firstaidgreen"
  },
  {
    "shortname": "box.wooden.large.skin.woodstorage.gunbox",
    "localizedName": "Box Wooden Large Skin Woodstorage Gunbox"
  },
  {
    "shortname": "box.wooden.pilot.hazmat.skin",
    "localizedName": "Box Wooden Pilot Hazmat Skin"
  },
  {
    "shortname": "box.wooden",
    "localizedName": "Box Wooden"
  },
  {
    "shortname": "bread.loaf",
    "localizedName": "Bread Loaf"
  },
  {
    "shortname": "bucket.helmet",
    "localizedName": "Bucket Helmet"
  },
  {
    "shortname": "bucket.helmet.skin.buckethat.medichelmet",
    "localizedName": "Bucket Helmet Skin Buckethat Medichelmet"
  },
  {
    "shortname": "bucket.water",
    "localizedName": "Bucket Water"
  },
  {
    "shortname": "building.planner",
    "localizedName": "Building Planner"
  },
  {
    "shortname": "bunny.suit",
    "localizedName": "Bunny Suit"
  },
  {
    "shortname": "burlap.gloves.new",
    "localizedName": "Burlap Gloves New"
  },
  {
    "shortname": "burlap.gloves",
    "localizedName": "Burlap Gloves"
  },
  {
    "shortname": "burlap.gloves.skin.burlapgloves.boxer'sbandages",
    "localizedName": "Burlap Gloves Skin Burlapgloves Boxer'sbandages"
  },
  {
    "shortname": "burlap.headwrap",
    "localizedName": "Burlap Headwrap"
  },
  {
    "shortname": "burlap.shirt",
    "localizedName": "Burlap Shirt"
  },
  {
    "shortname": "burlap.shirt.skin.burlapshirt.piratevest&shirt",
    "localizedName": "Burlap Shirt Skin Burlapshirt Piratevest&shirt"
  },
  {
    "shortname": "burlap.shoes",
    "localizedName": "Burlap Shoes"
  },
  {
    "shortname": "burlap.trousers",
    "localizedName": "Burlap Trousers"
  },
  {
    "shortname": "caboose",
    "localizedName": "Caboose"
  },
  {
    "shortname": "cactusflesh",
    "localizedName": "Cactusflesh"
  },
  {
    "shortname": "cakefiveyear",
    "localizedName": "Cakefiveyear"
  },
  {
    "shortname": "campfire",
    "localizedName": "Campfire"
  },
  {
    "shortname": "can.beans.empty",
    "localizedName": "Can Beans Empty"
  },
  {
    "shortname": "can.beans",
    "localizedName": "Can Beans"
  },
  {
    "shortname": "can.tuna.empty",
    "localizedName": "Can Tuna Empty"
  },
  {
    "shortname": "can.tuna",
    "localizedName": "Can Tuna"
  },
  {
    "shortname": "candycane",
    "localizedName": "Candycane"
  },
  {
    "shortname": "candycaneclub",
    "localizedName": "Candycaneclub"
  },
  {
    "shortname": "cannon",
    "localizedName": "Cannon"
  },
  {
    "shortname": "cannonball",
    "localizedName": "Cannonball"
  },
  {
    "shortname": "captainslog",
    "localizedName": "Captainslog"
  },
  {
    "shortname": "carburetor1",
    "localizedName": "Carburetor1"
  },
  {
    "shortname": "carburetor2",
    "localizedName": "Carburetor2"
  },
  {
    "shortname": "carburetor3",
    "localizedName": "Carburetor3"
  },
  {
    "shortname": "cardtable",
    "localizedName": "Cardtable"
  },
  {
    "shortname": "carvable.pumpkin",
    "localizedName": "Carvable Pumpkin"
  },
  {
    "shortname": "cassette.medium",
    "localizedName": "Cassette Medium"
  },
  {
    "shortname": "cassette",
    "localizedName": "Cassette"
  },
  {
    "shortname": "cassette.short",
    "localizedName": "Cassette Short"
  },
  {
    "shortname": "catapult.ammo.bee",
    "localizedName": "Catapult Ammo Bee"
  },
  {
    "shortname": "catapult.ammo.boulder",
    "localizedName": "Catapult Ammo Boulder"
  },
  {
    "shortname": "catapult.ammo.explosive",
    "localizedName": "Catapult Ammo Explosive"
  },
  {
    "shortname": "catapult.ammo.incendiary",
    "localizedName": "Catapult Ammo Incendiary"
  },
  {
    "shortname": "catapult",
    "localizedName": "Catapult"
  },
  {
    "shortname": "cctv.camera",
    "localizedName": "Cctv Camera"
  },
  {
    "shortname": "ceilinglight.electric.fluorescentlight.ceiling.skin",
    "localizedName": "Ceilinglight Electric Fluorescentlight Ceiling Skin"
  },
  {
    "shortname": "ceilinglight",
    "localizedName": "Ceilinglight"
  },
  {
    "shortname": "chainsaw.krieg.chainsword.skin",
    "localizedName": "Chainsaw Krieg Chainsword Skin"
  },
  {
    "shortname": "chainsaw",
    "localizedName": "Chainsaw"
  },
  {
    "shortname": "chair.beanbag.seat.fabric.skin",
    "localizedName": "Chair Beanbag Seat Fabric Skin"
  },
  {
    "shortname": "chair.beanbag.seat.leather.skin",
    "localizedName": "Chair Beanbag Seat Leather Skin"
  },
  {
    "shortname": "chair.ejector.seat",
    "localizedName": "Chair Ejector Seat"
  },
  {
    "shortname": "chair.ejector.seat.skin",
    "localizedName": "Chair Ejector Seat Skin"
  },
  {
    "shortname": "chair.icethrone",
    "localizedName": "Chair Icethrone"
  },
  {
    "shortname": "chair.icethrone.skin",
    "localizedName": "Chair Icethrone Skin"
  },
  {
    "shortname": "chair",
    "localizedName": "Chair"
  },
  {
    "shortname": "charcoal",
    "localizedName": "Charcoal"
  },
  {
    "shortname": "charity.plushy.01",
    "localizedName": "Charity Plushy 01"
  },
  {
    "shortname": "charity.plushy.02",
    "localizedName": "Charity Plushy 02"
  },
  {
    "shortname": "chicken.burned",
    "localizedName": "Chicken Burned"
  },
  {
    "shortname": "chicken.cooked",
    "localizedName": "Chicken Cooked"
  },
  {
    "shortname": "chicken.costume",
    "localizedName": "Chicken Costume"
  },
  {
    "shortname": "chicken.raw",
    "localizedName": "Chicken Raw"
  },
  {
    "shortname": "chicken.spoiled",
    "localizedName": "Chicken Spoiled"
  },
  {
    "shortname": "chickencoop",
    "localizedName": "Chickencoop"
  },
  {
    "shortname": "chineselantern",
    "localizedName": "Chineselantern"
  },
  {
    "shortname": "chineselanternwhite",
    "localizedName": "Chineselanternwhite"
  },
  {
    "shortname": "chocolate",
    "localizedName": "Chocolate"
  },
  {
    "shortname": "circleballoon2025",
    "localizedName": "Circleballoon2025"
  },
  {
    "shortname": "clantable",
    "localizedName": "Clantable"
  },
  {
    "shortname": "clatter.helmet",
    "localizedName": "Clatter Helmet"
  },
  {
    "shortname": "clone.black.berry",
    "localizedName": "Clone Black Berry"
  },
  {
    "shortname": "clone.blue.berry",
    "localizedName": "Clone Blue Berry"
  },
  {
    "shortname": "clone.corn",
    "localizedName": "Clone Corn"
  },
  {
    "shortname": "clone.green.berry",
    "localizedName": "Clone Green Berry"
  },
  {
    "shortname": "clone.hemp",
    "localizedName": "Clone Hemp"
  },
  {
    "shortname": "clone.orchid",
    "localizedName": "Clone Orchid"
  },
  {
    "shortname": "clone.potato",
    "localizedName": "Clone Potato"
  },
  {
    "shortname": "clone.pumpkin",
    "localizedName": "Clone Pumpkin"
  },
  {
    "shortname": "clone.red.berry",
    "localizedName": "Clone Red Berry"
  },
  {
    "shortname": "clone.rose",
    "localizedName": "Clone Rose"
  },
  {
    "shortname": "clone.sunflower",
    "localizedName": "Clone Sunflower"
  },
  {
    "shortname": "clone.wheat",
    "localizedName": "Clone Wheat"
  },
  {
    "shortname": "clone.white.berry",
    "localizedName": "Clone White Berry"
  },
  {
    "shortname": "clone.yellow.berry",
    "localizedName": "Clone Yellow Berry"
  },
  {
    "shortname": "cloth",
    "localizedName": "Cloth"
  },
  {
    "shortname": "clothing.mannequin",
    "localizedName": "Clothing Mannequin"
  },
  {
    "shortname": "clothing.mod.armorinsert_asbestos",
    "localizedName": "Clothing Mod Armorinsert Asbestos"
  },
  {
    "shortname": "clothing.mod.armorinsert_lead",
    "localizedName": "Clothing Mod Armorinsert Lead"
  },
  {
    "shortname": "clothing.mod.armorinsert_metal",
    "localizedName": "Clothing Mod Armorinsert Metal"
  },
  {
    "shortname": "clothing.mod.armorinsert_wood",
    "localizedName": "Clothing Mod Armorinsert Wood"
  },
  {
    "shortname": "coal",
    "localizedName": "Coal"
  },
  {
    "shortname": "cocoknight.armor.gloves",
    "localizedName": "Cocoknight Armor Gloves"
  },
  {
    "shortname": "cocoknight.armor.helmet",
    "localizedName": "Cocoknight Armor Helmet"
  },
  {
    "shortname": "cocoknight.armor.pants",
    "localizedName": "Cocoknight Armor Pants"
  },
  {
    "shortname": "cocoknight.armor.torso",
    "localizedName": "Cocoknight Armor Torso"
  },
  {
    "shortname": "coconut",
    "localizedName": "Coconut"
  },
  {
    "shortname": "coffeecan.helmet.hat.knightarmour.skin",
    "localizedName": "Coffeecan Helmet Hat Knightarmour Skin"
  },
  {
    "shortname": "coffeecan.helmet",
    "localizedName": "Coffeecan Helmet"
  },
  {
    "shortname": "coffin.storage",
    "localizedName": "Coffin Storage"
  },
  {
    "shortname": "command.block",
    "localizedName": "Command Block"
  },
  {
    "shortname": "compass",
    "localizedName": "Compass"
  },
  {
    "shortname": "component.box.ammo.large",
    "localizedName": "Component Box Ammo Large"
  },
  {
    "shortname": "component.box.armor.large",
    "localizedName": "Component Box Armor Large"
  },
  {
    "shortname": "component.box.charcoal.large",
    "localizedName": "Component Box Charcoal Large"
  },
  {
    "shortname": "component.box.clothing.large",
    "localizedName": "Component Box Clothing Large"
  },
  {
    "shortname": "component.box.comps.large",
    "localizedName": "Component Box Comps Large"
  },
  {
    "shortname": "component.box.explosives.large",
    "localizedName": "Component Box Explosives Large"
  },
  {
    "shortname": "component.box.food.large",
    "localizedName": "Component Box Food Large"
  },
  {
    "shortname": "component.box.guns.large",
    "localizedName": "Component Box Guns Large"
  },
  {
    "shortname": "component.box.meds.large",
    "localizedName": "Component Box Meds Large"
  },
  {
    "shortname": "component.box.metal.large",
    "localizedName": "Component Box Metal Large"
  },
  {
    "shortname": "component.box.ore.large",
    "localizedName": "Component Box Ore Large"
  },
  {
    "shortname": "component.box.scrap.large",
    "localizedName": "Component Box Scrap Large"
  },
  {
    "shortname": "component.box.stone.large",
    "localizedName": "Component Box Stone Large"
  },
  {
    "shortname": "component.box.sulfur.large",
    "localizedName": "Component Box Sulfur Large"
  },
  {
    "shortname": "component.box.tools.large",
    "localizedName": "Component Box Tools Large"
  },
  {
    "shortname": "component.box.wood.large",
    "localizedName": "Component Box Wood Large"
  },
  {
    "shortname": "composter",
    "localizedName": "Composter"
  },
  {
    "shortname": "computerstation",
    "localizedName": "Computerstation"
  },
  {
    "shortname": "computerstation.twitchrivals.sitem",
    "localizedName": "Computerstation Twitchrivals Sitem"
  },
  {
    "shortname": "concretehatchet",
    "localizedName": "Concretehatchet"
  },
  {
    "shortname": "concretepickaxe",
    "localizedName": "Concretepickaxe"
  },
  {
    "shortname": "confetticannon",
    "localizedName": "Confetticannon"
  },
  {
    "shortname": "connected.speaker",
    "localizedName": "Connected Speaker"
  },
  {
    "shortname": "cookingworkbench",
    "localizedName": "Cookingworkbench"
  },
  {
    "shortname": "coolingtea",
    "localizedName": "Coolingtea"
  },
  {
    "shortname": "corn",
    "localizedName": "Corn"
  },
  {
    "shortname": "craftingtea_quality",
    "localizedName": "Craftingtea Quality"
  },
  {
    "shortname": "crankshaft1",
    "localizedName": "Crankshaft1"
  },
  {
    "shortname": "crankshaft2",
    "localizedName": "Crankshaft2"
  },
  {
    "shortname": "crankshaft3",
    "localizedName": "Crankshaft3"
  },
  {
    "shortname": "cratecostume",
    "localizedName": "Cratecostume"
  },
  {
    "shortname": "crocodilemeat.cooked",
    "localizedName": "Crocodilemeat Cooked"
  },
  {
    "shortname": "crocodilemeat",
    "localizedName": "Crocodilemeat"
  },
  {
    "shortname": "crocodilemeat.spoiled",
    "localizedName": "Crocodilemeat Spoiled"
  },
  {
    "shortname": "crossbow",
    "localizedName": "Crossbow"
  },
  {
    "shortname": "crude.oil",
    "localizedName": "Crude Oil"
  },
  {
    "shortname": "cupboard.tool",
    "localizedName": "Cupboard Tool"
  },
  {
    "shortname": "cupboard.tool.retro",
    "localizedName": "Cupboard Tool Retro"
  },
  {
    "shortname": "cupboard.tool.retro.skin",
    "localizedName": "Cupboard Tool Retro Skin"
  },
  {
    "shortname": "cupboard.tool.shockbyte",
    "localizedName": "Cupboard Tool Shockbyte"
  },
  {
    "shortname": "cupboard.tool.shockbyte.skin",
    "localizedName": "Cupboard Tool Shockbyte Skin"
  },
  {
    "shortname": "cursedcauldron",
    "localizedName": "Cursedcauldron"
  },
  {
    "shortname": "dart.incapacitate",
    "localizedName": "Dart Incapacitate"
  },
  {
    "shortname": "dart.radiation",
    "localizedName": "Dart Radiation"
  },
  {
    "shortname": "dart.scatter",
    "localizedName": "Dart Scatter"
  },
  {
    "shortname": "dart.wood",
    "localizedName": "Dart Wood"
  },
  {
    "shortname": "deer.skull.mask",
    "localizedName": "Deer Skull Mask"
  },
  {
    "shortname": "deermeat.burned",
    "localizedName": "Deermeat Burned"
  },
  {
    "shortname": "deermeat.cooked",
    "localizedName": "Deermeat Cooked"
  },
  {
    "shortname": "deermeat.raw",
    "localizedName": "Deermeat Raw"
  },
  {
    "shortname": "deermeat.spoiled",
    "localizedName": "Deermeat Spoiled"
  },
  {
    "shortname": "diesel_barrel",
    "localizedName": "Diesel Barrel"
  },
  {
    "shortname": "discoball",
    "localizedName": "Discoball"
  },
  {
    "shortname": "discofloor.largetiles",
    "localizedName": "Discofloor Largetiles"
  },
  {
    "shortname": "discofloor",
    "localizedName": "Discofloor"
  },
  {
    "shortname": "discord.trophy",
    "localizedName": "Discord Trophy"
  },
  {
    "shortname": "diverhatchet",
    "localizedName": "Diverhatchet"
  },
  {
    "shortname": "diverpickaxe",
    "localizedName": "Diverpickaxe"
  },
  {
    "shortname": "divertorch",
    "localizedName": "Divertorch"
  },
  {
    "shortname": "diving.fins",
    "localizedName": "Diving Fins"
  },
  {
    "shortname": "diving.mask",
    "localizedName": "Diving Mask"
  },
  {
    "shortname": "diving.tank.double",
    "localizedName": "Diving Tank Double"
  },
  {
    "shortname": "diving.tank",
    "localizedName": "Diving Tank"
  },
  {
    "shortname": "diving.wetsuit",
    "localizedName": "Diving Wetsuit"
  },
  {
    "shortname": "documents",
    "localizedName": "Documents"
  },
  {
    "shortname": "dogtagneutral",
    "localizedName": "Dogtagneutral"
  },
  {
    "shortname": "door.closer",
    "localizedName": "Door Closer"
  },
  {
    "shortname": "door.double.hinged.bardoors",
    "localizedName": "Door Double Hinged Bardoors"
  },
  {
    "shortname": "door.double.hinged.metal.medieval.door.double.hinged.skin",
    "localizedName": "Door Double Hinged Metal Medieval Door Double Hinged Skin"
  },
  {
    "shortname": "door.double.hinged.metal",
    "localizedName": "Door Double Hinged Metal"
  },
  {
    "shortname": "door.double.hinged.toptier",
    "localizedName": "Door Double Hinged Toptier"
  },
  {
    "shortname": "door.double.hinged.wood",
    "localizedName": "Door Double Hinged Wood"
  },
  {
    "shortname": "door.hinged.boat.wood",
    "localizedName": "Door Hinged Boat Wood"
  },
  {
    "shortname": "door.hinged.industrial.a",
    "localizedName": "Door Hinged Industrial A"
  },
  {
    "shortname": "door.hinged.metal.industrial.a.skin",
    "localizedName": "Door Hinged Metal Industrial A Skin"
  },
  {
    "shortname": "door.hinged.metal.industrial.d.skin",
    "localizedName": "Door Hinged Metal Industrial D Skin"
  },
  {
    "shortname": "door.hinged.metal.medieval.skin",
    "localizedName": "Door Hinged Metal Medieval Skin"
  },
  {
    "shortname": "door.hinged.metal",
    "localizedName": "Door Hinged Metal"
  },
  {
    "shortname": "door.hinged.toptier",
    "localizedName": "Door Hinged Toptier"
  },
  {
    "shortname": "door.hinged.wood",
    "localizedName": "Door Hinged Wood"
  },
  {
    "shortname": "door.key",
    "localizedName": "Door Key"
  },
  {
    "shortname": "draculacape",
    "localizedName": "Draculacape"
  },
  {
    "shortname": "draculamask",
    "localizedName": "Draculamask"
  },
  {
    "shortname": "dragondoorknocker",
    "localizedName": "Dragondoorknocker"
  },
  {
    "shortname": "drone",
    "localizedName": "Drone"
  },
  {
    "shortname": "dropbox",
    "localizedName": "Dropbox"
  },
  {
    "shortname": "drumkit",
    "localizedName": "Drumkit"
  },
  {
    "shortname": "ducttape",
    "localizedName": "Ducttape"
  },
  {
    "shortname": "easel",
    "localizedName": "Easel"
  },
  {
    "shortname": "easter.bronzeegg",
    "localizedName": "Easter Bronzeegg"
  },
  {
    "shortname": "easter.goldegg",
    "localizedName": "Easter Goldegg"
  },
  {
    "shortname": "easter.paintedeggs",
    "localizedName": "Easter Paintedeggs"
  },
  {
    "shortname": "easter.silveregg",
    "localizedName": "Easter Silveregg"
  },
  {
    "shortname": "easterbasket",
    "localizedName": "Easterbasket"
  },
  {
    "shortname": "easterdoorwreath",
    "localizedName": "Easterdoorwreath"
  },
  {
    "shortname": "egg",
    "localizedName": "Egg"
  },
  {
    "shortname": "electric.andswitch",
    "localizedName": "Electric Andswitch"
  },
  {
    "shortname": "electric.audioalarm",
    "localizedName": "Electric Audioalarm"
  },
  {
    "shortname": "electric.battery.rechargable.large",
    "localizedName": "Electric Battery Rechargable Large"
  },
  {
    "shortname": "electric.battery.rechargable.medium",
    "localizedName": "Electric Battery Rechargable Medium"
  },
  {
    "shortname": "electric.battery.rechargable.small",
    "localizedName": "Electric Battery Rechargable Small"
  },
  {
    "shortname": "electric.blocker",
    "localizedName": "Electric Blocker"
  },
  {
    "shortname": "electric.bulbstringlights",
    "localizedName": "Electric Bulbstringlights"
  },
  {
    "shortname": "electric.button",
    "localizedName": "Electric Button"
  },
  {
    "shortname": "electric.cabletunnel",
    "localizedName": "Electric Cabletunnel"
  },
  {
    "shortname": "electric.chandelier",
    "localizedName": "Electric Chandelier"
  },
  {
    "shortname": "electric.counter",
    "localizedName": "Electric Counter"
  },
  {
    "shortname": "electric.digitalclock",
    "localizedName": "Electric Digitalclock"
  },
  {
    "shortname": "electric.doorcontroller",
    "localizedName": "Electric Doorcontroller"
  },
  {
    "shortname": "electric.fairylights",
    "localizedName": "Electric Fairylights"
  },
  {
    "shortname": "electric.flasherlight",
    "localizedName": "Electric Flasherlight"
  },
  {
    "shortname": "electric.fluorescentlight.ceiling",
    "localizedName": "Electric Fluorescentlight Ceiling"
  },
  {
    "shortname": "electric.fluorescentlight",
    "localizedName": "Electric Fluorescentlight"
  },
  {
    "shortname": "electric.fuelgenerator.small",
    "localizedName": "Electric Fuelgenerator Small"
  },
  {
    "shortname": "electric.furnace",
    "localizedName": "Electric Furnace"
  },
  {
    "shortname": "electric.generator.small",
    "localizedName": "Electric Generator Small"
  },
  {
    "shortname": "electric.hbhfsensor",
    "localizedName": "Electric Hbhfsensor"
  },
  {
    "shortname": "electric.heater",
    "localizedName": "Electric Heater"
  },
  {
    "shortname": "electric.igniter",
    "localizedName": "Electric Igniter"
  },
  {
    "shortname": "electric.laserdetector",
    "localizedName": "Electric Laserdetector"
  },
  {
    "shortname": "electric.orswitch",
    "localizedName": "Electric Orswitch"
  },
  {
    "shortname": "electric.pressurepad",
    "localizedName": "Electric Pressurepad"
  },
  {
    "shortname": "electric.random.switch",
    "localizedName": "Electric Random Switch"
  },
  {
    "shortname": "electric.rf.broadcaster",
    "localizedName": "Electric Rf Broadcaster"
  },
  {
    "shortname": "electric.rf.receiver",
    "localizedName": "Electric Rf Receiver"
  },
  {
    "shortname": "electric.seismicsensor",
    "localizedName": "Electric Seismicsensor"
  },
  {
    "shortname": "electric.simplelight",
    "localizedName": "Electric Simplelight"
  },
  {
    "shortname": "electric.sirenlight",
    "localizedName": "Electric Sirenlight"
  },
  {
    "shortname": "electric.solarpanel.large",
    "localizedName": "Electric Solarpanel Large"
  },
  {
    "shortname": "electric.splitter",
    "localizedName": "Electric Splitter"
  },
  {
    "shortname": "electric.spotlight",
    "localizedName": "Electric Spotlight"
  },
  {
    "shortname": "electric.spotlight.tripod",
    "localizedName": "Electric Spotlight Tripod"
  },
  {
    "shortname": "electric.sprinkler",
    "localizedName": "Electric Sprinkler"
  },
  {
    "shortname": "electric.switch",
    "localizedName": "Electric Switch"
  },
  {
    "shortname": "electric.tablelight",
    "localizedName": "Electric Tablelight"
  },
  {
    "shortname": "electric.teslacoil",
    "localizedName": "Electric Teslacoil"
  },
  {
    "shortname": "electric.timer",
    "localizedName": "Electric Timer"
  },
  {
    "shortname": "electric.wallcabinet",
    "localizedName": "Electric Wallcabinet"
  },
  {
    "shortname": "electric.xorswitch",
    "localizedName": "Electric Xorswitch"
  },
  {
    "shortname": "electrical.branch",
    "localizedName": "Electrical Branch"
  },
  {
    "shortname": "electrical.combiner",
    "localizedName": "Electrical Combiner"
  },
  {
    "shortname": "electrical.memorycell",
    "localizedName": "Electrical Memorycell"
  },
  {
    "shortname": "elevator",
    "localizedName": "Elevator"
  },
  {
    "shortname": "explosive.satchel",
    "localizedName": "Explosive Satchel"
  },
  {
    "shortname": "explosive.timed",
    "localizedName": "Explosive Timed"
  },
  {
    "shortname": "explosives",
    "localizedName": "Explosives"
  },
  {
    "shortname": "factorydoor",
    "localizedName": "Factorydoor"
  },
  {
    "shortname": "fat.animal",
    "localizedName": "Fat Animal"
  },
  {
    "shortname": "fertilizer",
    "localizedName": "Fertilizer"
  },
  {
    "shortname": "fireplace.stone",
    "localizedName": "Fireplace Stone"
  },
  {
    "shortname": "firework.boomer.blue",
    "localizedName": "Firework Boomer Blue"
  },
  {
    "shortname": "firework.boomer.champagne",
    "localizedName": "Firework Boomer Champagne"
  },
  {
    "shortname": "firework.boomer.green",
    "localizedName": "Firework Boomer Green"
  },
  {
    "shortname": "firework.boomer.orange",
    "localizedName": "Firework Boomer Orange"
  },
  {
    "shortname": "firework.boomer.pattern",
    "localizedName": "Firework Boomer Pattern"
  },
  {
    "shortname": "firework.boomer.red",
    "localizedName": "Firework Boomer Red"
  },
  {
    "shortname": "firework.boomer.violet",
    "localizedName": "Firework Boomer Violet"
  },
  {
    "shortname": "firework.romancandle.blue",
    "localizedName": "Firework Romancandle Blue"
  },
  {
    "shortname": "firework.romancandle.green",
    "localizedName": "Firework Romancandle Green"
  },
  {
    "shortname": "firework.romancandle.red",
    "localizedName": "Firework Romancandle Red"
  },
  {
    "shortname": "firework.romancandle.violet",
    "localizedName": "Firework Romancandle Violet"
  },
  {
    "shortname": "firework.volcano",
    "localizedName": "Firework Volcano"
  },
  {
    "shortname": "firework.volcano.red",
    "localizedName": "Firework Volcano Red"
  },
  {
    "shortname": "firework.volcano.violet",
    "localizedName": "Firework Volcano Violet"
  },
  {
    "shortname": "fish.anchovy",
    "localizedName": "Fish Anchovy"
  },
  {
    "shortname": "fish.catfish",
    "localizedName": "Fish Catfish"
  },
  {
    "shortname": "fish.cooked",
    "localizedName": "Fish Cooked"
  },
  {
    "shortname": "fish.herring",
    "localizedName": "Fish Herring"
  },
  {
    "shortname": "fish.minnows",
    "localizedName": "Fish Minnows"
  },
  {
    "shortname": "fish.orangeroughy",
    "localizedName": "Fish Orangeroughy"
  },
  {
    "shortname": "fish.raw",
    "localizedName": "Fish Raw"
  },
  {
    "shortname": "fish.salmon",
    "localizedName": "Fish Salmon"
  },
  {
    "shortname": "fish.sardine",
    "localizedName": "Fish Sardine"
  },
  {
    "shortname": "fish.smallshark",
    "localizedName": "Fish Smallshark"
  },
  {
    "shortname": "fish.spoiled",
    "localizedName": "Fish Spoiled"
  },
  {
    "shortname": "fish.troutsmall",
    "localizedName": "Fish Troutsmall"
  },
  {
    "shortname": "fish.yellowperch",
    "localizedName": "Fish Yellowperch"
  },
  {
    "shortname": "fishing.tackle",
    "localizedName": "Fishing Tackle"
  },
  {
    "shortname": "fishingrod.handmade",
    "localizedName": "Fishingrod Handmade"
  },
  {
    "shortname": "fishtrap.small",
    "localizedName": "Fishtrap Small"
  },
  {
    "shortname": "fishtrophy",
    "localizedName": "Fishtrophy"
  },
  {
    "shortname": "flamethrower",
    "localizedName": "Flamethrower"
  },
  {
    "shortname": "flameturret",
    "localizedName": "Flameturret"
  },
  {
    "shortname": "flare",
    "localizedName": "Flare"
  },
  {
    "shortname": "flashlight.held",
    "localizedName": "Flashlight Held"
  },
  {
    "shortname": "floor.grill",
    "localizedName": "Floor Grill"
  },
  {
    "shortname": "floor.ladder.hatch",
    "localizedName": "Floor Ladder Hatch"
  },
  {
    "shortname": "floor.ladder.hatch.toptier",
    "localizedName": "Floor Ladder Hatch Toptier"
  },
  {
    "shortname": "floor.triangle.grill",
    "localizedName": "Floor Triangle Grill"
  },
  {
    "shortname": "floor.triangle.ladder.hatch",
    "localizedName": "Floor Triangle Ladder Hatch"
  },
  {
    "shortname": "floor.triangle.ladder.hatch.toptier",
    "localizedName": "Floor Triangle Ladder Hatch Toptier"
  },
  {
    "shortname": "fluid.combiner",
    "localizedName": "Fluid Combiner"
  },
  {
    "shortname": "fluid.splitter",
    "localizedName": "Fluid Splitter"
  },
  {
    "shortname": "fluid.switch",
    "localizedName": "Fluid Switch"
  },
  {
    "shortname": "fogmachine",
    "localizedName": "Fogmachine"
  },
  {
    "shortname": "frankensteinmask",
    "localizedName": "Frankensteinmask"
  },
  {
    "shortname": "frankensteins.monster.01.head",
    "localizedName": "Frankensteins Monster 01 Head"
  },
  {
    "shortname": "frankensteins.monster.01.legs",
    "localizedName": "Frankensteins Monster 01 Legs"
  },
  {
    "shortname": "frankensteins.monster.01.torso",
    "localizedName": "Frankensteins Monster 01 Torso"
  },
  {
    "shortname": "frankensteins.monster.02.head",
    "localizedName": "Frankensteins Monster 02 Head"
  },
  {
    "shortname": "frankensteins.monster.02.legs",
    "localizedName": "Frankensteins Monster 02 Legs"
  },
  {
    "shortname": "frankensteins.monster.02.torso",
    "localizedName": "Frankensteins Monster 02 Torso"
  },
  {
    "shortname": "frankensteins.monster.03.head",
    "localizedName": "Frankensteins Monster 03 Head"
  },
  {
    "shortname": "frankensteins.monster.03.legs",
    "localizedName": "Frankensteins Monster 03 Legs"
  },
  {
    "shortname": "frankensteins.monster.03.torso",
    "localizedName": "Frankensteins Monster 03 Torso"
  },
  {
    "shortname": "frankensteintable",
    "localizedName": "Frankensteintable"
  },
  {
    "shortname": "fridge",
    "localizedName": "Fridge"
  },
  {
    "shortname": "frontiermirror.large",
    "localizedName": "Frontiermirror Large"
  },
  {
    "shortname": "frontiermirror.medium",
    "localizedName": "Frontiermirror Medium"
  },
  {
    "shortname": "frontiermirror.small",
    "localizedName": "Frontiermirror Small"
  },
  {
    "shortname": "frontiermirror.standing",
    "localizedName": "Frontiermirror Standing"
  },
  {
    "shortname": "frontier_hatchet",
    "localizedName": "Frontier Hatchet"
  },
  {
    "shortname": "fun.bass",
    "localizedName": "Fun Bass"
  },
  {
    "shortname": "fun.boomboxportable",
    "localizedName": "Fun Boomboxportable"
  },
  {
    "shortname": "fun.casetterecorder",
    "localizedName": "Fun Casetterecorder"
  },
  {
    "shortname": "fun.cowbell",
    "localizedName": "Fun Cowbell"
  },
  {
    "shortname": "fun.flute",
    "localizedName": "Fun Flute"
  },
  {
    "shortname": "fun.guitar",
    "localizedName": "Fun Guitar"
  },
  {
    "shortname": "fun.jerrycanguitar",
    "localizedName": "Fun Jerrycanguitar"
  },
  {
    "shortname": "fun.tambourine",
    "localizedName": "Fun Tambourine"
  },
  {
    "shortname": "fun.trumpet",
    "localizedName": "Fun Trumpet"
  },
  {
    "shortname": "fun.tuba",
    "localizedName": "Fun Tuba"
  },
  {
    "shortname": "furnace.large",
    "localizedName": "Furnace Large"
  },
  {
    "shortname": "furnace.legacy.skin",
    "localizedName": "Furnace Legacy Skin"
  },
  {
    "shortname": "furnace",
    "localizedName": "Furnace"
  },
  {
    "shortname": "fuse",
    "localizedName": "Fuse"
  },
  {
    "shortname": "gates.external.high.adobe",
    "localizedName": "Gates External High Adobe"
  },
  {
    "shortname": "gates.external.high.legacy",
    "localizedName": "Gates External High Legacy"
  },
  {
    "shortname": "gates.external.high.stone.gates.external.high.adobe.sitem",
    "localizedName": "Gates External High Stone Gates External High Adobe Sitem"
  },
  {
    "shortname": "gates.external.high.stone",
    "localizedName": "Gates External High Stone"
  },
  {
    "shortname": "gates.external.high.wood.gates.external.high.frontier.sitem",
    "localizedName": "Gates External High Wood Gates External High Frontier Sitem"
  },
  {
    "shortname": "gates.external.high.wood",
    "localizedName": "Gates External High Wood"
  },
  {
    "shortname": "gears",
    "localizedName": "Gears"
  },
  {
    "shortname": "geiger.counter",
    "localizedName": "Geiger Counter"
  },
  {
    "shortname": "generator.water",
    "localizedName": "Generator Water"
  },
  {
    "shortname": "generator.wind.scrap",
    "localizedName": "Generator Wind Scrap"
  },
  {
    "shortname": "ghostsheet",
    "localizedName": "Ghostsheet"
  },
  {
    "shortname": "giantcandycanedecor",
    "localizedName": "Giantcandycanedecor"
  },
  {
    "shortname": "giantlollipops",
    "localizedName": "Giantlollipops"
  },
  {
    "shortname": "gingerbreadsuit",
    "localizedName": "Gingerbreadsuit"
  },
  {
    "shortname": "gloweyes",
    "localizedName": "Gloweyes"
  },
  {
    "shortname": "glue",
    "localizedName": "Glue"
  },
  {
    "shortname": "goldframe.large",
    "localizedName": "Goldframe Large"
  },
  {
    "shortname": "goldframe.medium",
    "localizedName": "Goldframe Medium"
  },
  {
    "shortname": "goldframe.small",
    "localizedName": "Goldframe Small"
  },
  {
    "shortname": "goldframe.standing",
    "localizedName": "Goldframe Standing"
  },
  {
    "shortname": "goldframe.xl",
    "localizedName": "Goldframe Xl"
  },
  {
    "shortname": "goldframe.xxl",
    "localizedName": "Goldframe Xxl"
  },
  {
    "shortname": "goldmirror.large",
    "localizedName": "Goldmirror Large"
  },
  {
    "shortname": "goldmirror.medium",
    "localizedName": "Goldmirror Medium"
  },
  {
    "shortname": "goldmirror.small",
    "localizedName": "Goldmirror Small"
  },
  {
    "shortname": "goldmirror.standing",
    "localizedName": "Goldmirror Standing"
  },
  {
    "shortname": "granolabar",
    "localizedName": "Granolabar"
  },
  {
    "shortname": "gravestone",
    "localizedName": "Gravestone"
  },
  {
    "shortname": "grayidtag",
    "localizedName": "Grayidtag"
  },
  {
    "shortname": "green.berry",
    "localizedName": "Green Berry"
  },
  {
    "shortname": "greenidtag",
    "localizedName": "Greenidtag"
  },
  {
    "shortname": "grenade.beancan",
    "localizedName": "Grenade Beancan"
  },
  {
    "shortname": "grenade.bee",
    "localizedName": "Grenade Bee"
  },
  {
    "shortname": "grenade.f1",
    "localizedName": "Grenade F1"
  },
  {
    "shortname": "grenade.flashbang",
    "localizedName": "Grenade Flashbang"
  },
  {
    "shortname": "grenade.molotov",
    "localizedName": "Grenade Molotov"
  },
  {
    "shortname": "grenade.smoke",
    "localizedName": "Grenade Smoke"
  },
  {
    "shortname": "grub",
    "localizedName": "Grub"
  },
  {
    "shortname": "gun.water",
    "localizedName": "Gun Water"
  },
  {
    "shortname": "gun.water.watergun.green",
    "localizedName": "Gun Water Watergun Green"
  },
  {
    "shortname": "gun.water.watergun.grey",
    "localizedName": "Gun Water Watergun Grey"
  },
  {
    "shortname": "gun.water.watergun.orange",
    "localizedName": "Gun Water Watergun Orange"
  },
  {
    "shortname": "gun.water.watergun.yellow",
    "localizedName": "Gun Water Watergun Yellow"
  },
  {
    "shortname": "gunpowder",
    "localizedName": "Gunpowder"
  },
  {
    "shortname": "gunrack.horizontal",
    "localizedName": "Gunrack Horizontal"
  },
  {
    "shortname": "gunrack.single.1.horizontal",
    "localizedName": "Gunrack Single 1 Horizontal"
  },
  {
    "shortname": "gunrack.single.2.horizontal",
    "localizedName": "Gunrack Single 2 Horizontal"
  },
  {
    "shortname": "gunrack.single.3.horizontal",
    "localizedName": "Gunrack Single 3 Horizontal"
  },
  {
    "shortname": "gunrack_stand",
    "localizedName": "Gunrack Stand"
  },
  {
    "shortname": "gunrack_tall.horizontal",
    "localizedName": "Gunrack Tall Horizontal"
  },
  {
    "shortname": "gunrack_wide.horizontal",
    "localizedName": "Gunrack Wide Horizontal"
  },
  {
    "shortname": "guntrap",
    "localizedName": "Guntrap"
  },
  {
    "shortname": "hab.armor",
    "localizedName": "Hab Armor"
  },
  {
    "shortname": "hab",
    "localizedName": "Hab"
  },
  {
    "shortname": "half.bamboo.shelves",
    "localizedName": "Half Bamboo Shelves"
  },
  {
    "shortname": "halloween.candy",
    "localizedName": "Halloween Candy"
  },
  {
    "shortname": "halloween.lootbag.large",
    "localizedName": "Halloween Lootbag Large"
  },
  {
    "shortname": "halloween.lootbag.medium",
    "localizedName": "Halloween Lootbag Medium"
  },
  {
    "shortname": "halloween.lootbag.small",
    "localizedName": "Halloween Lootbag Small"
  },
  {
    "shortname": "halloween.mummysuit",
    "localizedName": "Halloween Mummysuit"
  },
  {
    "shortname": "halloween.surgeonsuit",
    "localizedName": "Halloween Surgeonsuit"
  },
  {
    "shortname": "hammer",
    "localizedName": "Hammer"
  },
  {
    "shortname": "hammer.salvaged",
    "localizedName": "Hammer Salvaged"
  },
  {
    "shortname": "handcuffs",
    "localizedName": "Handcuffs"
  },
  {
    "shortname": "harvestingtea",
    "localizedName": "Harvestingtea"
  },
  {
    "shortname": "hat.beenie.black",
    "localizedName": "Hat Beenie Black"
  },
  {
    "shortname": "hat.beenie.blue",
    "localizedName": "Hat Beenie Blue"
  },
  {
    "shortname": "hat.beenie.green",
    "localizedName": "Hat Beenie Green"
  },
  {
    "shortname": "hat.beenie",
    "localizedName": "Hat Beenie"
  },
  {
    "shortname": "hat.beenie.red",
    "localizedName": "Hat Beenie Red"
  },
  {
    "shortname": "hat.beenie.skin.beenie.rastabeenie",
    "localizedName": "Hat Beenie Skin Beenie Rastabeenie"
  },
  {
    "shortname": "hat.beenie.skin.beenie.winterdeers",
    "localizedName": "Hat Beenie Skin Beenie Winterdeers"
  },
  {
    "shortname": "hat.boonie",
    "localizedName": "Hat Boonie"
  },
  {
    "shortname": "hat.boonie.skin.boonie.farmerhat",
    "localizedName": "Hat Boonie Skin Boonie Farmerhat"
  },
  {
    "shortname": "hat.bunnyhat",
    "localizedName": "Hat Bunnyhat"
  },
  {
    "shortname": "hat.candle.birthday",
    "localizedName": "Hat Candle Birthday"
  },
  {
    "shortname": "hat.candle.birthday.skin",
    "localizedName": "Hat Candle Birthday Skin"
  },
  {
    "shortname": "hat.candle",
    "localizedName": "Hat Candle"
  },
  {
    "shortname": "hat.cap.blue",
    "localizedName": "Hat Cap Blue"
  },
  {
    "shortname": "hat.cap.forestcamo",
    "localizedName": "Hat Cap Forestcamo"
  },
  {
    "shortname": "hat.cap.green",
    "localizedName": "Hat Cap Green"
  },
  {
    "shortname": "hat.cap.grey",
    "localizedName": "Hat Cap Grey"
  },
  {
    "shortname": "hat.cap",
    "localizedName": "Hat Cap"
  },
  {
    "shortname": "hat.cap.red",
    "localizedName": "Hat Cap Red"
  },
  {
    "shortname": "hat.cap.skin.cap.friendlycap",
    "localizedName": "Hat Cap Skin Cap Friendlycap"
  },
  {
    "shortname": "hat.cap.skin.cap.rescuecap",
    "localizedName": "Hat Cap Skin Cap Rescuecap"
  },
  {
    "shortname": "hat.dragonmask",
    "localizedName": "Hat Dragonmask"
  },
  {
    "shortname": "hat.gas.mask",
    "localizedName": "Hat Gas Mask"
  },
  {
    "shortname": "hat.horsemask",
    "localizedName": "Hat Horsemask"
  },
  {
    "shortname": "hat.miner",
    "localizedName": "Hat Miner"
  },
  {
    "shortname": "hat.oxmask",
    "localizedName": "Hat Oxmask"
  },
  {
    "shortname": "hat.rabbitmask",
    "localizedName": "Hat Rabbitmask"
  },
  {
    "shortname": "hat.ratmask",
    "localizedName": "Hat Ratmask"
  },
  {
    "shortname": "hat.snakemask",
    "localizedName": "Hat Snakemask"
  },
  {
    "shortname": "hat.tigermask",
    "localizedName": "Hat Tigermask"
  },
  {
    "shortname": "hat.wellipets",
    "localizedName": "Hat Wellipets"
  },
  {
    "shortname": "hat.wolf",
    "localizedName": "Hat Wolf"
  },
  {
    "shortname": "hatchet.diver_.skin",
    "localizedName": "Hatchet Diver  Skin"
  },
  {
    "shortname": "hatchet.frontier_.skin",
    "localizedName": "Hatchet Frontier  Skin"
  },
  {
    "shortname": "hatchet.lumberjack_axe.skin",
    "localizedName": "Hatchet Lumberjack Axe Skin"
  },
  {
    "shortname": "hatchet",
    "localizedName": "Hatchet"
  },
  {
    "shortname": "hazmat.krieg",
    "localizedName": "Hazmat Krieg"
  },
  {
    "shortname": "hazmat.plushy",
    "localizedName": "Hazmat Plushy"
  },
  {
    "shortname": "hazmatsuit.arcticsuit",
    "localizedName": "Hazmatsuit Arcticsuit"
  },
  {
    "shortname": "hazmatsuit.diver",
    "localizedName": "Hazmatsuit Diver"
  },
  {
    "shortname": "hazmatsuit.diver.skin",
    "localizedName": "Hazmatsuit Diver Skin"
  },
  {
    "shortname": "hazmatsuit.frontier",
    "localizedName": "Hazmatsuit Frontier"
  },
  {
    "shortname": "hazmatsuit.hazmat.arctic.skin",
    "localizedName": "Hazmatsuit Hazmat Arctic Skin"
  },
  {
    "shortname": "hazmatsuit.hazmat.frontier.skin",
    "localizedName": "Hazmatsuit Hazmat Frontier Skin"
  },
  {
    "shortname": "hazmatsuit.hazmat.lumberjack.skin",
    "localizedName": "Hazmatsuit Hazmat Lumberjack Skin"
  },
  {
    "shortname": "hazmatsuit.hazmat.nomad.skin",
    "localizedName": "Hazmatsuit Hazmat Nomad Skin"
  },
  {
    "shortname": "hazmatsuit.hazmat.pilot.skin",
    "localizedName": "Hazmatsuit Hazmat Pilot Skin"
  },
  {
    "shortname": "hazmatsuit.hazmat.spacesuit.skin",
    "localizedName": "Hazmatsuit Hazmat Spacesuit Skin"
  },
  {
    "shortname": "hazmatsuit.kick.hazmat.skin",
    "localizedName": "Hazmatsuit Kick Hazmat Skin"
  },
  {
    "shortname": "hazmatsuit.kick",
    "localizedName": "Hazmatsuit Kick"
  },
  {
    "shortname": "hazmatsuit.krieg.hazmat.skin",
    "localizedName": "Hazmatsuit Krieg Hazmat Skin"
  },
  {
    "shortname": "hazmatsuit.lumberjack",
    "localizedName": "Hazmatsuit Lumberjack"
  },
  {
    "shortname": "hazmatsuit.nomadsuit",
    "localizedName": "Hazmatsuit Nomadsuit"
  },
  {
    "shortname": "hazmatsuit.pilot",
    "localizedName": "Hazmatsuit Pilot"
  },
  {
    "shortname": "hazmatsuit",
    "localizedName": "Hazmatsuit"
  },
  {
    "shortname": "hazmatsuit.spacesuit",
    "localizedName": "Hazmatsuit Spacesuit"
  },
  {
    "shortname": "hazmatsuittwitch",
    "localizedName": "Hazmatsuittwitch"
  },
  {
    "shortname": "hazmatsuit_scientist",
    "localizedName": "Hazmatsuit Scientist"
  },
  {
    "shortname": "hazmatsuit_scientist_arctic",
    "localizedName": "Hazmatsuit Scientist Arctic"
  },
  {
    "shortname": "hazmatsuit_scientist_naval",
    "localizedName": "Hazmatsuit Scientist Naval"
  },
  {
    "shortname": "hazmatsuit_scientist_nvgm",
    "localizedName": "Hazmatsuit Scientist Nvgm"
  },
  {
    "shortname": "hazmatsuit_scientist_peacekeeper",
    "localizedName": "Hazmatsuit Scientist Peacekeeper"
  },
  {
    "shortname": "hazmatyoutooz",
    "localizedName": "Hazmatyoutooz"
  },
  {
    "shortname": "head.bag",
    "localizedName": "Head Bag"
  },
  {
    "shortname": "healingtea.advanced",
    "localizedName": "Healingtea Advanced"
  },
  {
    "shortname": "healingtea",
    "localizedName": "Healingtea"
  },
  {
    "shortname": "healingtea.pure",
    "localizedName": "Healingtea Pure"
  },
  {
    "shortname": "heartballoon2025",
    "localizedName": "Heartballoon2025"
  },
  {
    "shortname": "heavy.plate.helmet",
    "localizedName": "Heavy Plate Helmet"
  },
  {
    "shortname": "heavy.plate.jacket",
    "localizedName": "Heavy Plate Jacket"
  },
  {
    "shortname": "heavy.plate.pants",
    "localizedName": "Heavy Plate Pants"
  },
  {
    "shortname": "heavy.scientist.plushie",
    "localizedName": "Heavy Scientist Plushie"
  },
  {
    "shortname": "heavyscientistyoutooz",
    "localizedName": "Heavyscientistyoutooz"
  },
  {
    "shortname": "hitchtroughcombo",
    "localizedName": "Hitchtroughcombo"
  },
  {
    "shortname": "hmlmg",
    "localizedName": "Hmlmg"
  },
  {
    "shortname": "hobobarrel",
    "localizedName": "Hobobarrel"
  },
  {
    "shortname": "homingmissile.launcher",
    "localizedName": "Homingmissile Launcher"
  },
  {
    "shortname": "honey",
    "localizedName": "Honey"
  },
  {
    "shortname": "honeycomb",
    "localizedName": "Honeycomb"
  },
  {
    "shortname": "hoodie.black",
    "localizedName": "Hoodie Black"
  },
  {
    "shortname": "hoodie.blue",
    "localizedName": "Hoodie Blue"
  },
  {
    "shortname": "hoodie.green",
    "localizedName": "Hoodie Green"
  },
  {
    "shortname": "hoodie",
    "localizedName": "Hoodie"
  },
  {
    "shortname": "hoodie.skin.bchillz",
    "localizedName": "Hoodie Skin Bchillz"
  },
  {
    "shortname": "hoodie.skin.bloody",
    "localizedName": "Hoodie Skin Bloody"
  },
  {
    "shortname": "hoodie.skin.cuda87",
    "localizedName": "Hoodie Skin Cuda87"
  },
  {
    "shortname": "hoodie.skin.rhinocrunch",
    "localizedName": "Hoodie Skin Rhinocrunch"
  },
  {
    "shortname": "hoodie.skin.safetycrew",
    "localizedName": "Hoodie Skin Safetycrew"
  },
  {
    "shortname": "hoodie.skin.skeleton",
    "localizedName": "Hoodie Skin Skeleton"
  },
  {
    "shortname": "hopper",
    "localizedName": "Hopper"
  },
  {
    "shortname": "horse.armor.lny26",
    "localizedName": "Horse Armor Lny26"
  },
  {
    "shortname": "horse.armor.roadsign.horse.armor.lny26.sitem",
    "localizedName": "Horse Armor Roadsign Horse Armor Lny26 Sitem"
  },
  {
    "shortname": "horse.armor.roadsign",
    "localizedName": "Horse Armor Roadsign"
  },
  {
    "shortname": "horse.armor.wood",
    "localizedName": "Horse Armor Wood"
  },
  {
    "shortname": "horse.costume",
    "localizedName": "Horse Costume"
  },
  {
    "shortname": "horse",
    "localizedName": "Horse"
  },
  {
    "shortname": "horse.saddle.double",
    "localizedName": "Horse Saddle Double"
  },
  {
    "shortname": "horse.saddle",
    "localizedName": "Horse Saddle"
  },
  {
    "shortname": "horse.saddle.single",
    "localizedName": "Horse Saddle Single"
  },
  {
    "shortname": "horse.saddlebag",
    "localizedName": "Horse Saddlebag"
  },
  {
    "shortname": "horse.shoes.advanced",
    "localizedName": "Horse Shoes Advanced"
  },
  {
    "shortname": "horse.shoes.basic",
    "localizedName": "Horse Shoes Basic"
  },
  {
    "shortname": "horsedung",
    "localizedName": "Horsedung"
  },
  {
    "shortname": "horsemeat.burned",
    "localizedName": "Horsemeat Burned"
  },
  {
    "shortname": "horsemeat.cooked",
    "localizedName": "Horsemeat Cooked"
  },
  {
    "shortname": "horsemeat.raw",
    "localizedName": "Horsemeat Raw"
  },
  {
    "shortname": "horsemeat.spoiled",
    "localizedName": "Horsemeat Spoiled"
  },
  {
    "shortname": "hosetool",
    "localizedName": "Hosetool"
  },
  {
    "shortname": "hq.metal.ore",
    "localizedName": "Hq Metal Ore"
  },
  {
    "shortname": "humanmeat.burned",
    "localizedName": "Humanmeat Burned"
  },
  {
    "shortname": "humanmeat.cooked",
    "localizedName": "Humanmeat Cooked"
  },
  {
    "shortname": "humanmeat.raw",
    "localizedName": "Humanmeat Raw"
  },
  {
    "shortname": "humanmeat.spoiled",
    "localizedName": "Humanmeat Spoiled"
  },
  {
    "shortname": "huntingtrophylarge",
    "localizedName": "Huntingtrophylarge"
  },
  {
    "shortname": "huntingtrophysmall",
    "localizedName": "Huntingtrophysmall"
  },
  {
    "shortname": "icepick.salvaged",
    "localizedName": "Icepick Salvaged"
  },
  {
    "shortname": "improvised.shield",
    "localizedName": "Improvised Shield"
  },
  {
    "shortname": "industrial.combiner",
    "localizedName": "Industrial Combiner"
  },
  {
    "shortname": "industrial.conveyor",
    "localizedName": "Industrial Conveyor"
  },
  {
    "shortname": "industrial.crafter",
    "localizedName": "Industrial Crafter"
  },
  {
    "shortname": "industrial.splitter",
    "localizedName": "Industrial Splitter"
  },
  {
    "shortname": "industrial.wall.light.blue",
    "localizedName": "Industrial Wall Light Blue"
  },
  {
    "shortname": "industrial.wall.light.green",
    "localizedName": "Industrial Wall Light Green"
  },
  {
    "shortname": "industrial.wall.light.industrial.wall.lamp.blue.skin",
    "localizedName": "Industrial Wall Light Industrial Wall Lamp Blue Skin"
  },
  {
    "shortname": "industrial.wall.light.industrial.wall.lamp.green.skin",
    "localizedName": "Industrial Wall Light Industrial Wall Lamp Green Skin"
  },
  {
    "shortname": "industrial.wall.light.industrial.wall.lamp.red.skin",
    "localizedName": "Industrial Wall Light Industrial Wall Lamp Red Skin"
  },
  {
    "shortname": "industrial.wall.light",
    "localizedName": "Industrial Wall Light"
  },
  {
    "shortname": "industrial.wall.light.red",
    "localizedName": "Industrial Wall Light Red"
  },
  {
    "shortname": "innertube.camo",
    "localizedName": "Innertube Camo"
  },
  {
    "shortname": "innertube.donut",
    "localizedName": "Innertube Donut"
  },
  {
    "shortname": "innertube.horse",
    "localizedName": "Innertube Horse"
  },
  {
    "shortname": "innertube",
    "localizedName": "Innertube"
  },
  {
    "shortname": "innertube.tire",
    "localizedName": "Innertube Tire"
  },
  {
    "shortname": "innertube.unicorn",
    "localizedName": "Innertube Unicorn"
  },
  {
    "shortname": "innertube.watermelon",
    "localizedName": "Innertube Watermelon"
  },
  {
    "shortname": "innertube.zebra",
    "localizedName": "Innertube Zebra"
  },
  {
    "shortname": "iotable",
    "localizedName": "Iotable"
  },
  {
    "shortname": "jacket.blue",
    "localizedName": "Jacket Blue"
  },
  {
    "shortname": "jacket.desertcamo",
    "localizedName": "Jacket Desertcamo"
  },
  {
    "shortname": "jacket.green",
    "localizedName": "Jacket Green"
  },
  {
    "shortname": "jacket.hunter",
    "localizedName": "Jacket Hunter"
  },
  {
    "shortname": "jacket.multicam",
    "localizedName": "Jacket Multicam"
  },
  {
    "shortname": "jacket",
    "localizedName": "Jacket"
  },
  {
    "shortname": "jacket.red",
    "localizedName": "Jacket Red"
  },
  {
    "shortname": "jacket.skin.provocateur",
    "localizedName": "Jacket Skin Provocateur"
  },
  {
    "shortname": "jacket.snow.black",
    "localizedName": "Jacket Snow Black"
  },
  {
    "shortname": "jacket.snow",
    "localizedName": "Jacket Snow"
  },
  {
    "shortname": "jacket.snow.woodland",
    "localizedName": "Jacket Snow Woodland"
  },
  {
    "shortname": "jacket.snowcamo",
    "localizedName": "Jacket Snowcamo"
  },
  {
    "shortname": "jacket.urbancamo",
    "localizedName": "Jacket Urbancamo"
  },
  {
    "shortname": "jackhammer",
    "localizedName": "Jackhammer"
  },
  {
    "shortname": "jackolantern.angry",
    "localizedName": "Jackolantern Angry"
  },
  {
    "shortname": "jackolantern.happy",
    "localizedName": "Jackolantern Happy"
  },
  {
    "shortname": "jar.pickle",
    "localizedName": "Jar Pickle"
  },
  {
    "shortname": "jumpsuit.suit.blue",
    "localizedName": "Jumpsuit Suit Blue"
  },
  {
    "shortname": "jumpsuit.suit",
    "localizedName": "Jumpsuit Suit"
  },
  {
    "shortname": "jumpsuit.waterwellnpc",
    "localizedName": "Jumpsuit Waterwellnpc"
  },
  {
    "shortname": "jungle.rock",
    "localizedName": "Jungle Rock"
  },
  {
    "shortname": "kayak",
    "localizedName": "Kayak"
  },
  {
    "shortname": "keycard_blue",
    "localizedName": "Keycard Blue"
  },
  {
    "shortname": "keycard_green",
    "localizedName": "Keycard Green"
  },
  {
    "shortname": "keycard_red",
    "localizedName": "Keycard Red"
  },
  {
    "shortname": "knife.bone.bone.knife.obsidian.skin",
    "localizedName": "Knife Bone Bone Knife Obsidian Skin"
  },
  {
    "shortname": "knife.bone.obsidian",
    "localizedName": "Knife Bone Obsidian"
  },
  {
    "shortname": "knife.bone",
    "localizedName": "Knife Bone"
  },
  {
    "shortname": "knife.butcher",
    "localizedName": "Knife Butcher"
  },
  {
    "shortname": "knife.combat",
    "localizedName": "Knife Combat"
  },
  {
    "shortname": "knife.combat.sunken.skin",
    "localizedName": "Knife Combat Sunken Skin"
  },
  {
    "shortname": "knife.skinning",
    "localizedName": "Knife Skinning"
  },
  {
    "shortname": "knightsarmour.helmet",
    "localizedName": "Knightsarmour Helmet"
  },
  {
    "shortname": "knightsarmour.skirt",
    "localizedName": "Knightsarmour Skirt"
  },
  {
    "shortname": "knighttorso.armour",
    "localizedName": "Knighttorso Armour"
  },
  {
    "shortname": "krieg.chainsword",
    "localizedName": "Krieg Chainsword"
  },
  {
    "shortname": "krieg.shotgun",
    "localizedName": "Krieg Shotgun"
  },
  {
    "shortname": "krieg.storage.horizontal",
    "localizedName": "Krieg Storage Horizontal"
  },
  {
    "shortname": "krieg.storage.vertical",
    "localizedName": "Krieg Storage Vertical"
  },
  {
    "shortname": "kriegbackpack",
    "localizedName": "Kriegbackpack"
  },
  {
    "shortname": "ladder.wooden.boat",
    "localizedName": "Ladder Wooden Boat"
  },
  {
    "shortname": "ladder.wooden.wall",
    "localizedName": "Ladder Wooden Wall"
  },
  {
    "shortname": "lantern",
    "localizedName": "Lantern"
  },
  {
    "shortname": "largebackpack.krieg.large.backpack.skin",
    "localizedName": "Largebackpack Krieg Large Backpack Skin"
  },
  {
    "shortname": "largebackpack",
    "localizedName": "Largebackpack"
  },
  {
    "shortname": "largecandles",
    "localizedName": "Largecandles"
  },
  {
    "shortname": "largemedkit",
    "localizedName": "Largemedkit"
  },
  {
    "shortname": "laserlight",
    "localizedName": "Laserlight"
  },
  {
    "shortname": "latexballoon2025",
    "localizedName": "Latexballoon2025"
  },
  {
    "shortname": "latexclumpballoon2025",
    "localizedName": "Latexclumpballoon2025"
  },
  {
    "shortname": "lavenderidtag",
    "localizedName": "Lavenderidtag"
  },
  {
    "shortname": "leather",
    "localizedName": "Leather"
  },
  {
    "shortname": "legacy bow",
    "localizedName": "Legacy bow"
  },
  {
    "shortname": "legacy.shelter.wood",
    "localizedName": "Legacy Shelter Wood"
  },
  {
    "shortname": "legacyfurnace",
    "localizedName": "Legacyfurnace"
  },
  {
    "shortname": "lightup.large",
    "localizedName": "Lightup Large"
  },
  {
    "shortname": "lightup.xl",
    "localizedName": "Lightup Xl"
  },
  {
    "shortname": "lightup.xxl",
    "localizedName": "Lightup Xxl"
  },
  {
    "shortname": "lightupframe.medium",
    "localizedName": "Lightupframe Medium"
  },
  {
    "shortname": "lightupframe.small",
    "localizedName": "Lightupframe Small"
  },
  {
    "shortname": "lightupframe.standing",
    "localizedName": "Lightupframe Standing"
  },
  {
    "shortname": "lightupmirror.large",
    "localizedName": "Lightupmirror Large"
  },
  {
    "shortname": "lightupmirror.medium",
    "localizedName": "Lightupmirror Medium"
  },
  {
    "shortname": "lightupmirror.small",
    "localizedName": "Lightupmirror Small"
  },
  {
    "shortname": "lightupmirror.standing",
    "localizedName": "Lightupmirror Standing"
  },
  {
    "shortname": "lmg.m249",
    "localizedName": "Lmg M249"
  },
  {
    "shortname": "lock.code.a.pilot",
    "localizedName": "Lock Code A Pilot"
  },
  {
    "shortname": "lock.code.a.pilot.skin",
    "localizedName": "Lock Code A Pilot Skin"
  },
  {
    "shortname": "lock.code",
    "localizedName": "Lock Code"
  },
  {
    "shortname": "lock.key",
    "localizedName": "Lock Key"
  },
  {
    "shortname": "locker",
    "localizedName": "Locker"
  },
  {
    "shortname": "locomotive",
    "localizedName": "Locomotive"
  },
  {
    "shortname": "longsword",
    "localizedName": "Longsword"
  },
  {
    "shortname": "lowgradefuel",
    "localizedName": "Lowgradefuel"
  },
  {
    "shortname": "lr300.item.lr330.space.skin",
    "localizedName": "Lr300 Item Lr330 Space Skin"
  },
  {
    "shortname": "lumberjack hoodie",
    "localizedName": "Lumberjack hoodie"
  },
  {
    "shortname": "lumberjack.hatchet",
    "localizedName": "Lumberjack Hatchet"
  },
  {
    "shortname": "lumberjack.pickaxe",
    "localizedName": "Lumberjack Pickaxe"
  },
  {
    "shortname": "lunar.firecrackers",
    "localizedName": "Lunar Firecrackers"
  },
  {
    "shortname": "mace.baseballbat",
    "localizedName": "Mace Baseballbat"
  },
  {
    "shortname": "mace.baseballbat.skin",
    "localizedName": "Mace Baseballbat Skin"
  },
  {
    "shortname": "mace",
    "localizedName": "Mace"
  },
  {
    "shortname": "machete",
    "localizedName": "Machete"
  },
  {
    "shortname": "mailbox",
    "localizedName": "Mailbox"
  },
  {
    "shortname": "mannequin",
    "localizedName": "Mannequin"
  },
  {
    "shortname": "map",
    "localizedName": "Map"
  },
  {
    "shortname": "mask.balaclava.camo.desert.skin",
    "localizedName": "Mask Balaclava Camo Desert Skin"
  },
  {
    "shortname": "mask.balaclava.camo.forest.skin",
    "localizedName": "Mask Balaclava Camo Forest Skin"
  },
  {
    "shortname": "mask.balaclava.check.red.skin",
    "localizedName": "Mask Balaclava Check Red Skin"
  },
  {
    "shortname": "mask.balaclava",
    "localizedName": "Mask Balaclava"
  },
  {
    "shortname": "mask.balaclava.skin.balaclava.muricabalaclava",
    "localizedName": "Mask Balaclava Skin Balaclava Muricabalaclava"
  },
  {
    "shortname": "mask.balaclava.skin.balaclava.nightmarebalaclava",
    "localizedName": "Mask Balaclava Skin Balaclava Nightmarebalaclava"
  },
  {
    "shortname": "mask.balaclava.skin.balaclava.rorschachskull",
    "localizedName": "Mask Balaclava Skin Balaclava Rorschachskull"
  },
  {
    "shortname": "mask.balaclava.skin.balaclava.skinbalaclava",
    "localizedName": "Mask Balaclava Skin Balaclava Skinbalaclava"
  },
  {
    "shortname": "mask.balaclava.skin.balaclava.therustknight",
    "localizedName": "Mask Balaclava Skin Balaclava Therustknight"
  },
  {
    "shortname": "mask.balaclava.skin.balaclava.valentinebalaclava",
    "localizedName": "Mask Balaclava Skin Balaclava Valentinebalaclava"
  },
  {
    "shortname": "mask.balaclava.skin.balaclava.zipperface",
    "localizedName": "Mask Balaclava Skin Balaclava Zipperface"
  },
  {
    "shortname": "mask.balaclava.stripe.yellow.skin",
    "localizedName": "Mask Balaclava Stripe Yellow Skin"
  },
  {
    "shortname": "mask.bandana.black.skin",
    "localizedName": "Mask Bandana Black Skin"
  },
  {
    "shortname": "mask.bandana.blue.skin",
    "localizedName": "Mask Bandana Blue Skin"
  },
  {
    "shortname": "mask.bandana.camo.desert.skin",
    "localizedName": "Mask Bandana Camo Desert Skin"
  },
  {
    "shortname": "mask.bandana.camo.forest.skin",
    "localizedName": "Mask Bandana Camo Forest Skin"
  },
  {
    "shortname": "mask.bandana.camo.snow.skin",
    "localizedName": "Mask Bandana Camo Snow Skin"
  },
  {
    "shortname": "mask.bandana.checkered.black.skin",
    "localizedName": "Mask Bandana Checkered Black Skin"
  },
  {
    "shortname": "mask.bandana.green.skin",
    "localizedName": "Mask Bandana Green Skin"
  },
  {
    "shortname": "mask.bandana",
    "localizedName": "Mask Bandana"
  },
  {
    "shortname": "mask.bandana.skin.bandana.creepyclownbandana",
    "localizedName": "Mask Bandana Skin Bandana Creepyclownbandana"
  },
  {
    "shortname": "mask.bandana.skin.bandana.wizardbandana",
    "localizedName": "Mask Bandana Skin Bandana Wizardbandana"
  },
  {
    "shortname": "mask.bandana.skull.black.skin",
    "localizedName": "Mask Bandana Skull Black Skin"
  },
  {
    "shortname": "mask.bandana.skull.red.skin",
    "localizedName": "Mask Bandana Skull Red Skin"
  },
  {
    "shortname": "maxhealthtea.advanced",
    "localizedName": "Maxhealthtea Advanced"
  },
  {
    "shortname": "maxhealthtea",
    "localizedName": "Maxhealthtea"
  },
  {
    "shortname": "maxhealthtea.pure",
    "localizedName": "Maxhealthtea Pure"
  },
  {
    "shortname": "meat.boar",
    "localizedName": "Meat Boar"
  },
  {
    "shortname": "meat.pork.burned",
    "localizedName": "Meat Pork Burned"
  },
  {
    "shortname": "meat.pork.cooked",
    "localizedName": "Meat Pork Cooked"
  },
  {
    "shortname": "medieval.box.wooden.large",
    "localizedName": "Medieval Box Wooden Large"
  },
  {
    "shortname": "medieval.door.double.hinged.metal",
    "localizedName": "Medieval Door Double Hinged Metal"
  },
  {
    "shortname": "medieval.door.hinged.metal",
    "localizedName": "Medieval Door Hinged Metal"
  },
  {
    "shortname": "megaphone",
    "localizedName": "Megaphone"
  },
  {
    "shortname": "metal.detector",
    "localizedName": "Metal Detector"
  },
  {
    "shortname": "metal.facemask.hockey",
    "localizedName": "Metal Facemask Hockey"
  },
  {
    "shortname": "metal.facemask.hockey.skin",
    "localizedName": "Metal Facemask Hockey Skin"
  },
  {
    "shortname": "metal.facemask.icemask",
    "localizedName": "Metal Facemask Icemask"
  },
  {
    "shortname": "metal.facemask.icemask.skin",
    "localizedName": "Metal Facemask Icemask Skin"
  },
  {
    "shortname": "metal.facemask",
    "localizedName": "Metal Facemask"
  },
  {
    "shortname": "metal.fragments",
    "localizedName": "Metal Fragments"
  },
  {
    "shortname": "metal.ore",
    "localizedName": "Metal Ore"
  },
  {
    "shortname": "metal.plate.torso.icevest",
    "localizedName": "Metal Plate Torso Icevest"
  },
  {
    "shortname": "metal.plate.torso.icevest.skin",
    "localizedName": "Metal Plate Torso Icevest Skin"
  },
  {
    "shortname": "metal.plate.torso",
    "localizedName": "Metal Plate Torso"
  },
  {
    "shortname": "metal.refined",
    "localizedName": "Metal Refined"
  },
  {
    "shortname": "metal.shield",
    "localizedName": "Metal Shield"
  },
  {
    "shortname": "metalblade",
    "localizedName": "Metalblade"
  },
  {
    "shortname": "metalpipe",
    "localizedName": "Metalpipe"
  },
  {
    "shortname": "metalspring",
    "localizedName": "Metalspring"
  },
  {
    "shortname": "microphonestand",
    "localizedName": "Microphonestand"
  },
  {
    "shortname": "military flamethrower",
    "localizedName": "Military flamethrower"
  },
  {
    "shortname": "minecart.planter",
    "localizedName": "Minecart Planter"
  },
  {
    "shortname": "mini fridge",
    "localizedName": "Mini fridge"
  },
  {
    "shortname": "minicopter",
    "localizedName": "Minicopter"
  },
  {
    "shortname": "minicrossbow",
    "localizedName": "Minicrossbow"
  },
  {
    "shortname": "minigun",
    "localizedName": "Minigun"
  },
  {
    "shortname": "minihelicopter.repair",
    "localizedName": "Minihelicopter Repair"
  },
  {
    "shortname": "mining.pumpjack",
    "localizedName": "Mining Pumpjack"
  },
  {
    "shortname": "mining.quarry",
    "localizedName": "Mining Quarry"
  },
  {
    "shortname": "mintidtag",
    "localizedName": "Mintidtag"
  },
  {
    "shortname": "mixedclumpballoon2025",
    "localizedName": "Mixedclumpballoon2025"
  },
  {
    "shortname": "mixingtable",
    "localizedName": "Mixingtable"
  },
  {
    "shortname": "mlrs",
    "localizedName": "Mlrs"
  },
  {
    "shortname": "mobilephone",
    "localizedName": "Mobilephone"
  },
  {
    "shortname": "modularcarlift",
    "localizedName": "Modularcarlift"
  },
  {
    "shortname": "motorbike",
    "localizedName": "Motorbike"
  },
  {
    "shortname": "motorbike_sidecar",
    "localizedName": "Motorbike Sidecar"
  },
  {
    "shortname": "movembermoustache",
    "localizedName": "Movembermoustache"
  },
  {
    "shortname": "movembermoustachecard",
    "localizedName": "Movembermoustachecard"
  },
  {
    "shortname": "mrspice.can",
    "localizedName": "Mrspice Can"
  },
  {
    "shortname": "multiplegrenadelauncher",
    "localizedName": "Multiplegrenadelauncher"
  },
  {
    "shortname": "mummymask",
    "localizedName": "Mummymask"
  },
  {
    "shortname": "mushroom",
    "localizedName": "Mushroom"
  },
  {
    "shortname": "neonsigntr",
    "localizedName": "Neonsigntr"
  },
  {
    "shortname": "newyeargong",
    "localizedName": "Newyeargong"
  },
  {
    "shortname": "nightvisiongoggles",
    "localizedName": "Nightvisiongoggles"
  },
  {
    "shortname": "note",
    "localizedName": "Note"
  },
  {
    "shortname": "nucleus",
    "localizedName": "Nucleus"
  },
  {
    "shortname": "orangeidtag",
    "localizedName": "Orangeidtag"
  },
  {
    "shortname": "orchid",
    "localizedName": "Orchid"
  },
  {
    "shortname": "oretea.advanced",
    "localizedName": "Oretea Advanced"
  },
  {
    "shortname": "oretea",
    "localizedName": "Oretea"
  },
  {
    "shortname": "oretea.pure",
    "localizedName": "Oretea Pure"
  },
  {
    "shortname": "oubreak_scientist",
    "localizedName": "Oubreak Scientist"
  },
  {
    "shortname": "outbreak.sprayer",
    "localizedName": "Outbreak Sprayer"
  },
  {
    "shortname": "paddle",
    "localizedName": "Paddle"
  },
  {
    "shortname": "paddlingpool.hottub",
    "localizedName": "Paddlingpool Hottub"
  },
  {
    "shortname": "paddlingpool",
    "localizedName": "Paddlingpool"
  },
  {
    "shortname": "paddlingpool.rainbow",
    "localizedName": "Paddlingpool Rainbow"
  },
  {
    "shortname": "paddlingpool.seascape",
    "localizedName": "Paddlingpool Seascape"
  },
  {
    "shortname": "paddlingpool.spawnpool",
    "localizedName": "Paddlingpool Spawnpool"
  },
  {
    "shortname": "paintabletarget.reactive",
    "localizedName": "Paintabletarget Reactive"
  },
  {
    "shortname": "paintballgun",
    "localizedName": "Paintballgun"
  },
  {
    "shortname": "paintballoveralls.suit",
    "localizedName": "Paintballoveralls Suit"
  },
  {
    "shortname": "pants.forestcamo",
    "localizedName": "Pants Forestcamo"
  },
  {
    "shortname": "pants.jeans",
    "localizedName": "Pants Jeans"
  },
  {
    "shortname": "pants",
    "localizedName": "Pants"
  },
  {
    "shortname": "pants.shorts",
    "localizedName": "Pants Shorts"
  },
  {
    "shortname": "pants.skin.bluetrackv.2",
    "localizedName": "Pants Skin Bluetrackv 2"
  },
  {
    "shortname": "pants.skin.oldprisoner",
    "localizedName": "Pants Skin Oldprisoner"
  },
  {
    "shortname": "pants.skin.punkrock",
    "localizedName": "Pants Skin Punkrock"
  },
  {
    "shortname": "pants.snowcamo",
    "localizedName": "Pants Snowcamo"
  },
  {
    "shortname": "pants.urbancamo",
    "localizedName": "Pants Urbancamo"
  },
  {
    "shortname": "paper",
    "localizedName": "Paper"
  },
  {
    "shortname": "parachute",
    "localizedName": "Parachute"
  },
  {
    "shortname": "partyhat",
    "localizedName": "Partyhat"
  },
  {
    "shortname": "photo",
    "localizedName": "Photo"
  },
  {
    "shortname": "photoframe.landscape",
    "localizedName": "Photoframe Landscape"
  },
  {
    "shortname": "photoframe.large",
    "localizedName": "Photoframe Large"
  },
  {
    "shortname": "photoframe.portrait",
    "localizedName": "Photoframe Portrait"
  },
  {
    "shortname": "piano",
    "localizedName": "Piano"
  },
  {
    "shortname": "pickaxe.diver_.skin",
    "localizedName": "Pickaxe Diver  Skin"
  },
  {
    "shortname": "pickaxe.lumberjack_pick.skin",
    "localizedName": "Pickaxe Lumberjack Pick Skin"
  },
  {
    "shortname": "pickaxe",
    "localizedName": "Pickaxe"
  },
  {
    "shortname": "pie.apple",
    "localizedName": "Pie Apple"
  },
  {
    "shortname": "pie.bear",
    "localizedName": "Pie Bear"
  },
  {
    "shortname": "pie.bigcat",
    "localizedName": "Pie Bigcat"
  },
  {
    "shortname": "pie.chicken",
    "localizedName": "Pie Chicken"
  },
  {
    "shortname": "pie.crocodile",
    "localizedName": "Pie Crocodile"
  },
  {
    "shortname": "pie.fish",
    "localizedName": "Pie Fish"
  },
  {
    "shortname": "pie.hunters",
    "localizedName": "Pie Hunters"
  },
  {
    "shortname": "pie.pork",
    "localizedName": "Pie Pork"
  },
  {
    "shortname": "pie.pumpkin",
    "localizedName": "Pie Pumpkin"
  },
  {
    "shortname": "pie.survivors",
    "localizedName": "Pie Survivors"
  },
  {
    "shortname": "pilot.hazmat.box.wooden",
    "localizedName": "Pilot Hazmat Box Wooden"
  },
  {
    "shortname": "pinata",
    "localizedName": "Pinata"
  },
  {
    "shortname": "pinkidtag",
    "localizedName": "Pinkidtag"
  },
  {
    "shortname": "pipetool",
    "localizedName": "Pipetool"
  },
  {
    "shortname": "pistol.eoka",
    "localizedName": "Pistol Eoka"
  },
  {
    "shortname": "pistol.m92",
    "localizedName": "Pistol M92"
  },
  {
    "shortname": "pistol.nailgun",
    "localizedName": "Pistol Nailgun"
  },
  {
    "shortname": "pistol.prototype17",
    "localizedName": "Pistol Prototype17"
  },
  {
    "shortname": "pistol.python",
    "localizedName": "Pistol Python"
  },
  {
    "shortname": "pistol.revolver",
    "localizedName": "Pistol Revolver"
  },
  {
    "shortname": "pistol.revolver.skin.revolver.revolveroutback",
    "localizedName": "Pistol Revolver Skin Revolver Revolveroutback"
  },
  {
    "shortname": "pistol.semiauto.a.m15",
    "localizedName": "Pistol Semiauto A M15"
  },
  {
    "shortname": "pistol.semiauto.pistol_semiauto.a.m15.skin",
    "localizedName": "Pistol Semiauto Pistol Semiauto A M15 Skin"
  },
  {
    "shortname": "pistol.semiauto",
    "localizedName": "Pistol Semiauto"
  },
  {
    "shortname": "pistol.semiauto.skin.semiautopistol.contaminationpistol",
    "localizedName": "Pistol Semiauto Skin Semiautopistol Contaminationpistol"
  },
  {
    "shortname": "pistol.semiauto.skin.semiautopistol.halloweenbat",
    "localizedName": "Pistol Semiauto Skin Semiautopistol Halloweenbat"
  },
  {
    "shortname": "pistol.semiauto.skin.semiautopistol.reapernotepistol",
    "localizedName": "Pistol Semiauto Skin Semiautopistol Reapernotepistol"
  },
  {
    "shortname": "pistol.semiauto.skin.semiautopistol.redshine",
    "localizedName": "Pistol Semiauto Skin Semiautopistol Redshine"
  },
  {
    "shortname": "pistol.water",
    "localizedName": "Pistol Water"
  },
  {
    "shortname": "piston1",
    "localizedName": "Piston1"
  },
  {
    "shortname": "piston2",
    "localizedName": "Piston2"
  },
  {
    "shortname": "piston3",
    "localizedName": "Piston3"
  },
  {
    "shortname": "pitchfork",
    "localizedName": "Pitchfork"
  },
  {
    "shortname": "plank",
    "localizedName": "Plank"
  },
  {
    "shortname": "planter.large",
    "localizedName": "Planter Large"
  },
  {
    "shortname": "planter.large.RailRoadPlanter.sitem",
    "localizedName": "Planter Large RailRoadPlanter Sitem"
  },
  {
    "shortname": "planter.small",
    "localizedName": "Planter Small"
  },
  {
    "shortname": "planter.triangle",
    "localizedName": "Planter Triangle"
  },
  {
    "shortname": "planter.triangle.Triangle_Railroad_Planter.sitem",
    "localizedName": "Planter Triangle Triangle Railroad Planter Sitem"
  },
  {
    "shortname": "plantfiber",
    "localizedName": "Plantfiber"
  },
  {
    "shortname": "plantpot.single",
    "localizedName": "Plantpot Single"
  },
  {
    "shortname": "pookie.bear",
    "localizedName": "Pookie Bear"
  },
  {
    "shortname": "porkmeat.spoiled",
    "localizedName": "Porkmeat Spoiled"
  },
  {
    "shortname": "potato",
    "localizedName": "Potato"
  },
  {
    "shortname": "powered.water.purifier",
    "localizedName": "Powered Water Purifier"
  },
  {
    "shortname": "prisonerhood",
    "localizedName": "Prisonerhood"
  },
  {
    "shortname": "propanetank",
    "localizedName": "Propanetank"
  },
  {
    "shortname": "ptboat",
    "localizedName": "Ptboat"
  },
  {
    "shortname": "ptz.cctv.camera",
    "localizedName": "Ptz Cctv Camera"
  },
  {
    "shortname": "pumpkin",
    "localizedName": "Pumpkin"
  },
  {
    "shortname": "pumpkinbasket",
    "localizedName": "Pumpkinbasket"
  },
  {
    "shortname": "purecoolingtea",
    "localizedName": "Purecoolingtea"
  },
  {
    "shortname": "purecraftingtea_quality",
    "localizedName": "Purecraftingtea Quality"
  },
  {
    "shortname": "pureharvestingtea",
    "localizedName": "Pureharvestingtea"
  },
  {
    "shortname": "purewarmingtea",
    "localizedName": "Purewarmingtea"
  },
  {
    "shortname": "purpleidtag",
    "localizedName": "Purpleidtag"
  },
  {
    "shortname": "radiationremovetea.advanced",
    "localizedName": "Radiationremovetea Advanced"
  },
  {
    "shortname": "radiationremovetea",
    "localizedName": "Radiationremovetea"
  },
  {
    "shortname": "radiationremovetea.pure",
    "localizedName": "Radiationremovetea Pure"
  },
  {
    "shortname": "radiationresisttea.advanced",
    "localizedName": "Radiationresisttea Advanced"
  },
  {
    "shortname": "radiationresisttea",
    "localizedName": "Radiationresisttea"
  },
  {
    "shortname": "radiationresisttea.pure",
    "localizedName": "Radiationresisttea Pure"
  },
  {
    "shortname": "rail.road.planter",
    "localizedName": "Rail Road Planter"
  },
  {
    "shortname": "red.berry",
    "localizedName": "Red Berry"
  },
  {
    "shortname": "reddogtags",
    "localizedName": "Reddogtags"
  },
  {
    "shortname": "redidtag",
    "localizedName": "Redidtag"
  },
  {
    "shortname": "reinforced.wooden.shield",
    "localizedName": "Reinforced Wooden Shield"
  },
  {
    "shortname": "research.table",
    "localizedName": "Research Table"
  },
  {
    "shortname": "revolver.hc",
    "localizedName": "Revolver Hc"
  },
  {
    "shortname": "rf.detonator",
    "localizedName": "Rf Detonator"
  },
  {
    "shortname": "rf_pager",
    "localizedName": "Rf Pager"
  },
  {
    "shortname": "rhib",
    "localizedName": "Rhib"
  },
  {
    "shortname": "rifle.ak.ak47ice.skin",
    "localizedName": "Rifle Ak Ak47ice Skin"
  },
  {
    "shortname": "rifle.ak.ak47u_diver.skin",
    "localizedName": "Rifle Ak Ak47u Diver Skin"
  },
  {
    "shortname": "rifle.ak.ak47u_jungle.item.skin",
    "localizedName": "Rifle Ak Ak47u Jungle Item Skin"
  },
  {
    "shortname": "rifle.ak.ak47u_med.item.skin",
    "localizedName": "Rifle Ak Ak47u Med Item Skin"
  },
  {
    "shortname": "rifle.ak.diver",
    "localizedName": "Rifle Ak Diver"
  },
  {
    "shortname": "rifle.ak.ice",
    "localizedName": "Rifle Ak Ice"
  },
  {
    "shortname": "rifle.ak.jungle",
    "localizedName": "Rifle Ak Jungle"
  },
  {
    "shortname": "rifle.ak.med",
    "localizedName": "Rifle Ak Med"
  },
  {
    "shortname": "rifle.ak",
    "localizedName": "Rifle Ak"
  },
  {
    "shortname": "rifle.ak.skin.ak47.digitalcamoak47",
    "localizedName": "Rifle Ak Skin Ak47 Digitalcamoak47"
  },
  {
    "shortname": "rifle.ak.skin.ak47.militarycamoak47",
    "localizedName": "Rifle Ak Skin Ak47 Militarycamoak47"
  },
  {
    "shortname": "rifle.ak.skin.ak47.temperedak47",
    "localizedName": "Rifle Ak Skin Ak47 Temperedak47"
  },
  {
    "shortname": "rifle.bolt",
    "localizedName": "Rifle Bolt"
  },
  {
    "shortname": "rifle.bolt.skin.boltrifle.dreamcatcher",
    "localizedName": "Rifle Bolt Skin Boltrifle Dreamcatcher"
  },
  {
    "shortname": "rifle.bolt.skin.boltrifle.ghostboltrifle",
    "localizedName": "Rifle Bolt Skin Boltrifle Ghostboltrifle"
  },
  {
    "shortname": "rifle.bolt.skin.boltrifle.tundraboltrifle",
    "localizedName": "Rifle Bolt Skin Boltrifle Tundraboltrifle"
  },
  {
    "shortname": "rifle.l96",
    "localizedName": "Rifle L96"
  },
  {
    "shortname": "rifle.lr300",
    "localizedName": "Rifle Lr300"
  },
  {
    "shortname": "rifle.lr300.space",
    "localizedName": "Rifle Lr300 Space"
  },
  {
    "shortname": "rifle.m39",
    "localizedName": "Rifle M39"
  },
  {
    "shortname": "rifle.semiauto",
    "localizedName": "Rifle Semiauto"
  },
  {
    "shortname": "rifle.sks",
    "localizedName": "Rifle Sks"
  },
  {
    "shortname": "riflebody",
    "localizedName": "Riflebody"
  },
  {
    "shortname": "riot.helmet",
    "localizedName": "Riot Helmet"
  },
  {
    "shortname": "roadsign.gloves",
    "localizedName": "Roadsign Gloves"
  },
  {
    "shortname": "roadsign.jacket",
    "localizedName": "Roadsign Jacket"
  },
  {
    "shortname": "roadsign.jacket.vest.knightarmour.skin",
    "localizedName": "Roadsign Jacket Vest Knightarmour Skin"
  },
  {
    "shortname": "roadsign.kilt.pants.knightarmour.skin",
    "localizedName": "Roadsign Kilt Pants Knightarmour Skin"
  },
  {
    "shortname": "roadsign.kilt",
    "localizedName": "Roadsign Kilt"
  },
  {
    "shortname": "roadsigns",
    "localizedName": "Roadsigns"
  },
  {
    "shortname": "rock.a.jungle.skin",
    "localizedName": "Rock A Jungle Skin"
  },
  {
    "shortname": "rock",
    "localizedName": "Rock"
  },
  {
    "shortname": "rock.skull.skin",
    "localizedName": "Rock Skull Skin"
  },
  {
    "shortname": "rocket.launcher.dragon",
    "localizedName": "Rocket Launcher Dragon"
  },
  {
    "shortname": "rocket.launcher",
    "localizedName": "Rocket Launcher"
  },
  {
    "shortname": "rocket.launcher.rocket_launcher_dragon.skin",
    "localizedName": "Rocket Launcher Rocket Launcher Dragon Skin"
  },
  {
    "shortname": "rocket.launcher.rocket_launcher_rpg7.skin",
    "localizedName": "Rocket Launcher Rocket Launcher Rpg7 Skin"
  },
  {
    "shortname": "rocket.launcher.rpg7",
    "localizedName": "Rocket Launcher Rpg7"
  },
  {
    "shortname": "rockingchair.2.skin",
    "localizedName": "Rockingchair 2 Skin"
  },
  {
    "shortname": "rockingchair.3.skin",
    "localizedName": "Rockingchair 3 Skin"
  },
  {
    "shortname": "rockingchair",
    "localizedName": "Rockingchair"
  },
  {
    "shortname": "rockingchair.rockingchair2",
    "localizedName": "Rockingchair Rockingchair2"
  },
  {
    "shortname": "rockingchair.rockingchair3",
    "localizedName": "Rockingchair Rockingchair3"
  },
  {
    "shortname": "rope",
    "localizedName": "Rope"
  },
  {
    "shortname": "rose",
    "localizedName": "Rose"
  },
  {
    "shortname": "rowboat",
    "localizedName": "Rowboat"
  },
  {
    "shortname": "rug.bear",
    "localizedName": "Rug Bear"
  },
  {
    "shortname": "rug",
    "localizedName": "Rug"
  },
  {
    "shortname": "rustige_egg_a",
    "localizedName": "Rustige Egg A"
  },
  {
    "shortname": "rustige_egg_b",
    "localizedName": "Rustige Egg B"
  },
  {
    "shortname": "rustige_egg_c",
    "localizedName": "Rustige Egg C"
  },
  {
    "shortname": "rustige_egg_d",
    "localizedName": "Rustige Egg D"
  },
  {
    "shortname": "rustige_egg_e",
    "localizedName": "Rustige Egg E"
  },
  {
    "shortname": "rustige_egg_f",
    "localizedName": "Rustige Egg F"
  },
  {
    "shortname": "rustige_egg_g",
    "localizedName": "Rustige Egg G"
  },
  {
    "shortname": "rustige_egg_h",
    "localizedName": "Rustige Egg H"
  },
  {
    "shortname": "sail",
    "localizedName": "Sail"
  },
  {
    "shortname": "salvaged.bamboo.shelves",
    "localizedName": "Salvaged Bamboo Shelves"
  },
  {
    "shortname": "salvaged.cleaver",
    "localizedName": "Salvaged Cleaver"
  },
  {
    "shortname": "salvaged.sword",
    "localizedName": "Salvaged Sword"
  },
  {
    "shortname": "samsite",
    "localizedName": "Samsite"
  },
  {
    "shortname": "santabeard",
    "localizedName": "Santabeard"
  },
  {
    "shortname": "santahat",
    "localizedName": "Santahat"
  },
  {
    "shortname": "scarecrow",
    "localizedName": "Scarecrow"
  },
  {
    "shortname": "scarecrow.suit",
    "localizedName": "Scarecrow Suit"
  },
  {
    "shortname": "scarecrowhead",
    "localizedName": "Scarecrowhead"
  },
  {
    "shortname": "scientist.plushie",
    "localizedName": "Scientist Plushie"
  },
  {
    "shortname": "scientistsuit_heavy",
    "localizedName": "Scientistsuit Heavy"
  },
  {
    "shortname": "scrap",
    "localizedName": "Scrap"
  },
  {
    "shortname": "scrapframe.large",
    "localizedName": "Scrapframe Large"
  },
  {
    "shortname": "scrapframe.medium",
    "localizedName": "Scrapframe Medium"
  },
  {
    "shortname": "scrapframe.small",
    "localizedName": "Scrapframe Small"
  },
  {
    "shortname": "scrapframe.standing",
    "localizedName": "Scrapframe Standing"
  },
  {
    "shortname": "scrapframe.xl",
    "localizedName": "Scrapframe Xl"
  },
  {
    "shortname": "scrapframe.xxl",
    "localizedName": "Scrapframe Xxl"
  },
  {
    "shortname": "scrapmirror.large",
    "localizedName": "Scrapmirror Large"
  },
  {
    "shortname": "scrapmirror.medium",
    "localizedName": "Scrapmirror Medium"
  },
  {
    "shortname": "scrapmirror.small",
    "localizedName": "Scrapmirror Small"
  },
  {
    "shortname": "scrapmirror.standing",
    "localizedName": "Scrapmirror Standing"
  },
  {
    "shortname": "scraptea.advanced",
    "localizedName": "Scraptea Advanced"
  },
  {
    "shortname": "scraptea",
    "localizedName": "Scraptea"
  },
  {
    "shortname": "scraptea.pure",
    "localizedName": "Scraptea Pure"
  },
  {
    "shortname": "scraptransportheli",
    "localizedName": "Scraptransportheli"
  },
  {
    "shortname": "sculpture.ice",
    "localizedName": "Sculpture Ice"
  },
  {
    "shortname": "searchlight",
    "localizedName": "Searchlight"
  },
  {
    "shortname": "secretlabchair",
    "localizedName": "Secretlabchair"
  },
  {
    "shortname": "sedan",
    "localizedName": "Sedan"
  },
  {
    "shortname": "seed.black.berry",
    "localizedName": "Seed Black Berry"
  },
  {
    "shortname": "seed.blue.berry",
    "localizedName": "Seed Blue Berry"
  },
  {
    "shortname": "seed.corn",
    "localizedName": "Seed Corn"
  },
  {
    "shortname": "seed.green.berry",
    "localizedName": "Seed Green Berry"
  },
  {
    "shortname": "seed.hemp",
    "localizedName": "Seed Hemp"
  },
  {
    "shortname": "seed.orchid",
    "localizedName": "Seed Orchid"
  },
  {
    "shortname": "seed.potato",
    "localizedName": "Seed Potato"
  },
  {
    "shortname": "seed.pumpkin",
    "localizedName": "Seed Pumpkin"
  },
  {
    "shortname": "seed.red.berry",
    "localizedName": "Seed Red Berry"
  },
  {
    "shortname": "seed.rose",
    "localizedName": "Seed Rose"
  },
  {
    "shortname": "seed.sunflower",
    "localizedName": "Seed Sunflower"
  },
  {
    "shortname": "seed.wheat",
    "localizedName": "Seed Wheat"
  },
  {
    "shortname": "seed.white.berry",
    "localizedName": "Seed White Berry"
  },
  {
    "shortname": "seed.yellow.berry",
    "localizedName": "Seed Yellow Berry"
  },
  {
    "shortname": "semibody",
    "localizedName": "Semibody"
  },
  {
    "shortname": "sewingkit",
    "localizedName": "Sewingkit"
  },
  {
    "shortname": "sheetmetal",
    "localizedName": "Sheetmetal"
  },
  {
    "shortname": "shelves",
    "localizedName": "Shelves"
  },
  {
    "shortname": "shelves.salvaged_bamboo_.skin",
    "localizedName": "Shelves Salvaged Bamboo  Skin"
  },
  {
    "shortname": "shirt.collared",
    "localizedName": "Shirt Collared"
  },
  {
    "shortname": "shirt.tanktop",
    "localizedName": "Shirt Tanktop"
  },
  {
    "shortname": "shoes.boots.black",
    "localizedName": "Shoes Boots Black"
  },
  {
    "shortname": "shoes.boots",
    "localizedName": "Shoes Boots"
  },
  {
    "shortname": "shoes.boots.skin.boots.armyboots",
    "localizedName": "Shoes Boots Skin Boots Armyboots"
  },
  {
    "shortname": "shoes.boots.skin.boots.bloodyboots",
    "localizedName": "Shoes Boots Skin Boots Bloodyboots"
  },
  {
    "shortname": "shoes.boots.skin.boots.punkboots",
    "localizedName": "Shoes Boots Skin Boots Punkboots"
  },
  {
    "shortname": "shoes.boots.skin.boots.scavengedsneakers",
    "localizedName": "Shoes Boots Skin Boots Scavengedsneakers"
  },
  {
    "shortname": "shoes.boots.tan",
    "localizedName": "Shoes Boots Tan"
  },
  {
    "shortname": "shotgun.double.blunderbuss.skin",
    "localizedName": "Shotgun Double Blunderbuss Skin"
  },
  {
    "shortname": "shotgun.double",
    "localizedName": "Shotgun Double"
  },
  {
    "shortname": "shotgun.m4",
    "localizedName": "Shotgun M4"
  },
  {
    "shortname": "shotgun.pump.krieg.shotgun.skin",
    "localizedName": "Shotgun Pump Krieg Shotgun Skin"
  },
  {
    "shortname": "shotgun.pump",
    "localizedName": "Shotgun Pump"
  },
  {
    "shortname": "shotgun.pump.skin.pumpshotgun.theswampmaster",
    "localizedName": "Shotgun Pump Skin Pumpshotgun Theswampmaster"
  },
  {
    "shortname": "shotgun.pump.skin.pumpshotgunchieftain",
    "localizedName": "Shotgun Pump Skin Pumpshotgunchieftain"
  },
  {
    "shortname": "shotgun.spas12",
    "localizedName": "Shotgun Spas12"
  },
  {
    "shortname": "shotgun.waterpipe",
    "localizedName": "Shotgun Waterpipe"
  },
  {
    "shortname": "shotgun.waterpipe.skin.pipeshotgun.thepeacepipe",
    "localizedName": "Shotgun Waterpipe Skin Pipeshotgun Thepeacepipe"
  },
  {
    "shortname": "shovel",
    "localizedName": "Shovel"
  },
  {
    "shortname": "shutter.metal.embrasure.a",
    "localizedName": "Shutter Metal Embrasure A"
  },
  {
    "shortname": "shutter.metal.embrasure.b",
    "localizedName": "Shutter Metal Embrasure B"
  },
  {
    "shortname": "shutter.wood.a",
    "localizedName": "Shutter Wood A"
  },
  {
    "shortname": "sickle",
    "localizedName": "Sickle"
  },
  {
    "shortname": "siegetower",
    "localizedName": "Siegetower"
  },
  {
    "shortname": "sign.artistcanvas.l",
    "localizedName": "Sign Artistcanvas L"
  },
  {
    "shortname": "sign.artistcanvas.m",
    "localizedName": "Sign Artistcanvas M"
  },
  {
    "shortname": "sign.artistcanvas.s",
    "localizedName": "Sign Artistcanvas S"
  },
  {
    "shortname": "sign.artistcanvas.xl",
    "localizedName": "Sign Artistcanvas Xl"
  },
  {
    "shortname": "sign.artistcanvas.xs",
    "localizedName": "Sign Artistcanvas Xs"
  },
  {
    "shortname": "sign.artistcanvas.xxl",
    "localizedName": "Sign Artistcanvas Xxl"
  },
  {
    "shortname": "sign.hanging.banner.large",
    "localizedName": "Sign Hanging Banner Large"
  },
  {
    "shortname": "sign.hanging.ornate",
    "localizedName": "Sign Hanging Ornate"
  },
  {
    "shortname": "sign.hanging",
    "localizedName": "Sign Hanging"
  },
  {
    "shortname": "sign.neon.125x125",
    "localizedName": "Sign Neon 125x125"
  },
  {
    "shortname": "sign.neon.125x215.animated",
    "localizedName": "Sign Neon 125x215 Animated"
  },
  {
    "shortname": "sign.neon.125x215",
    "localizedName": "Sign Neon 125x215"
  },
  {
    "shortname": "sign.neon.xl.animated",
    "localizedName": "Sign Neon Xl Animated"
  },
  {
    "shortname": "sign.neon.xl",
    "localizedName": "Sign Neon Xl"
  },
  {
    "shortname": "sign.pictureframe.landscape",
    "localizedName": "Sign Pictureframe Landscape"
  },
  {
    "shortname": "sign.pictureframe.portrait",
    "localizedName": "Sign Pictureframe Portrait"
  },
  {
    "shortname": "sign.pictureframe.tall",
    "localizedName": "Sign Pictureframe Tall"
  },
  {
    "shortname": "sign.pictureframe.xl",
    "localizedName": "Sign Pictureframe Xl"
  },
  {
    "shortname": "sign.pictureframe.xxl",
    "localizedName": "Sign Pictureframe Xxl"
  },
  {
    "shortname": "sign.pole.banner.large",
    "localizedName": "Sign Pole Banner Large"
  },
  {
    "shortname": "sign.post.double",
    "localizedName": "Sign Post Double"
  },
  {
    "shortname": "sign.post.single",
    "localizedName": "Sign Post Single"
  },
  {
    "shortname": "sign.post.town",
    "localizedName": "Sign Post Town"
  },
  {
    "shortname": "sign.post.town.roof",
    "localizedName": "Sign Post Town Roof"
  },
  {
    "shortname": "sign.wooden.huge",
    "localizedName": "Sign Wooden Huge"
  },
  {
    "shortname": "sign.wooden.large",
    "localizedName": "Sign Wooden Large"
  },
  {
    "shortname": "sign.wooden.medium",
    "localizedName": "Sign Wooden Medium"
  },
  {
    "shortname": "sign.wooden.small",
    "localizedName": "Sign Wooden Small"
  },
  {
    "shortname": "silly.horse.mask",
    "localizedName": "Silly Horse Mask"
  },
  {
    "shortname": "single.shallow.wall.shelves",
    "localizedName": "Single Shallow Wall Shelves"
  },
  {
    "shortname": "skidoo",
    "localizedName": "Skidoo"
  },
  {
    "shortname": "skull.human",
    "localizedName": "Skull Human"
  },
  {
    "shortname": "skull",
    "localizedName": "Skull"
  },
  {
    "shortname": "skull.trophy.jar",
    "localizedName": "Skull Trophy Jar"
  },
  {
    "shortname": "skull.trophy.jar2",
    "localizedName": "Skull Trophy Jar2"
  },
  {
    "shortname": "skull.trophy",
    "localizedName": "Skull Trophy"
  },
  {
    "shortname": "skull.trophy.skulltrophy.jar.skin",
    "localizedName": "Skull Trophy Skulltrophy Jar Skin"
  },
  {
    "shortname": "skull.trophy.skulltrophy.jar2.skin",
    "localizedName": "Skull Trophy Skulltrophy Jar2 Skin"
  },
  {
    "shortname": "skull.trophy.skulltrophy.table.skin",
    "localizedName": "Skull Trophy Skulltrophy Table Skin"
  },
  {
    "shortname": "skull.trophy.table",
    "localizedName": "Skull Trophy Table"
  },
  {
    "shortname": "skull.wolf",
    "localizedName": "Skull Wolf"
  },
  {
    "shortname": "skulldoorknocker",
    "localizedName": "Skulldoorknocker"
  },
  {
    "shortname": "skullspikes.candles",
    "localizedName": "Skullspikes Candles"
  },
  {
    "shortname": "skullspikes.candles.skin",
    "localizedName": "Skullspikes Candles Skin"
  },
  {
    "shortname": "skullspikes",
    "localizedName": "Skullspikes"
  },
  {
    "shortname": "skullspikes.pumpkin",
    "localizedName": "Skullspikes Pumpkin"
  },
  {
    "shortname": "skullspikes.pumpkin.skin",
    "localizedName": "Skullspikes Pumpkin Skin"
  },
  {
    "shortname": "skull_fire_pit",
    "localizedName": "Skull Fire Pit"
  },
  {
    "shortname": "skylantern.green.skin",
    "localizedName": "Skylantern Green Skin"
  },
  {
    "shortname": "skylantern.orange.skin",
    "localizedName": "Skylantern Orange Skin"
  },
  {
    "shortname": "skylantern",
    "localizedName": "Skylantern"
  },
  {
    "shortname": "skylantern.purple.skin",
    "localizedName": "Skylantern Purple Skin"
  },
  {
    "shortname": "skylantern.red.skin",
    "localizedName": "Skylantern Red Skin"
  },
  {
    "shortname": "skylantern.skylantern.green",
    "localizedName": "Skylantern Skylantern Green"
  },
  {
    "shortname": "skylantern.skylantern.orange",
    "localizedName": "Skylantern Skylantern Orange"
  },
  {
    "shortname": "skylantern.skylantern.purple",
    "localizedName": "Skylantern Skylantern Purple"
  },
  {
    "shortname": "skylantern.skylantern.red",
    "localizedName": "Skylantern Skylantern Red"
  },
  {
    "shortname": "sled",
    "localizedName": "Sled"
  },
  {
    "shortname": "sled.xmas",
    "localizedName": "Sled Xmas"
  },
  {
    "shortname": "sled._xmas",
    "localizedName": "Sled  Xmas"
  },
  {
    "shortname": "sleepingbag",
    "localizedName": "Sleepingbag"
  },
  {
    "shortname": "sleepingbag.skin.astonchristmas",
    "localizedName": "Sleepingbag Skin Astonchristmas"
  },
  {
    "shortname": "sleepingbag.skin.blueplaid",
    "localizedName": "Sleepingbag Skin Blueplaid"
  },
  {
    "shortname": "sleepingbag.skin.christmasbag",
    "localizedName": "Sleepingbag Skin Christmasbag"
  },
  {
    "shortname": "sleepingbag.skin.horrorbag",
    "localizedName": "Sleepingbag Skin Horrorbag"
  },
  {
    "shortname": "sleepingbag.skin.tigercrown",
    "localizedName": "Sleepingbag Skin Tigercrown"
  },
  {
    "shortname": "sleepingbag.skin.woodcamo",
    "localizedName": "Sleepingbag Skin Woodcamo"
  },
  {
    "shortname": "small.oil.refinery",
    "localizedName": "Small Oil Refinery"
  },
  {
    "shortname": "smallbackpack",
    "localizedName": "Smallbackpack"
  },
  {
    "shortname": "smallcandles",
    "localizedName": "Smallcandles"
  },
  {
    "shortname": "smallengine",
    "localizedName": "Smallengine"
  },
  {
    "shortname": "smallwaterbottle",
    "localizedName": "Smallwaterbottle"
  },
  {
    "shortname": "small_ramp",
    "localizedName": "Small Ramp"
  },
  {
    "shortname": "smart.alarm",
    "localizedName": "Smart Alarm"
  },
  {
    "shortname": "smart.switch",
    "localizedName": "Smart Switch"
  },
  {
    "shortname": "smg.2",
    "localizedName": "Smg 2"
  },
  {
    "shortname": "smg.mp5",
    "localizedName": "Smg Mp5"
  },
  {
    "shortname": "smg.thompson",
    "localizedName": "Smg Thompson"
  },
  {
    "shortname": "smgbody",
    "localizedName": "Smgbody"
  },
  {
    "shortname": "snakemeat.cooked",
    "localizedName": "Snakemeat Cooked"
  },
  {
    "shortname": "snakemeat",
    "localizedName": "Snakemeat"
  },
  {
    "shortname": "snakemeat.spoiled",
    "localizedName": "Snakemeat Spoiled"
  },
  {
    "shortname": "snowball",
    "localizedName": "Snowball"
  },
  {
    "shortname": "snowballgun",
    "localizedName": "Snowballgun"
  },
  {
    "shortname": "snowmachine",
    "localizedName": "Snowmachine"
  },
  {
    "shortname": "snowman",
    "localizedName": "Snowman"
  },
  {
    "shortname": "snowmobile",
    "localizedName": "Snowmobile"
  },
  {
    "shortname": "snowmobile.tomaha.skin",
    "localizedName": "Snowmobile Tomaha Skin"
  },
  {
    "shortname": "snowmobiletomaha",
    "localizedName": "Snowmobiletomaha"
  },
  {
    "shortname": "sofa.pattern",
    "localizedName": "Sofa Pattern"
  },
  {
    "shortname": "sofa",
    "localizedName": "Sofa"
  },
  {
    "shortname": "soundlight",
    "localizedName": "Soundlight"
  },
  {
    "shortname": "sparkplug1",
    "localizedName": "Sparkplug1"
  },
  {
    "shortname": "sparkplug2",
    "localizedName": "Sparkplug2"
  },
  {
    "shortname": "sparkplug3",
    "localizedName": "Sparkplug3"
  },
  {
    "shortname": "spear.cny",
    "localizedName": "Spear Cny"
  },
  {
    "shortname": "spear.stone",
    "localizedName": "Spear Stone"
  },
  {
    "shortname": "spear.wooden.cny_spear",
    "localizedName": "Spear Wooden Cny Spear"
  },
  {
    "shortname": "spear.wooden",
    "localizedName": "Spear Wooden"
  },
  {
    "shortname": "speargun",
    "localizedName": "Speargun"
  },
  {
    "shortname": "speargun.spear",
    "localizedName": "Speargun Spear"
  },
  {
    "shortname": "speechbubbleballoon2025",
    "localizedName": "Speechbubbleballoon2025"
  },
  {
    "shortname": "spiderweb",
    "localizedName": "Spiderweb"
  },
  {
    "shortname": "spikes.floor",
    "localizedName": "Spikes Floor"
  },
  {
    "shortname": "spikes.trap",
    "localizedName": "Spikes Trap"
  },
  {
    "shortname": "spinner.wheel",
    "localizedName": "Spinner Wheel"
  },
  {
    "shortname": "spoiled.produce",
    "localizedName": "Spoiled Produce"
  },
  {
    "shortname": "spookyspeaker",
    "localizedName": "Spookyspeaker"
  },
  {
    "shortname": "spraycan",
    "localizedName": "Spraycan"
  },
  {
    "shortname": "spraycandecal",
    "localizedName": "Spraycandecal"
  },
  {
    "shortname": "spraycandecal.spray.decal.artistDLC_rosette_1st",
    "localizedName": "Spraycandecal Spray Decal ArtistDLC Rosette 1st"
  },
  {
    "shortname": "spraycandecal.spray.decal.artistDLC_rosette_2nd",
    "localizedName": "Spraycandecal Spray Decal ArtistDLC Rosette 2nd"
  },
  {
    "shortname": "spraycandecal.spray.decal.artistDLC_rosette_3rd",
    "localizedName": "Spraycandecal Spray Decal ArtistDLC Rosette 3rd"
  },
  {
    "shortname": "spraycandecal.spray.decal.artistDLC_rosette_last",
    "localizedName": "Spraycandecal Spray Decal ArtistDLC Rosette Last"
  },
  {
    "shortname": "spraycandecal.spray.decal.beancan",
    "localizedName": "Spraycandecal Spray Decal Beancan"
  },
  {
    "shortname": "spraycandecal.spray.decal.candlehat",
    "localizedName": "Spraycandecal Spray Decal Candlehat"
  },
  {
    "shortname": "spraycandecal.spray.decal.facepunch",
    "localizedName": "Spraycandecal Spray Decal Facepunch"
  },
  {
    "shortname": "spraycandecal.spray.decal.frogboot",
    "localizedName": "Spraycandecal Spray Decal Frogboot"
  },
  {
    "shortname": "spraycandecal.spray.decal.hazmat",
    "localizedName": "Spraycandecal Spray Decal Hazmat"
  },
  {
    "shortname": "spraycandecal.spray.decal.jungledlc_skull",
    "localizedName": "Spraycandecal Spray Decal Jungledlc Skull"
  },
  {
    "shortname": "spraycandecal.spray.decal.jungledlc_tiger",
    "localizedName": "Spraycandecal Spray Decal Jungledlc Tiger"
  },
  {
    "shortname": "spraycandecal.spray.decal.rock",
    "localizedName": "Spraycandecal Spray Decal Rock"
  },
  {
    "shortname": "spraycandecal.spray.decal.target",
    "localizedName": "Spraycandecal Spray Decal Target"
  },
  {
    "shortname": "spraycandecal.spray.decal.whip",
    "localizedName": "Spraycandecal Spray Decal Whip"
  },
  {
    "shortname": "starballoon2025",
    "localizedName": "Starballoon2025"
  },
  {
    "shortname": "stash.small",
    "localizedName": "Stash Small"
  },
  {
    "shortname": "steeringwheel.boat",
    "localizedName": "Steeringwheel Boat"
  },
  {
    "shortname": "sticks",
    "localizedName": "Sticks"
  },
  {
    "shortname": "stocking.large",
    "localizedName": "Stocking Large"
  },
  {
    "shortname": "stocking.small",
    "localizedName": "Stocking Small"
  },
  {
    "shortname": "stone.pickaxe.concrete_pickaxe.skin",
    "localizedName": "Stone Pickaxe Concrete Pickaxe Skin"
  },
  {
    "shortname": "stone.pickaxe",
    "localizedName": "Stone Pickaxe"
  },
  {
    "shortname": "stonehatchet.concrete_hatchet.skin",
    "localizedName": "Stonehatchet Concrete Hatchet Skin"
  },
  {
    "shortname": "stonehatchet",
    "localizedName": "Stonehatchet"
  },
  {
    "shortname": "stones",
    "localizedName": "Stones"
  },
  {
    "shortname": "storage.monitor",
    "localizedName": "Storage Monitor"
  },
  {
    "shortname": "storageadaptor",
    "localizedName": "Storageadaptor"
  },
  {
    "shortname": "storage_barrel_a",
    "localizedName": "Storage Barrel A"
  },
  {
    "shortname": "storage_barrel_b",
    "localizedName": "Storage Barrel B"
  },
  {
    "shortname": "storage_barrel_c",
    "localizedName": "Storage Barrel C"
  },
  {
    "shortname": "strobelight",
    "localizedName": "Strobelight"
  },
  {
    "shortname": "submarine.torpedo.straight",
    "localizedName": "Submarine Torpedo Straight"
  },
  {
    "shortname": "submarineduo",
    "localizedName": "Submarineduo"
  },
  {
    "shortname": "submarinesolo",
    "localizedName": "Submarinesolo"
  },
  {
    "shortname": "sulfur.ore",
    "localizedName": "Sulfur Ore"
  },
  {
    "shortname": "sulfur",
    "localizedName": "Sulfur"
  },
  {
    "shortname": "sunflower",
    "localizedName": "Sunflower"
  },
  {
    "shortname": "sunglasses.01.chalk",
    "localizedName": "Sunglasses 01 Chalk"
  },
  {
    "shortname": "sunglasses.01.tortoise",
    "localizedName": "Sunglasses 01 Tortoise"
  },
  {
    "shortname": "sunglasses.02.black",
    "localizedName": "Sunglasses 02 Black"
  },
  {
    "shortname": "sunglasses.02.camo",
    "localizedName": "Sunglasses 02 Camo"
  },
  {
    "shortname": "sunglasses.02.red",
    "localizedName": "Sunglasses 02 Red"
  },
  {
    "shortname": "sunglasses.03.black",
    "localizedName": "Sunglasses 03 Black"
  },
  {
    "shortname": "sunglasses.03.chrome",
    "localizedName": "Sunglasses 03 Chrome"
  },
  {
    "shortname": "sunglasses.03.gold",
    "localizedName": "Sunglasses 03 Gold"
  },
  {
    "shortname": "sunglasses",
    "localizedName": "Sunglasses"
  },
  {
    "shortname": "sunglasses02black",
    "localizedName": "Sunglasses02black"
  },
  {
    "shortname": "sunglasses02camo",
    "localizedName": "Sunglasses02camo"
  },
  {
    "shortname": "sunglasses02red",
    "localizedName": "Sunglasses02red"
  },
  {
    "shortname": "sunglasses03black",
    "localizedName": "Sunglasses03black"
  },
  {
    "shortname": "sunglasses03chrome",
    "localizedName": "Sunglasses03chrome"
  },
  {
    "shortname": "sunglasses03gold",
    "localizedName": "Sunglasses03gold"
  },
  {
    "shortname": "sunken.knife",
    "localizedName": "Sunken Knife"
  },
  {
    "shortname": "supertea",
    "localizedName": "Supertea"
  },
  {
    "shortname": "supply.signal",
    "localizedName": "Supply Signal"
  },
  {
    "shortname": "surveycharge",
    "localizedName": "Surveycharge"
  },
  {
    "shortname": "syringe.medical",
    "localizedName": "Syringe Medical"
  },
  {
    "shortname": "t1_smg",
    "localizedName": "T1 Smg"
  },
  {
    "shortname": "table",
    "localizedName": "Table"
  },
  {
    "shortname": "tactical.gloves",
    "localizedName": "Tactical Gloves"
  },
  {
    "shortname": "target.reactive.paintable_reactive_target.skin",
    "localizedName": "Target Reactive Paintable Reactive Target Skin"
  },
  {
    "shortname": "target.reactive",
    "localizedName": "Target Reactive"
  },
  {
    "shortname": "targeting.computer",
    "localizedName": "Targeting Computer"
  },
  {
    "shortname": "tarp",
    "localizedName": "Tarp"
  },
  {
    "shortname": "techparts",
    "localizedName": "Techparts"
  },
  {
    "shortname": "telephone",
    "localizedName": "Telephone"
  },
  {
    "shortname": "tincan.alarm",
    "localizedName": "Tincan Alarm"
  },
  {
    "shortname": "tool.binoculars",
    "localizedName": "Tool Binoculars"
  },
  {
    "shortname": "tool.camera",
    "localizedName": "Tool Camera"
  },
  {
    "shortname": "tool.instant_camera",
    "localizedName": "Tool Instant Camera"
  },
  {
    "shortname": "toolgun",
    "localizedName": "Toolgun"
  },
  {
    "shortname": "torch.diver.skin",
    "localizedName": "Torch Diver Skin"
  },
  {
    "shortname": "torch",
    "localizedName": "Torch"
  },
  {
    "shortname": "torch.skull.skin",
    "localizedName": "Torch Skull Skin"
  },
  {
    "shortname": "torch.torch.skull",
    "localizedName": "Torch Torch Skull"
  },
  {
    "shortname": "torchholder",
    "localizedName": "Torchholder"
  },
  {
    "shortname": "trap.bear",
    "localizedName": "Trap Bear"
  },
  {
    "shortname": "trap.landmine",
    "localizedName": "Trap Landmine"
  },
  {
    "shortname": "triangle.rail.road.planter",
    "localizedName": "Triangle Rail Road Planter"
  },
  {
    "shortname": "trike",
    "localizedName": "Trike"
  },
  {
    "shortname": "trophy",
    "localizedName": "Trophy"
  },
  {
    "shortname": "trophy2023",
    "localizedName": "Trophy2023"
  },
  {
    "shortname": "tshirt.black",
    "localizedName": "Tshirt Black"
  },
  {
    "shortname": "tshirt.blue",
    "localizedName": "Tshirt Blue"
  },
  {
    "shortname": "tshirt.flag.germany",
    "localizedName": "Tshirt Flag Germany"
  },
  {
    "shortname": "tshirt.flag.russia",
    "localizedName": "Tshirt Flag Russia"
  },
  {
    "shortname": "tshirt.forestcamo",
    "localizedName": "Tshirt Forestcamo"
  },
  {
    "shortname": "tshirt.gmod",
    "localizedName": "Tshirt Gmod"
  },
  {
    "shortname": "tshirt.long.black",
    "localizedName": "Tshirt Long Black"
  },
  {
    "shortname": "tshirt.long.grey",
    "localizedName": "Tshirt Long Grey"
  },
  {
    "shortname": "tshirt.long.orange",
    "localizedName": "Tshirt Long Orange"
  },
  {
    "shortname": "tshirt.long",
    "localizedName": "Tshirt Long"
  },
  {
    "shortname": "tshirt.long.shirtgreen",
    "localizedName": "Tshirt Long Shirtgreen"
  },
  {
    "shortname": "tshirt.long.skin.longtshirt.azteclongt-shirt",
    "localizedName": "Tshirt Long Skin Longtshirt Azteclongt-shirt"
  },
  {
    "shortname": "tshirt.long.skin.longtshirt.creepyjack",
    "localizedName": "Tshirt Long Skin Longtshirt Creepyjack"
  },
  {
    "shortname": "tshirt.long.skin.longtshirt.frankensteinssweater",
    "localizedName": "Tshirt Long Skin Longtshirt Frankensteinssweater"
  },
  {
    "shortname": "tshirt.long.skin.longtshirt.merryreindeer",
    "localizedName": "Tshirt Long Skin Longtshirt Merryreindeer"
  },
  {
    "shortname": "tshirt.long.skin.longtshirt.nightmaresweater",
    "localizedName": "Tshirt Long Skin Longtshirt Nightmaresweater"
  },
  {
    "shortname": "tshirt.long.skin.longtshirt.signpainter'slongtshirt",
    "localizedName": "Tshirt Long Skin Longtshirt Signpainter'slongtshirt"
  },
  {
    "shortname": "tshirt.long.skin.longtshirt.varsityjacket",
    "localizedName": "Tshirt Long Skin Longtshirt Varsityjacket"
  },
  {
    "shortname": "tshirt.long.yellow",
    "localizedName": "Tshirt Long Yellow"
  },
  {
    "shortname": "tshirt",
    "localizedName": "Tshirt"
  },
  {
    "shortname": "tshirt.red",
    "localizedName": "Tshirt Red"
  },
  {
    "shortname": "tshirt.skin.argylescavenger",
    "localizedName": "Tshirt Skin Argylescavenger"
  },
  {
    "shortname": "tshirt.skin.baseball",
    "localizedName": "Tshirt Skin Baseball"
  },
  {
    "shortname": "tshirt.skin.blackskull&bones",
    "localizedName": "Tshirt Skin Blackskull&bones"
  },
  {
    "shortname": "tshirt.skin.hackervalleyveteran",
    "localizedName": "Tshirt Skin Hackervalleyveteran"
  },
  {
    "shortname": "tshirt.skin.missingtexturesfull",
    "localizedName": "Tshirt Skin Missingtexturesfull"
  },
  {
    "shortname": "tshirt.skin.murderer",
    "localizedName": "Tshirt Skin Murderer"
  },
  {
    "shortname": "tshirt.skin.serwinter",
    "localizedName": "Tshirt Skin Serwinter"
  },
  {
    "shortname": "tshirt.skin.smilet-shirt",
    "localizedName": "Tshirt Skin Smilet-shirt"
  },
  {
    "shortname": "tshirt.skin.targetpractice",
    "localizedName": "Tshirt Skin Targetpractice"
  },
  {
    "shortname": "tshirt.skin.vyshyvanka",
    "localizedName": "Tshirt Skin Vyshyvanka"
  },
  {
    "shortname": "tshirt.urbancamo",
    "localizedName": "Tshirt Urbancamo"
  },
  {
    "shortname": "tugboat",
    "localizedName": "Tugboat"
  },
  {
    "shortname": "tunalight",
    "localizedName": "Tunalight"
  },
  {
    "shortname": "twitch.headset.hat.cap_headset.twitch",
    "localizedName": "Twitch Headset Hat Cap Headset Twitch"
  },
  {
    "shortname": "twitch.headset",
    "localizedName": "Twitch Headset"
  },
  {
    "shortname": "twitchrivals2023desk",
    "localizedName": "Twitchrivals2023desk"
  },
  {
    "shortname": "twitchrivals2025sofa",
    "localizedName": "Twitchrivals2025sofa"
  },
  {
    "shortname": "twitchrivalsflag",
    "localizedName": "Twitchrivalsflag"
  },
  {
    "shortname": "twitchsunglasses",
    "localizedName": "Twitchsunglasses"
  },
  {
    "shortname": "valve1",
    "localizedName": "Valve1"
  },
  {
    "shortname": "valve2",
    "localizedName": "Valve2"
  },
  {
    "shortname": "valve3",
    "localizedName": "Valve3"
  },
  {
    "shortname": "vampire.stake",
    "localizedName": "Vampire Stake"
  },
  {
    "shortname": "vehicle.1mod.cockpit.armored",
    "localizedName": "Vehicle 1mod Cockpit Armored"
  },
  {
    "shortname": "vehicle.1mod.cockpit",
    "localizedName": "Vehicle 1mod Cockpit"
  },
  {
    "shortname": "vehicle.1mod.cockpit.with.engine",
    "localizedName": "Vehicle 1mod Cockpit With Engine"
  },
  {
    "shortname": "vehicle.1mod.engine",
    "localizedName": "Vehicle 1mod Engine"
  },
  {
    "shortname": "vehicle.1mod.flatbed",
    "localizedName": "Vehicle 1mod Flatbed"
  },
  {
    "shortname": "vehicle.1mod.passengers.armored",
    "localizedName": "Vehicle 1mod Passengers Armored"
  },
  {
    "shortname": "vehicle.1mod.rear.seats",
    "localizedName": "Vehicle 1mod Rear Seats"
  },
  {
    "shortname": "vehicle.1mod.storage",
    "localizedName": "Vehicle 1mod Storage"
  },
  {
    "shortname": "vehicle.1mod.taxi",
    "localizedName": "Vehicle 1mod Taxi"
  },
  {
    "shortname": "vehicle.2mod.camper",
    "localizedName": "Vehicle 2mod Camper"
  },
  {
    "shortname": "vehicle.2mod.flatbed",
    "localizedName": "Vehicle 2mod Flatbed"
  },
  {
    "shortname": "vehicle.2mod.fuel.tank",
    "localizedName": "Vehicle 2mod Fuel Tank"
  },
  {
    "shortname": "vehicle.2mod.passengers",
    "localizedName": "Vehicle 2mod Passengers"
  },
  {
    "shortname": "vehicle.car_radio",
    "localizedName": "Vehicle Car Radio"
  },
  {
    "shortname": "vehicle.chassis.2mod",
    "localizedName": "Vehicle Chassis 2mod"
  },
  {
    "shortname": "vehicle.chassis.3mod",
    "localizedName": "Vehicle Chassis 3mod"
  },
  {
    "shortname": "vehicle.chassis.4mod",
    "localizedName": "Vehicle Chassis 4mod"
  },
  {
    "shortname": "vending.machine",
    "localizedName": "Vending Machine"
  },
  {
    "shortname": "venom.snake",
    "localizedName": "Venom Snake"
  },
  {
    "shortname": "wagon",
    "localizedName": "Wagon"
  },
  {
    "shortname": "walkietalkie",
    "localizedName": "Walkietalkie"
  },
  {
    "shortname": "wall.external.high.adobe",
    "localizedName": "Wall External High Adobe"
  },
  {
    "shortname": "wall.external.high.frontier.sitem",
    "localizedName": "Wall External High Frontier Sitem"
  },
  {
    "shortname": "wall.external.high.ice",
    "localizedName": "Wall External High Ice"
  },
  {
    "shortname": "wall.external.high.legacy",
    "localizedName": "Wall External High Legacy"
  },
  {
    "shortname": "wall.external.high",
    "localizedName": "Wall External High"
  },
  {
    "shortname": "wall.external.high.stone",
    "localizedName": "Wall External High Stone"
  },
  {
    "shortname": "wall.external.high.stone.wall.external.high.adobe.sitem",
    "localizedName": "Wall External High Stone Wall External High Adobe Sitem"
  },
  {
    "shortname": "wall.frame.cell.gate",
    "localizedName": "Wall Frame Cell Gate"
  },
  {
    "shortname": "wall.frame.cell",
    "localizedName": "Wall Frame Cell"
  },
  {
    "shortname": "wall.frame.fence.gate",
    "localizedName": "Wall Frame Fence Gate"
  },
  {
    "shortname": "wall.frame.fence",
    "localizedName": "Wall Frame Fence"
  },
  {
    "shortname": "wall.frame.garagedoor",
    "localizedName": "Wall Frame Garagedoor"
  },
  {
    "shortname": "wall.frame.lunar2025_a.lunar_near_year_2025_wall_divider_B.skin",
    "localizedName": "Wall Frame Lunar2025 A Lunar Near Year 2025 Wall Divider B Skin"
  },
  {
    "shortname": "wall.frame.lunar2025_a.lunar_near_year_2025_wall_divider_C.skin",
    "localizedName": "Wall Frame Lunar2025 A Lunar Near Year 2025 Wall Divider C Skin"
  },
  {
    "shortname": "wall.frame.lunar2025_a",
    "localizedName": "Wall Frame Lunar2025 A"
  },
  {
    "shortname": "wall.frame.lunar2025_b",
    "localizedName": "Wall Frame Lunar2025 B"
  },
  {
    "shortname": "wall.frame.lunar2025_c",
    "localizedName": "Wall Frame Lunar2025 C"
  },
  {
    "shortname": "wall.frame.netting",
    "localizedName": "Wall Frame Netting"
  },
  {
    "shortname": "wall.frame.shopfront.metal",
    "localizedName": "Wall Frame Shopfront Metal"
  },
  {
    "shortname": "wall.frame.shopfront",
    "localizedName": "Wall Frame Shopfront"
  },
  {
    "shortname": "wall.graveyard.fence",
    "localizedName": "Wall Graveyard Fence"
  },
  {
    "shortname": "wall.ice.wall",
    "localizedName": "Wall Ice Wall"
  },
  {
    "shortname": "wall.window.bars.metal",
    "localizedName": "Wall Window Bars Metal"
  },
  {
    "shortname": "wall.window.bars.toptier",
    "localizedName": "Wall Window Bars Toptier"
  },
  {
    "shortname": "wall.window.bars.wood",
    "localizedName": "Wall Window Bars Wood"
  },
  {
    "shortname": "wall.window.glass.reinforced",
    "localizedName": "Wall Window Glass Reinforced"
  },
  {
    "shortname": "wall.window.glass.reinforced.window.paintable.skin",
    "localizedName": "Wall Window Glass Reinforced Window Paintable Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.goldstars.hexagon.a.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Goldstars Hexagon A Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.metalsheet.a.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Metalsheet A Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.metalsheet.b.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Metalsheet B Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.metalsheet.c.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Metalsheet C Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.parquet.dark.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Parquet Dark Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.parquet.painted.a.blue.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Parquet Painted A Blue Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.parquet.painted.a.green.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Parquet Painted A Green Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.parquet.painted.a.pink.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Parquet Painted A Pink Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.parquet.painted.a.yellow.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Parquet Painted A Yellow Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.parquet.painted.d.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Parquet Painted D Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.plaster.rough.blue.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Plaster Rough Blue Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.plaster.rough.green.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Plaster Rough Green Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.plaster.swirls.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Plaster Swirls Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.plaster.waves.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Plaster Waves Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.plasterboard.a.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Plasterboard A Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.subway.a.pattern.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Subway A Pattern Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.subway.a.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Subway A Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.subway.a.yellow.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Subway A Yellow Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.subway.b.pattern.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Subway B Pattern Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.subway.b.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Subway B Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.wood.cobwebs.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Wood Cobwebs Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.woodbeams.a.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Woodbeams A Skin"
  },
  {
    "shortname": "wallpaper.ceiling.ceilingpaper.xmas.plaster.moulded.skin",
    "localizedName": "Wallpaper Ceiling Ceilingpaper Xmas Plaster Moulded Skin"
  },
  {
    "shortname": "wallpaper.ceiling",
    "localizedName": "Wallpaper Ceiling"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.asbestos.a.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Asbestos A Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.asbestos.b.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Asbestos B Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.asbestos.c.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Asbestos C Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.asbestos.d.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Asbestos D Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.asbestos.vintage.c.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Asbestos Vintage C Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.asbestos.vintage.d.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Asbestos Vintage D Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.carpet.a.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Carpet A Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.carpet.b.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Carpet B Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.carpet.plain.b.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Carpet Plain B Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.carpet.shaggy.a.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Carpet Shaggy A Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.grass.easter.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Grass Easter Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.marble.a.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Marble A Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.marble.b.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Marble B Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.metal.treadplate.a.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Metal Treadplate A Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.parquet.a.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Parquet A Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.parquet.b.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Parquet B Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.parquet.c.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Parquet C Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.parquet.d.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Parquet D Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.parquet.painted.a.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Parquet Painted A Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.parquet.painted.b.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Parquet Painted B Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.parquet.painted.c.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Parquet Painted C Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.tatami.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Tatami Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.tree.roots.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Tree Roots Skin"
  },
  {
    "shortname": "wallpaper.flooring.floorpaper.Xmas.tiles.A.skin",
    "localizedName": "Wallpaper Flooring Floorpaper Xmas Tiles A Skin"
  },
  {
    "shortname": "wallpaper.flooring",
    "localizedName": "Wallpaper Flooring"
  },
  {
    "shortname": "wallpaper.tool",
    "localizedName": "Wallpaper Tool"
  },
  {
    "shortname": "wallpaper.wall",
    "localizedName": "Wallpaper Wall"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.2025.twitch.rivals.black.skin",
    "localizedName": "Wallpaper Wall Wallpaper 2025 Twitch Rivals Black Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.2025.twitch.rivals.purple.skin",
    "localizedName": "Wallpaper Wall Wallpaper 2025 Twitch Rivals Purple Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.assorted.giftwrap.skin",
    "localizedName": "Wallpaper Wall Wallpaper Assorted Giftwrap Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.bluediamond.skin",
    "localizedName": "Wallpaper Wall Wallpaper Bluediamond Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.clouds.skin",
    "localizedName": "Wallpaper Wall Wallpaper Clouds Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.easter.eggs.skin",
    "localizedName": "Wallpaper Wall Wallpaper Easter Eggs Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.geometrica.skin",
    "localizedName": "Wallpaper Wall Wallpaper Geometrica Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.geometricb.skin",
    "localizedName": "Wallpaper Wall Wallpaper Geometricb Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.green.skin",
    "localizedName": "Wallpaper Wall Wallpaper Green Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.halloween.bats.skin",
    "localizedName": "Wallpaper Wall Wallpaper Halloween Bats Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.JungleDLC_Jungle_animals.skin",
    "localizedName": "Wallpaper Wall Wallpaper JungleDLC Jungle Animals Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.JungleDLC_Jungle_leaves.skin",
    "localizedName": "Wallpaper Wall Wallpaper JungleDLC Jungle Leaves Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.JungleDLC_Jungle_sigil.skin",
    "localizedName": "Wallpaper Wall Wallpaper JungleDLC Jungle Sigil Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.LNY25_bamboo.skin",
    "localizedName": "Wallpaper Wall Wallpaper LNY25 Bamboo Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.LNY25_cherry_blossoms.skin",
    "localizedName": "Wallpaper Wall Wallpaper LNY25 Cherry Blossoms Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.LNY25_chinese_lanterns.skin",
    "localizedName": "Wallpaper Wall Wallpaper LNY25 Chinese Lanterns Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.LNY25_diamonds.skin",
    "localizedName": "Wallpaper Wall Wallpaper LNY25 Diamonds Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.LNY25_panel_A.skin",
    "localizedName": "Wallpaper Wall Wallpaper LNY25 Panel A Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.LNY25_panel_B.skin",
    "localizedName": "Wallpaper Wall Wallpaper LNY25 Panel B Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.LNY25_panel_C.skin",
    "localizedName": "Wallpaper Wall Wallpaper LNY25 Panel C Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.muertos.A.skin",
    "localizedName": "Wallpaper Wall Wallpaper Muertos A Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.polkadotsa.skin",
    "localizedName": "Wallpaper Wall Wallpaper Polkadotsa Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.polkadotsb.skin",
    "localizedName": "Wallpaper Wall Wallpaper Polkadotsb Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.polkadotsc.skin",
    "localizedName": "Wallpaper Wall Wallpaper Polkadotsc Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.rattan.wicker.skin",
    "localizedName": "Wallpaper Wall Wallpaper Rattan Wicker Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.red.skin",
    "localizedName": "Wallpaper Wall Wallpaper Red Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.retroa.skin",
    "localizedName": "Wallpaper Wall Wallpaper Retroa Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.retrob.skin",
    "localizedName": "Wallpaper Wall Wallpaper Retrob Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.retroc.skin",
    "localizedName": "Wallpaper Wall Wallpaper Retroc Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.royala.skin",
    "localizedName": "Wallpaper Wall Wallpaper Royala Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.royalb.skin",
    "localizedName": "Wallpaper Wall Wallpaper Royalb Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.royalc.skin",
    "localizedName": "Wallpaper Wall Wallpaper Royalc Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.subway.skin",
    "localizedName": "Wallpaper Wall Wallpaper Subway Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.subwayb.skin",
    "localizedName": "Wallpaper Wall Wallpaper Subwayb Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.tiles.hexagon.a.skin",
    "localizedName": "Wallpaper Wall Wallpaper Tiles Hexagon A Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.venetianplastera.skin",
    "localizedName": "Wallpaper Wall Wallpaper Venetianplastera Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.venetianplasterb.skin",
    "localizedName": "Wallpaper Wall Wallpaper Venetianplasterb Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.venetianplasterc.skin",
    "localizedName": "Wallpaper Wall Wallpaper Venetianplasterc Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.wainscottinga.skin",
    "localizedName": "Wallpaper Wall Wallpaper Wainscottinga Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.wainscottingb.skin",
    "localizedName": "Wallpaper Wall Wallpaper Wainscottingb Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.wainscottingc.skin",
    "localizedName": "Wallpaper Wall Wallpaper Wainscottingc Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.yellow.skin",
    "localizedName": "Wallpaper Wall Wallpaper Yellow Skin"
  },
  {
    "shortname": "wallpaper.wall.wallpaper.yellowstripe.skin",
    "localizedName": "Wallpaper Wall Wallpaper Yellowstripe Skin"
  },
  {
    "shortname": "wantedposter.2.skin",
    "localizedName": "Wantedposter 2 Skin"
  },
  {
    "shortname": "wantedposter.3.skin",
    "localizedName": "Wantedposter 3 Skin"
  },
  {
    "shortname": "wantedposter.4.skin",
    "localizedName": "Wantedposter 4 Skin"
  },
  {
    "shortname": "wantedposter",
    "localizedName": "Wantedposter"
  },
  {
    "shortname": "wantedposter.wantedposter2",
    "localizedName": "Wantedposter Wantedposter2"
  },
  {
    "shortname": "wantedposter.wantedposter3",
    "localizedName": "Wantedposter Wantedposter3"
  },
  {
    "shortname": "wantedposter.wantedposter4",
    "localizedName": "Wantedposter Wantedposter4"
  },
  {
    "shortname": "warmingtea",
    "localizedName": "Warmingtea"
  },
  {
    "shortname": "watchtower.wood",
    "localizedName": "Watchtower Wood"
  },
  {
    "shortname": "water.barrel",
    "localizedName": "Water Barrel"
  },
  {
    "shortname": "water.catcher.large",
    "localizedName": "Water Catcher Large"
  },
  {
    "shortname": "water.catcher.small",
    "localizedName": "Water Catcher Small"
  },
  {
    "shortname": "water",
    "localizedName": "Water"
  },
  {
    "shortname": "water.purifier",
    "localizedName": "Water Purifier"
  },
  {
    "shortname": "water.radioactive",
    "localizedName": "Water Radioactive"
  },
  {
    "shortname": "water.salt",
    "localizedName": "Water Salt"
  },
  {
    "shortname": "waterjug",
    "localizedName": "Waterjug"
  },
  {
    "shortname": "waterpump",
    "localizedName": "Waterpump"
  },
  {
    "shortname": "weapon.mod.8x.scope",
    "localizedName": "Weapon Mod 8x Scope"
  },
  {
    "shortname": "weapon.mod.burstmodule",
    "localizedName": "Weapon Mod Burstmodule"
  },
  {
    "shortname": "weapon.mod.extendedmags",
    "localizedName": "Weapon Mod Extendedmags"
  },
  {
    "shortname": "weapon.mod.flashlight",
    "localizedName": "Weapon Mod Flashlight"
  },
  {
    "shortname": "weapon.mod.gascompressionovedrive",
    "localizedName": "Weapon Mod Gascompressionovedrive"
  },
  {
    "shortname": "weapon.mod.holosight",
    "localizedName": "Weapon Mod Holosight"
  },
  {
    "shortname": "weapon.mod.lasersight",
    "localizedName": "Weapon Mod Lasersight"
  },
  {
    "shortname": "weapon.mod.muzzleboost",
    "localizedName": "Weapon Mod Muzzleboost"
  },
  {
    "shortname": "weapon.mod.muzzlebrake",
    "localizedName": "Weapon Mod Muzzlebrake"
  },
  {
    "shortname": "weapon.mod.oilfiltersilencer",
    "localizedName": "Weapon Mod Oilfiltersilencer"
  },
  {
    "shortname": "weapon.mod.silencer",
    "localizedName": "Weapon Mod Silencer"
  },
  {
    "shortname": "weapon.mod.simplesight",
    "localizedName": "Weapon Mod Simplesight"
  },
  {
    "shortname": "weapon.mod.small.scope",
    "localizedName": "Weapon Mod Small Scope"
  },
  {
    "shortname": "weapon.mod.sodacansilencer",
    "localizedName": "Weapon Mod Sodacansilencer"
  },
  {
    "shortname": "weapon.mod.targetingattachment",
    "localizedName": "Weapon Mod Targetingattachment"
  },
  {
    "shortname": "weaponrack.doublelight",
    "localizedName": "Weaponrack Doublelight"
  },
  {
    "shortname": "weaponrack.light",
    "localizedName": "Weaponrack Light"
  },
  {
    "shortname": "wheat",
    "localizedName": "Wheat"
  },
  {
    "shortname": "white.berry",
    "localizedName": "White Berry"
  },
  {
    "shortname": "whiteidtag",
    "localizedName": "Whiteidtag"
  },
  {
    "shortname": "wicker.barrel",
    "localizedName": "Wicker Barrel"
  },
  {
    "shortname": "window.paintable",
    "localizedName": "Window Paintable"
  },
  {
    "shortname": "wiretool",
    "localizedName": "Wiretool"
  },
  {
    "shortname": "wolfmeat.burned",
    "localizedName": "Wolfmeat Burned"
  },
  {
    "shortname": "wolfmeat.cooked",
    "localizedName": "Wolfmeat Cooked"
  },
  {
    "shortname": "wolfmeat.raw",
    "localizedName": "Wolfmeat Raw"
  },
  {
    "shortname": "wolfmeat.spoiled",
    "localizedName": "Wolfmeat Spoiled"
  },
  {
    "shortname": "wood.armor.helmet.cocoknight.head.skin",
    "localizedName": "Wood Armor Helmet Cocoknight Head Skin"
  },
  {
    "shortname": "wood.armor.helmet",
    "localizedName": "Wood Armor Helmet"
  },
  {
    "shortname": "wood.armor.jacket.cocoknight.jacket.skin",
    "localizedName": "Wood Armor Jacket Cocoknight Jacket Skin"
  },
  {
    "shortname": "wood.armor.jacket",
    "localizedName": "Wood Armor Jacket"
  },
  {
    "shortname": "wood.armor.pants.cocoknight.pants.skin",
    "localizedName": "Wood Armor Pants Cocoknight Pants Skin"
  },
  {
    "shortname": "wood.armor.pants",
    "localizedName": "Wood Armor Pants"
  },
  {
    "shortname": "wood",
    "localizedName": "Wood"
  },
  {
    "shortname": "woodarmor.gloves.cocoknight.gloves.skin",
    "localizedName": "Woodarmor Gloves Cocoknight Gloves Skin"
  },
  {
    "shortname": "woodarmor.gloves",
    "localizedName": "Woodarmor Gloves"
  },
  {
    "shortname": "woodcross",
    "localizedName": "Woodcross"
  },
  {
    "shortname": "wooden.shield",
    "localizedName": "Wooden Shield"
  },
  {
    "shortname": "woodframe.large",
    "localizedName": "Woodframe Large"
  },
  {
    "shortname": "woodframe.medium",
    "localizedName": "Woodframe Medium"
  },
  {
    "shortname": "woodframe.small",
    "localizedName": "Woodframe Small"
  },
  {
    "shortname": "woodframe.standing",
    "localizedName": "Woodframe Standing"
  },
  {
    "shortname": "woodmirror.large",
    "localizedName": "Woodmirror Large"
  },
  {
    "shortname": "woodmirror.medium",
    "localizedName": "Woodmirror Medium"
  },
  {
    "shortname": "woodmirror.small",
    "localizedName": "Woodmirror Small"
  },
  {
    "shortname": "woodmirror.standing",
    "localizedName": "Woodmirror Standing"
  },
  {
    "shortname": "woodtea.advanced",
    "localizedName": "Woodtea Advanced"
  },
  {
    "shortname": "woodtea",
    "localizedName": "Woodtea"
  },
  {
    "shortname": "woodtea.pure",
    "localizedName": "Woodtea Pure"
  },
  {
    "shortname": "workbench1",
    "localizedName": "Workbench1"
  },
  {
    "shortname": "workbench2",
    "localizedName": "Workbench2"
  },
  {
    "shortname": "workbench3",
    "localizedName": "Workbench3"
  },
  {
    "shortname": "workcart",
    "localizedName": "Workcart"
  },
  {
    "shortname": "worm",
    "localizedName": "Worm"
  },
  {
    "shortname": "wrappedgift",
    "localizedName": "Wrappedgift"
  },
  {
    "shortname": "wrappingpaper",
    "localizedName": "Wrappingpaper"
  },
  {
    "shortname": "xmas.advent",
    "localizedName": "Xmas Advent"
  },
  {
    "shortname": "xmas.decoration.baubels",
    "localizedName": "Xmas Decoration Baubels"
  },
  {
    "shortname": "xmas.decoration.candycanes",
    "localizedName": "Xmas Decoration Candycanes"
  },
  {
    "shortname": "xmas.decoration.gingerbreadmen",
    "localizedName": "Xmas Decoration Gingerbreadmen"
  },
  {
    "shortname": "xmas.decoration.lights",
    "localizedName": "Xmas Decoration Lights"
  },
  {
    "shortname": "xmas.decoration.pinecone",
    "localizedName": "Xmas Decoration Pinecone"
  },
  {
    "shortname": "xmas.decoration.star",
    "localizedName": "Xmas Decoration Star"
  },
  {
    "shortname": "xmas.decoration.tinsel",
    "localizedName": "Xmas Decoration Tinsel"
  },
  {
    "shortname": "xmas.door.garland",
    "localizedName": "Xmas Door Garland"
  },
  {
    "shortname": "xmas.double.door.garland",
    "localizedName": "Xmas Double Door Garland"
  },
  {
    "shortname": "xmas.lightstring.advanced",
    "localizedName": "Xmas Lightstring Advanced"
  },
  {
    "shortname": "xmas.lightstring",
    "localizedName": "Xmas Lightstring"
  },
  {
    "shortname": "xmas.present.large",
    "localizedName": "Xmas Present Large"
  },
  {
    "shortname": "xmas.present.medium",
    "localizedName": "Xmas Present Medium"
  },
  {
    "shortname": "xmas.present.small",
    "localizedName": "Xmas Present Small"
  },
  {
    "shortname": "xmas.tree",
    "localizedName": "Xmas Tree"
  },
  {
    "shortname": "xmas.window.garland",
    "localizedName": "Xmas Window Garland"
  },
  {
    "shortname": "xmasdoorwreath",
    "localizedName": "Xmasdoorwreath"
  },
  {
    "shortname": "xylophone",
    "localizedName": "Xylophone"
  },
  {
    "shortname": "yellow.berry",
    "localizedName": "Yellow Berry"
  },
  {
    "shortname": "yellowidtag",
    "localizedName": "Yellowidtag"
  }
];

export const itemsDB = rawItemsDB.map(item => {
  const ruData = (itemsRu as Record<string, { name: string, aliases: string[] }>)[item.shortname];
  const imgVal = images[`../assets/items/${item.shortname}.png`];
  const imageUrl = typeof imgVal === 'string' ? imgVal : (imgVal as any)?.default || '';
  return {
    shortname: item.shortname,
    nameEn: item.localizedName,
    nameRu: ruData?.name || item.localizedName,
    aliases: ruData?.aliases || [],
    imageUrl
  };
});

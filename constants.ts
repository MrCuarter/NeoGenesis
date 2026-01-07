
// --- IDENTITY ---
export const RACES = [
  { es: "Humano", en: "Human", value: "Human" },
  { es: "Elfo", en: "Elf", value: "Elf" },
  { es: "Orco", en: "Orc", value: "Orc" },
  { es: "Enano", en: "Dwarf", value: "Dwarf" },
  { es: "Cyborg", en: "Cyborg", value: "Cyborg" },
  { es: "Androide", en: "Android", value: "Android" },
  { es: "Tiefling", en: "Tiefling", value: "Tiefling" },
  { es: "Dracónido", en: "Dragonborn", value: "Dragonborn" },
  { es: "Hada", en: "Fairy", value: "Fairy" },
  { es: "Vampiro", en: "Vampire", value: "Vampire" },
  { es: "No-muerto", en: "Undead", value: "Undead" },
  { es: "Alienígena", en: "Alien", value: "Alien" },
  { es: "Espectro", en: "Wraith", value: "Wraith" },
  { es: "Hombre Lobo", en: "Werewolf", value: "Werewolf" },
  { es: "Goblin", en: "Goblin", value: "Goblin" },
  { es: "Demonio", en: "Demon", value: "Demon" },
  { es: "Ángel", en: "Angel", value: "Angel" }
];

export const GENDERS = [
  { es: "Masculino", en: "Male", value: "Male" },
  { es: "Femenino", en: "Female", value: "Female" },
  { es: "No-binario", en: "Non-binary", value: "Non-binary" },
  { es: "Andrógino", en: "Androgynous", value: "Androgynous" },
  { es: "Robot/Sin género", en: "Robot/Genderless", value: "Robot/Genderless" }
];

export const SKIN_TONES = [
  { es: "Pálido", en: "Pale", value: "Pale skin", color: "#FFDFC4" },
  { es: "Claro", en: "Fair", value: "Fair skin", color: "#F0C8A0" },
  { es: "Bronceado", en: "Tan", value: "Tan skin", color: "#D2A679" },
  { es: "Moreno", en: "Brown", value: "Brown skin", color: "#8D5524" },
  { es: "Oscuro", en: "Dark", value: "Dark skin", color: "#3B2219" },
  { es: "Verdoso", en: "Greenish", value: "Greenish skin", color: "#7BA05B" },
  { es: "Azulado", en: "Bluish", value: "Bluish skin", color: "#8FB0C8" },
  { es: "Rojizo", en: "Reddish", value: "Reddish skin", color: "#C07070" },
  { es: "Grisáceo", en: "Greyish", value: "Greyish skin", color: "#9DA3A8" },
  { es: "Metálico", en: "Metallic", value: "Metallic chrome skin", color: "#B0C4DE" },
  { es: "Dorado", en: "Golden", value: "Golden skin", color: "#FFD700" },
  { es: "Escamoso", en: "Scaly", value: "Scaly texture skin", color: "#4A6E53" }
];

export const AGES = [
  { es: "Niño/a", en: "Child", value: "Child" },
  { es: "Adolescente", en: "Teenager", value: "Teenager" },
  { es: "Joven Adulto", en: "Young Adult", value: "Young Adult" },
  { es: "Adulto", en: "Adult", value: "Adult" },
  { es: "Maduro", en: "Middle-Aged", value: "Middle-Aged" },
  { es: "Anciano", en: "Elderly", value: "Elderly" },
  { es: "Ancestral", en: "Ancient", value: "Ancient" }
];

export const BODY_TYPES = [
  { es: "Atlético", en: "Athletic", value: "Athletic build" },
  { es: "Delgado", en: "Slender", value: "Slender build" },
  { es: "Musculoso", en: "Muscular", value: "Heavily muscular" },
  { es: "Curvy", en: "Curvy", value: "Curvy figure" },
  { es: "Robusto", en: "Stocky", value: "Stocky build" },
  { es: "Esquelético", en: "Skeletal", value: "Skeletal thin" },
  { es: "Cibernético", en: "Cybernetic", value: "Cybernetically enhanced body" },
  { es: "Gordo/Grande", en: "Large/Fat", value: "Large heavy build" }
];

// --- ROLES ---
export const ROLES_FANTASY = [
  { es: "Guerrero", en: "Warrior", value: "Warrior" },
  { es: "Mago", en: "Mage", value: "Mage" },
  { es: "Hacker", en: "Hacker", value: "Hacker" },
  { es: "Pícaro", en: "Rogue", value: "Rogue" },
  { es: "Mercenario", en: "Mercenary", value: "Mercenary" },
  { es: "Monje", en: "Monk", value: "Monk" },
  { es: "Cazador", en: "Hunter", value: "Hunter" },
  { es: "Piloto Espacial", en: "Space Pilot", value: "Space Pilot" },
  { es: "Sacerdote", en: "Priest", value: "Priest" },
  { es: "Nigromante", en: "Necromancer", value: "Necromancer" },
  { es: "Paladín", en: "Paladin", value: "Paladin" },
  { es: "Chamán", en: "Shaman", value: "Shaman" },
  { es: "Druida", en: "Druid", value: "Druid" },
  { es: "Cyborg Ninja", en: "Cyborg Ninja", value: "Cyborg Ninja" },
  { es: "Bardo", en: "Bard", value: "Bard" },
  { es: "Artificiero", en: "Artificer", value: "Artificer" }
];

export const ROLES_REALISTIC = [
  { es: "Médico", en: "Doctor", value: "Doctor" },
  { es: "Soldado", en: "Soldier", value: "Tactical Soldier" },
  { es: "Policía", en: "Police Officer", value: "Police Officer" },
  { es: "Bombero", en: "Firefighter", value: "Firefighter" },
  { es: "Científico", en: "Scientist", value: "Lab Scientist" },
  { es: "Mecánico", en: "Mechanic", value: "Mechanic" },
  { es: "Chef", en: "Chef", value: "Professional Chef" },
  { es: "Atleta", en: "Athlete", value: "Athlete" },
  { es: "Músico", en: "Musician", value: "Musician" },
  { es: "Detective", en: "Detective", value: "Detective" },
  { es: "Profesor", en: "Teacher", value: "Teacher" },
  { es: "Astronauta", en: "Astronaut", value: "Astronaut" },
  { es: "Ejecutivo", en: "Business Person", value: "Corporate Executive" },
  { es: "Influencer", en: "Influencer", value: "Trendy Influencer" }
];

// --- PHYSICAL TRAITS (NEW) ---
export const HAIR_STYLES = [
  { es: "Corto Militar", en: "Buzz Cut", value: "Buzz cut hairstyle" },
  { es: "Largo y Suelto", en: "Long Straight", value: "Long flowing straight hair" },
  { es: "Ondulado/Rizado", en: "Curly", value: "Voluminous curly hair" },
  { es: "Coleta", en: "Ponytail", value: "High ponytail" },
  { es: "Trenzas", en: "Braids", value: "Intricate braided hair" },
  { es: "Mohicano", en: "Mohawk", value: "Punk mohawk" },
  { es: "Calvo", en: "Bald", value: "Completely bald head" },
  { es: "Bob Cut", en: "Bob Cut", value: "Short bob cut" },
  { es: "Despeinado", en: "Messy", value: "Messy bedhead hair" },
  { es: "Dreadlocks", en: "Dreadlocks", value: "Long dreadlocks" },
  { es: "Afro", en: "Afro", value: "Large afro hairstyle" },
  { es: "Flequillo", en: "Bangs", value: "Hair with bangs" },
  { es: "Rapado lateral", en: "Side Shave", value: "Side shaved undercut" }
];

// New: Features instead of just color
export const EYE_FEATURES = [
  { es: "Normales", en: "Normal", value: "Intense eyes" },
  { es: "Ojos de Gato", en: "Cat Eyes", value: "Slit-pupil cat eyes" },
  { es: "Brillantes (Energía)", en: "Glowing", value: "Glowing luminous eyes" },
  { es: "Ciegos / Blancos", en: "Blind", value: "Pale blind milky eyes" },
  { es: "Tercer Ojo", en: "Third Eye", value: "Mystical third eye on forehead" },
  { es: "Ojos Cibernéticos", en: "Cybernetic", value: "Cybernetic optics HUD eyes" },
  { es: "Sin Ojos", en: "Eyeless", value: "Eyeless empty sockets" },
  { es: "Achinados", en: "Slanted", value: "Sharp slanted eyes" },
  { es: "Tuerto (Parche)", en: "One-Eyed", value: "One eye covered by patch" },
  { es: "Heterocromía", en: "Heterochromia", value: "Heterochromia (different colors)" },
  { es: "Ojos Grandes (Anime)", en: "Large Anime", value: "Large expressive eyes" },
  { es: "Inyectados en Sangre", en: "Bloodshot", value: "Bloodshot angry eyes" },
  { es: "Ojos Negros (Siniestro)", en: "Black Sclera", value: "Pitch black sclera eyes" }
];

export const DENTURES = [
  { es: "Perfecta", en: "Perfect", value: "Perfect white teeth" },
  { es: "Colmillos", en: "Fangs", value: "Sharp fangs" },
  { es: "Dientes de Oro", en: "Gold Teeth", value: "Gold teeth grille" },
  { es: "Rota/Mellada", en: "Broken", value: "Broken jagged teeth" },
  { es: "Metálica", en: "Metallic", value: "Metal mechanical teeth" },
  { es: "Hueco entre dientes", en: "Gap", value: "Gap between front teeth" },
  { es: "Dientes de Tiburón", en: "Shark", value: "Shark-like rows of teeth" }
];

export const NOSE_SHAPES = [
  { es: "Pequeña/Fina", en: "Small", value: "Small button nose" },
  { es: "Aguileña", en: "Aquiline", value: "Aquiline hooked nose" },
  { es: "Ancha", en: "Wide", value: "Wide broad nose" },
  { es: "Recta", en: "Straight", value: "Straight grecian nose" },
  { es: "Rota", en: "Broken", value: "Crooked broken nose" },
  { es: "Piercing", en: "Pierced", value: "Nose with piercing" },
  { es: "Chato", en: "Snub", value: "Snub nose" }
];

export const FACE_MARKINGS = [
  { es: "Ninguna", en: "None", value: "Clean skin" },
  { es: "Pecas", en: "Freckles", value: "Dusting of freckles" },
  { es: "Cicatriz en Ojo", en: "Eye Scar", value: "Vertical scar over one eye" },
  { es: "Tatuaje Tribal", en: "Tribal Tattoo", value: "Tribal face tattoo" },
  { es: "Pintura de Guerra", en: "War Paint", value: "Tribal war paint" },
  { es: "Implantes Cyber", en: "Cyber Implants", value: "Cybernetic face lines and implants" },
  { es: "Quemadura", en: "Burn", value: "Burn marks on side of face" },
  { es: "Arrugas", en: "Wrinkles", value: "Deep weathered wrinkles" },
  { es: "Maquillaje Gótico", en: "Goth Makeup", value: "Heavy gothic makeup" },
  { es: "Vendajes", en: "Bandages", value: "Face partially wrapped in bandages" },
  { es: "Escamas", en: "Scales", value: "Patches of scales on cheeks" }
];

// --- OUTFIT & EQUIPMENT (NEW) ---
export const HEADWEAR = [
  { es: "Ninguno", en: "None", value: "No headwear" },
  { es: "Casco Táctico", en: "Tactical Helmet", value: "High-tech tactical helmet" },
  { es: "Sombrero de Mago", en: "Wizard Hat", value: "Pointed wizard hat" },
  { es: "Capucha", en: "Hood", value: "Deep shadowy hood" },
  { es: "Gorra", en: "Cap", value: "Baseball cap" },
  { es: "Corona", en: "Crown", value: "Royal crown" },
  { es: "Yelmo de Caballero", en: "Knight Helm", value: "Full plate knight helm" },
  { es: "Gafas de Aviador", en: "Aviators", value: "Aviator goggles" },
  { es: "Parche Ojo", en: "Eyepatch", value: "Leather eyepatch" },
  { es: "Máscara de Gas", en: "Gas Mask", value: "Post-apocalyptic gas mask" },
  { es: "Cuernos", en: "Horns", value: "Natural horns" },
  { es: "Aureola", en: "Halo", value: "Glowing halo" },
  { es: "Máscara Oni", en: "Oni Mask", value: "Traditional Japanese Oni mask" },
  { es: "Auriculares", en: "Headphones", value: "Large headphones" },
  { es: "Boina", en: "Beret", value: "Military beret" },
  { es: "Máscara Anonymus", en: "Guy Fawkes", value: "Guy Fawkes mask" }
];

export const UPPER_BODY = [
  { es: "Camiseta", en: "T-Shirt", value: "Basic t-shirt" },
  { es: "Armadura de Placas", en: "Plate Armor", value: "Shiny plate armor breastplate" },
  { es: "Armadura de Cuero", en: "Leather Armor", value: "Studded leather armor" },
  { es: "Chaqueta de Cuero", en: "Leather Jacket", value: "Biker leather jacket" },
  { es: "Sudadera (Hoodie)", en: "Hoodie", value: "Oversized hoodie" },
  { es: "Camisa Formal", en: "Dress Shirt", value: "Formal button-up shirt" },
  { es: "Corsé", en: "Corset", value: "Victorian corset" },
  { es: "Chaleco Táctico", en: "Tactical Vest", value: "Military tactical vest" },
  { es: "Túnica", en: "Tunic", value: "Simple cloth tunic" },
  { es: "Desnudo/Top", en: "Shirtless/Top", value: "Shirtless / Crop top" },
  { es: "Chaqueta Vaquera", en: "Denim Jacket", value: "Denim jacket" },
  { es: "Poncho", en: "Poncho", value: "Worn poncho" }
];

export const LOWER_BODY = [
  { es: "Pantalones Vaqueros", en: "Jeans", value: "Denim jeans" },
  { es: "Pantalones de Carga", en: "Cargo Pants", value: "Tactical cargo pants" },
  { es: "Falda", en: "Skirt", value: "Pleated skirt" },
  { es: "Grebas (Armadura)", en: "Greaves", value: "Armored greaves and cuisses" },
  { es: "Pantalones de Cuero", en: "Leather Pants", value: "Tight leather pants" },
  { es: "Mallas", en: "Leggings", value: "Athletic leggings" },
  { es: "Pantalón de Traje", en: "Suit Pants", value: "Formal suit trousers" },
  { es: "Calzones Rotos", en: "Rags", value: "Torn rag trousers" },
  { es: "Pantalones Cortos", en: "Shorts", value: "Shorts" },
  { es: "Kilt", en: "Kilt", value: "Traditional tartan kilt" }
];

export const FULL_BODY = [
  { es: "Ninguno (Usar piezas)", en: "None", value: "" },
  { es: "Gabardina", en: "Trench Coat", value: "Long noir trench coat" },
  { es: "Vestido de Gala", en: "Gown", value: "Elegant evening gown" },
  { es: "Toga de Mago", en: "Robes", value: "Flowing wizard robes" },
  { es: "Traje Espacial", en: "Spacesuit", value: "Sci-fi spacesuit" },
  { es: "Traje de Negocios", en: "Business Suit", value: "Full business suit" },
  { es: "Mono de Trabajo", en: "Jumpsuit", value: "Mechanic jumpsuit" },
  { es: "Kimono", en: "Kimono", value: "Traditional Kimono" },
  { es: "Capa con Capucha", en: "Cloak", value: "Full body cloak" },
  { es: "Exoesqueleto", en: "Exosuit", value: "Heavy mechanical exosuit" },
  { es: "Bata de Laboratorio", en: "Lab Coat", value: "White scientist lab coat" }
];

export const FOOTWEAR = [
  { es: "Botas Militares", en: "Combat Boots", value: "Heavy combat boots" },
  { es: "Zapatillas", en: "Sneakers", value: "High-top sneakers" },
  { es: "Botas de Cuero", en: "Leather Boots", value: "Tall leather boots" },
  { es: "Sandalias", en: "Sandals", value: "Gladiator sandals" },
  { es: "Descalzo", en: "Barefoot", value: "Barefoot" },
  { es: "Tacones", en: "Heels", value: "High heels" },
  { es: "Zapatos Formales", en: "Dress Shoes", value: "Polished dress shoes" },
  { es: "Botas Magnéticas", en: "Mag Boots", value: "Sci-fi magnetic boots" }
];

export const HELD_ITEMS = [
  { es: "Nada", en: "Nothing", value: "Empty hands" },
  { es: "Espada", en: "Sword", value: "Holding a sword" },
  { es: "Pistola", en: "Gun", value: "Holding a futuristic pistol" },
  { es: "Báculo", en: "Staff", value: "Holding a magic staff" },
  { es: "Libro", en: "Book", value: "Holding an ancient tome" },
  { es: "Teléfono", en: "Smartphone", value: "Looking at a smartphone" },
  { es: "Cigarrillo", en: "Cigarette", value: "Smoking a cigarette" },
  { es: "Copa/Bebida", en: "Drink", value: "Holding a drink" },
  { es: "Herramienta", en: "Tool", value: "Holding a wrench" },
  { es: "Orbe Mágico", en: "Orb", value: "Holding a glowing orb" },
  { es: "Escudo", en: "Shield", value: "Holding a shield" },
  { es: "Katana", en: "Katana", value: "Gripping a katana" },
  { es: "Daga", en: "Dagger", value: "Holding a rogue dagger" },
  { es: "Tableta", en: "Tablet", value: "Holding a digital tablet" }
];

export const CLASS_EXTRAS = [
  { es: "Ninguno", en: "None", value: "" },
  { es: "Alas", en: "Wings", value: "Large majestic wings on back" },
  { es: "Mochila", en: "Backpack", value: "Heavy adventurer backpack" },
  { es: "Capa Ondeando", en: "Cape", value: "Long cape flowing in wind" },
  { es: "Cinturón Munición", en: "Ammo Belt", value: "Belt full of ammo and grenades" },
  { es: "Grimorio (Cintura)", en: "Grimoire", value: "Magic book hanging from belt" },
  { es: "Pociones", en: "Potions", value: "Multiple potion vials on belt" },
  { es: "Arco en Espalda", en: "Bow", value: "Longbow slung over shoulder" },
  { es: "Dron Acompañante", en: "Drone", value: "Small drone hovering nearby" },
  { es: "Aura Mágica", en: "Aura", value: "Glowing magical aura surrounding body" },
  { es: "Cola", en: "Tail", value: "Long tail visible" },
  { es: "Mascota Pequeña", en: "Pet", value: "Small creature sitting on shoulder" },
  { es: "Instrumento (Espalda)", en: "Lute", value: "Lute strapped to back" },
  { es: "Brazos Cibernéticos", en: "Cyber Arms", value: "Additional mechanical arms" }
];

// --- EXPRESSION & ACTION ---
export const EMOTIONS = [
  { es: "Serio", en: "Stoic", value: "Stoic expression" },
  { es: "Alegre", en: "Joyful", value: "Joyful smiling expression" },
  { es: "Furioso", en: "Furious", value: "Furious angry expression" },
  { es: "Triste", en: "Sad", value: "Sorrowful melancholic expression" },
  { es: "Seductor", en: "Seductive", value: "Seductive gaze" },
  { es: "Aterrorizado", en: "Scared", value: "Terrified expression" },
  { es: "Loco", en: "Crazy", value: "Insane crazy grin" },
  { es: "Determinado", en: "Determined", value: "Determined look" },
  { es: "Misterioso", en: "Mysterious", value: "Mysterious shadow over eyes" },
  { es: "Aburrido", en: "Bored", value: "Bored uninterested look" },
  { es: "Sorprendido", en: "Surprised", value: "Shocked surprised expression" },
  { es: "Arrogante", en: "Arrogant", value: "Arrogant smirk" }
];

export const POSES_IMAGE = [
  { es: "Heroico", en: "Heroic", value: "Standing in a heroic pose" },
  { es: "Sentado", en: "Sitting", value: "Sitting naturally" },
  { es: "Brazos cruzados", en: "Arms Crossed", value: "Arms crossed confidently" },
  { es: "Combate", en: "Combat", value: "Dynamic battle stance ready to fight" },
  { es: "Flotando", en: "Levitating", value: "Levitating in mid-air" },
  { es: "Retrato", en: "Portrait", value: "Looking straight at camera" },
  { es: "De Espaldas", en: "From Behind", value: "View from behind" },
  { es: "Sosteniendo Objeto", en: "Holding Item", value: "Holding a significant object" },
  { es: "De Rodillas", en: "Kneeling", value: "Kneeling on one knee" },
  { es: "Saltando", en: "Jumping", value: "Mid-air jump action" },
  { es: "Tumbado", en: "Laying", value: "Laying down relaxed" },
  { es: "Caminando", en: "Walking", value: "Walking towards camera" }
];

export const ACTIONS_VIDEO = [
  { es: "Caminando", en: "Walking", value: "Walking confidently towards the camera" },
  { es: "Corriendo", en: "Running", value: "Sprinting at high speed" },
  { es: "Luchando", en: "Fighting", value: "Engaging in combat" },
  { es: "Lanzando Hechizo", en: "Casting", value: "Casting a magic spell" },
  { es: "Tecleando", en: "Typing", value: "Typing rapidly" },
  { es: "Bailando", en: "Dancing", value: "Dancing rhythmically" },
  { es: "Hablando", en: "Talking", value: "Talking expressively" },
  { es: "Respirando", en: "Breathing", value: "Just breathing heavily, subtle motion" },
  { es: "Mirando alrededor", en: "Looking Around", value: "Looking around the environment" },
  { es: "Bebiendo", en: "Drinking", value: "Drinking from a cup" }
];

// --- VISUALS (EXPANDED) ---
export const STYLES = [
  // Realistic / Cinematic
  { es: "Realista (Cine)", en: "Cinematic", value: "Cinematic movie shot, 8k resolution, photorealistic, depth of field" },
  { es: "Fotografía Analógica", en: "Analog Photo", value: "Analog photography, Kodak Portra 400, film grain, vintage feel" },
  { es: "Dark Souls / Elden Ring", en: "Dark Fantasy", value: "Dark Fantasy, Elden Ring style, gritty, atmospheric, FromSoftware artstyle" },
  { es: "Edgar Allan Poe / Gótico", en: "Gothic Horror", value: "Gothic Horror, Edgar Allan Poe vibe, dark victorian, melancholic, mist, high contrast" },
  { es: "Cyberpunk Realista", en: "Cyberpunk Real", value: "Cyberpunk realism, neon reflections, wet streets, raytracing" },
  
  // Stylized / 3D
  { es: "3D Pixar/Disney", en: "Pixar 3D", value: "Pixar 3D animation style, cute, expressive, perfect lighting" },
  { es: "Arcane (LoL)", en: "Arcane Style", value: "Arcane TV Show style, painterly 3D texture, Fortiche production artstyle" },
  { es: "Cyberpunk Edgerunners", en: "Edgerunners", value: "Cyberpunk Edgerunners anime style, Studio Trigger, vibrant neon, sharp lines" },
  { es: "World of Warcraft", en: "Warcraft", value: "Blizzard style, hand painted textures, stylized 3D, heroic proportions" },
  { es: "Claymation", en: "Clay", value: "Claymation style, plasticine texture, stop-motion look" },
  { es: "Low Poly", en: "Low Poly", value: "Low poly PS1 retro graphics, jagged edges, retro gaming" },
  { es: "Fortnite", en: "Fortnite", value: "Fortnite style, stylized 3D, vibrant colors, smooth textures" },
  
  // 2D / Artistic
  { es: "Anime Ghibli", en: "Ghibli", value: "Studio Ghibli art style, watercolor backgrounds, high quality anime" },
  { es: "Comic Book", en: "Comic", value: "Comic book style, halftone dots, bold black lines, Marvel/DC style" },
  { es: "Ilustración Vectorial", en: "Vector", value: "Flat vector illustration, clean minimalism, Behance style" },
  { es: "Pintura al Óleo", en: "Oil Painting", value: "Classic Oil Painting, textured heavy brushstrokes, Rembrandt lighting" },
  { es: "Acuarela", en: "Watercolor", value: "Soft watercolor painting, bleeding colors, artistic paper texture" },
  { es: "Synthwave / Retrowave", en: "Synthwave", value: "80s Synthwave aesthetic, wireframe grids, neon purple and blue, VHS effect" },
  { es: "Ukiyo-e (Japonés)", en: "Ukiyo-e", value: "Traditional Japanese Ukiyo-e woodblock print style" },
  { es: "Steampunk", en: "Steampunk", value: "Steampunk aesthetic, brass, gears, steam, victorian sci-fi" },
  { es: "Noir / Blanco y Negro", en: "Noir", value: "Film Noir, high contrast black and white, dramatic shadows" },
  { es: "Pixel Art", en: "Pixel Art", value: "High quality 16-bit pixel art, sprite style" },
  { es: "Graffiti", en: "Graffiti", value: "Street art graffiti style, vibrant spray paint" }
];

// --- COMPOSITION ---
export const FRAMINGS = [
  { es: "Rostro (Primer Plano)", en: "Face Close-Up", value: "Extreme close-up on face" },
  { es: "Busto", en: "Bust Shot", value: "Portrait bust shot shoulders up" },
  { es: "Medio Cuerpo", en: "Waist Up", value: "Medium shot from waist up" },
  { es: "Plano Americano", en: "Cowboy Shot", value: "Cowboy shot from knees up" },
  { es: "Cuerpo Entero", en: "Full Body", value: "Full body shot showing shoes to head" },
  { es: "Paisaje / Lejos", en: "Wide Shot", value: "Wide cinematic shot showing environment" },
  { es: "Desde Arriba", en: "High Angle", value: "High angle shot looking down" },
  { es: "Desde Abajo", en: "Low Angle", value: "Low angle shot looking up" },
  { es: "Ojo de Pez", en: "Fisheye", value: "Distorted fisheye lens effect" },
  { es: "Selfie", en: "Selfie", value: "Selfie angle holding camera" }
];

export const LIGHTINGS = [
  { es: "Dramática", en: "Dramatic", value: "Dramatic cinematic lighting, chiaroscuro" },
  { es: "Neón", en: "Neon", value: "Colorful neon lighting" },
  { es: "Natural (Día)", en: "Natural", value: "Natural daylight" },
  { es: "Atardecer", en: "Sunset", value: "Golden hour warm sunlight" },
  { es: "Estudio", en: "Studio", value: "Professional studio lighting" },
  { es: "Oscura", en: "Dark", value: "Dark moody lighting, shadows" },
  { es: "Mágica", en: "Magical", value: "Magical glowing particles lighting" },
  { es: "Volumétrica", en: "Volumetric", value: "God rays, volumetric fog lighting" },
  { es: "Bioluminiscencia", en: "Bioluminescent", value: "Glowing bioluminescent flora lighting" },
  { es: "Luz de Velas", en: "Candlelight", value: "Warm flickering candlelight" }
];

export const ATMOSPHERES = [
  { es: "Limpia", en: "Clean", value: "Clean atmosphere" },
  { es: "Niebla", en: "Foggy", value: "Thick fog, misty atmosphere" },
  { es: "Lluvia", en: "Rain", value: "Heavy rain, wet surfaces" },
  { es: "Nieve", en: "Snow", value: "Falling snow" },
  { es: "Polvo/Arena", en: "Dusty", value: "Dust particles in air" },
  { es: "Fuego/Brasas", en: "Fire", value: "Floating fire embers and sparks" },
  { es: "Glitch Digital", en: "Glitch", value: "Digital glitch artifacts" },
  { es: "Etérea", en: "Ethereal", value: "Dreamy ethereal atmosphere" },
  { es: "Tóxica", en: "Toxic", value: "Green toxic fumes" },
  { es: "Tormenta", en: "Stormy", value: "Lightning storm background" }
];

export const SETTINGS = [
  { es: "Contextual (Según Rol)", en: "Contextual", value: "In a setting appropriate for their profession/role" },
  { es: "Ciudad Futurista", en: "Future City", value: "Futuristic Neon City" },
  { es: "Naturaleza / Bosque", en: "Nature", value: "Deep Forest nature" },
  { es: "Espacio", en: "Space", value: "Sci-Fi Space Station" },
  { es: "Interior Habitación", en: "Indoor", value: "Interior room detail" },
  { es: "Ruinas", en: "Ruins", value: "Ancient Ruins" },
  { es: "Desierto", en: "Desert", value: "Vast Desert" },
  { es: "Montañas", en: "Mountains", value: "Snowy Mountain Peaks" },
  { es: "Cyber Café", en: "Cyber Cafe", value: "Cozy Cyberpunk Cafe" },
  { es: "Biblioteca", en: "Library", value: "Ancient Library" },
  { es: "Fondo Blanco", en: "White BG", value: "Isolated on Solid White background" },
  { es: "Fondo Negro", en: "Black BG", value: "Isolated on Solid Black background" },
  { es: "Estudio", en: "Studio", value: "Simple Studio background" },
  { es: "Taberna", en: "Tavern", value: "Medieval Tavern" },
  { es: "Laboratorio", en: "Lab", value: "High-tech Laboratory" },
  { es: "Mazmorra", en: "Dungeon", value: "Dark stone dungeon" }
];

// Mapped for simpler usage in Quick Mode, keeps compatibility
export const BACKGROUNDS = [
  { es: "Escenario", en: "Scenery", value: "Detailed Environment" },
  { es: "Simple / Desenfocado", en: "Simple", value: "Blurry Bokeh lights background" },
  { es: "Blanco (Recortar)", en: "Solid White", value: "Isolated on Solid White background" },
  { es: "Verde (Chroma)", en: "Green Screen", value: "Solid Green Screen background" },
  { es: "Degradado", en: "Gradient", value: "Abstract gradient background" }
];

export const ASPECT_RATIOS = [
  { label: "Cine (16:9)", value: "--ar 16:9" },
  { label: "Cuadrado (1:1)", value: "--ar 1:1" },
  { label: "Móvil (9:16)", value: "--ar 9:16" },
  { label: "Retrato (4:5)", value: "--ar 4:5" },
  { label: "TV (4:3)", value: "--ar 4:3" },
  { label: "Panorámico (21:9)", value: "--ar 21:9" }
];

// --- ELITE PRESETS (CURATED CHARACTERS) ---
export const PRESETS = [
  {
    name: "CYBER RONIN 2077",
    params: {
      race: "Human", gender: "Female", age: "Young Adult", role: "Warrior", subRole: "Cyber-Samurai", skinTone: "Pale skin", classCategory: 'fantasy',
      bodyType: "Athletic build", style: "Cyberpunk 2077 art style, hyper-realistic, neon lights, gritty future",
      setting: "Futuristic Neon City", background: "Detailed Environment",
      emotion: "Determined look", pose: "Dynamic battle stance ready to fight",
      framing: "Full body shot showing shoes to head", lighting: "Neon Lighting", atmosphere: "Rainy",
      colors: ["#00ffff", "#ff00ff"], details: "Wearing a transparent raincoat over cybernetic armor, holding a glowing katana",
      aspectRatio: "--ar 16:9",
      hairStyle: "Bob Cut", hairColors: ["#ff00ff"], eyeFeature: "Cybernetic", eyeColors: ["#00ffff"],
      headwear: "None", upperBody: "Leather Jacket", lowerBody: "Leggings", footwear: "Sneakers", heldItem: "Katana", outfitColors: ["#000000", "#FFFF00"]
    }
  },
  {
    name: "GOTHIC VAMPIRE",
    params: {
      race: "Vampire", gender: "Male", age: "Ancient", role: "Necromancer", subRole: "Aristocrat", skinTone: "Pale skin", classCategory: 'fantasy',
      bodyType: "Slender build", style: "Gothic Horror, Edgar Allan Poe vibe, dark victorian, melancholic, mist, high contrast",
      setting: "Ruins", background: "Detailed Environment",
      emotion: "Seductive gaze", pose: "Sitting naturally",
      framing: "Cowboy Shot", lighting: "Dramatic", atmosphere: "Foggy",
      colors: ["#8b0000", "#000000"], details: "Holding a glass of blood wine, bats flying in background",
      aspectRatio: "--ar 4:5",
      hairStyle: "Long Straight", hairColors: ["#ffffff"], eyeFeature: "Red", eyeColors: ["#ff0000"],
      headwear: "None", fullBody: "Trench Coat", footwear: "Dress Shoes", heldItem: "Drink", outfitColors: ["#000000", "#8b0000"]
    }
  },
  {
    name: "ARCANE BRAWLER",
    params: {
      race: "Human", gender: "Female", age: "Adult", role: "Warrior", subRole: "Street Fighter", skinTone: "Tan skin", classCategory: 'fantasy',
      bodyType: "Muscular", style: "Arcane TV Show style, painterly 3D texture, Fortiche production artstyle",
      setting: "Indoor", background: "Detailed Environment",
      emotion: "Furious angry expression", pose: "Combat",
      framing: "Waist Up", lighting: "Volumetric", atmosphere: "Dusty",
      colors: ["#ff4500", "#1a1a1a"], details: "Neon tattoos glowing, hextech gauntlets",
      aspectRatio: "--ar 16:9",
      hairStyle: "Mohawk", hairColors: ["#ff4500"], eyeFeature: "Glowing", eyeColors: ["#00ff00"],
      headwear: "Goggles", upperBody: "Shirtless/Top", lowerBody: "Cargo Pants", footwear: "Combat Boots", heldItem: "Nothing", outfitColors: ["#333333", "#ff4500"]
    }
  }
];

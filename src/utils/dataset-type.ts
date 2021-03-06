// DON'T EDIT IT UNLESS YOUR VERSION OF DATASET IS DIFFERENT
// The json format of dataset-text
export type DataSetFormat = {
  version: string;
  unavailableSvts: Array<number>;
  servants: { [sNo: string]: ServantFormat; };
  costumes: object;
  crafts: object;
  cmdCodes: object;
  events: object;
  items: { [name: string]: ItemsFormat; };
  icons: { [name: string]: null; };
  freeQuests: { [name: string]: FreeQuestFormat; };
  svtQuests: object;
  glpk: GlpkFormat;
  mysticCodes: object;
  summons: object;
  fsmSvtIdMapping: object;
};

export type ServantFormat = {
  "no": number;
  "svtId": number;
  "mcLink": string;
  "icon": string;
  "info": {
    "gameId": number;
    "name": string;
    "nameJp": string;
    "nameEn": string;
    "namesOther": string[];
    "namesJpOther": string[];
    "namesEnOther": string[];
    "nicknames": string[];
    "obtain": string;
    "obtains": string[];
    "rarity": number;
    "rarity2": number;
    "weight": string;
    "height": string;
    "gender": string;
    "illustrator": string;
    "illustratorJp": string | null;
    "illustratorEn": string | null;
    "className": ServantClass;
    "attribute": string;
    "isHumanoid": boolean;
    "isWeakToEA": boolean;
    "isTDNS": boolean;
    "cv": string[];
    "cvEn": string[];
    "alignments": string[];
    "traits": string[];
    "ability": {
      "strength": string;
      "endurance": string;
      "agility": string;
      "mana": string;
      "luck": string;
      "np": string;
    };
    "illustrations": string[];
    "cards": string[];
    "cardHits": {
      "Quick": number;
      "Arts": number;
      "Buster": number;
      "Extra": number;
      "NP": number;
    };
    "cardHitsDamage": {
      "Quick": number[];
      "Arts": number[];
      "Buster": number[];
      "Extra": number[];
      "NP": [];
    };
    "npRate": {
      "Quick": string;
      "Arts": string;
      "Buster": string;
      "Extra": string;
      "NP": string;
      "Defense": string;
    };
    "atkMin": number;
    "hpMin": number;
    "atkMax": number;
    "hpMax": number;
    "atk90": number;
    "hp90": number;
    "atk100": number;
    "hp100": number;
    "starRate": string;
    "deathRate": string;
    "criticalRate": string;
  };
  "noblePhantasm": NoblePhantasmFormat[];
  "noblePhantasmEn": NoblePhantasmFormat[];
  "activeSkills": {
    "cnState": number;
    "skills": SkillDetailFormat[]; // ????????????
  }[]; // length = 3
  "activeSkillsEn": {
    "cnState": number;
    "skills": SkillDetailFormat[]; // ????????????
  }[]; // length = 3
  "passiveSkills": {
    "openCondition": string | null;
    "name": string;
    "nameEn": string | null;
    "rank": string;
    "icon": string;
    "effects": {
      "description": string;
      "descriptionJp": string | null;
      "descriptionEn": string | null;
      "lvData": string[]; // length = 10
    }[];
  }[];
  "passiveSkillsEn": SkillDetailFormat[];
  "appendSkills": SkillDetailFormat[];
  "coinSummonNum": number;
  "itemCost": ItemCostFormat;
  "costumeNos": number[];
  "bondPoints": [];
  "profiles": {
    "title": string;
    "description": string;
    "descriptionJp": string;
    "descriptionEn": string;
    "condition": string | null;
    "conditionEn": string | null;
  }[];
  "voices": {
    "section": "??????";
    "table": {
      "title": string;
      "text": string;
      "textJp": string;
      "textEn": string;
      "condition": string;
      "voiceFile": string;
    }[];
  }[];
  "bondCraft": number;
  "valentineCraft": any[];
  "icons": {
    "key": string;
    "valueList": string[];
  }[];
  "sprites": {
    "key": string;
    "valueList": string[];
  }[];
  "fandomIcons": { [key: string]: string; };
  "fandomSprites": { [key: string]: string; };
};
export type ServantClass = 'Shielder' | 'Saber' | 'Archer' | 'Lancer' | 'Rider' | 'Caster' | 'Assassin' | 'Berserker' | 'Ruler' | 'Avenger' | 'MoonCancer' | 'Alterego' | 'Foreigner' | 'Pretender' | 'Beast';
export type FreeQuestFormat = {
  "chapter": string;
  "name": string;
  "nameJp": string;
  "nameEn": string;
  "indexKey": string;
  "level": number;
  "bondPoint": number;
  "experience": number;
  "qp": number;
  "isFree": boolean;
  "hasChoice": boolean;
  "battles": {
    "ap": number;
    "place": string;
    "placeJp": string;
    "placeEn": string;
    "enemies": {
      "name": string[];
      "shownName": string[];
      "className": string[];
      "rank": number[];
      "hp": number[];
    }[][];
    "drops": { [itemName: string]: number; };
  }[];
  "rewards": { [itemName: string]: number; };
  "enhancement": any | null;
  "conditions": any | null;
};
type NoblePhantasmFormat = {
  "state": string;
  "name": string;
  "nameJp": string;
  "upperName": string;
  "upperNameJp": string;
  "color": PhantasmColor;
  "category": PhantasmCategory;
  "rank": string;
  "typeText": string;
  "effects": {
    "description": string;
    "descriptionJp": string | null;
    "descriptionEn": string | null;
    "lvData": [string, string, string, string, string]; // length = 5
  }[];
};

export type PhantasmColor = 'Quick' | 'Arts' | 'Buster';
export type PhantasmCategory = '??????' | '??????' | '??????';

export type SkillDetailFormat = {
  "state": string;
  "openCondition": string | null;
  "name": string;
  "nameJp": string | null;
  "nameEn": string | null;
  "rank": string;
  "icon": string;
  "cd": number;
  "effects": {
    "description": string;
    "descriptionJp": string | null;
    "descriptionEn": string | null;
    "lvData": string[]; // length = 10
  }[];
};

export type ItemCostFormat = {
  "ascension": { [key: string]: number; }[];
  "skill": { [key: string]: number; }[];
  "appendSkill": { [key: string]: number; }[];
};

export type ItemsFormat = {
  "id": number;
  "itemId": number;
  "name": string;
  "nameJp": string;
  "nameEn": string;
  "category": number;
  "rarity": number;
  "description": string;
  "descriptionJp": string;
};

export type GlpkFormat = {
  'freeCounts': { [key: string]: number; };
  'colNames': string[]; // quest name
  'rowNames': string[]; // Item names
  'costs': number[]; // quest ap cost. ap per quest
  'matrix': number[][]; // quest efficiency cost. unit: ap per item
  'weeklyMissionData': object[];
};

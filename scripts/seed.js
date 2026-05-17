import mongoose from "mongoose";
import dotenv from "dotenv";
import Brewer from "../models/Brewers.js";

dotenv.config();

const brewers = [
  { BrewerID: 1,  Name: "Hario V60",             filterType: "paper"  },
  { BrewerID: 2,  Name: "AeroPress",              filterType: "paper"  },
  { BrewerID: 3,  Name: "Chemex",                 filterType: "paper"  },
  { BrewerID: 4,  Name: "French Press",           filterType: "metal"  },
  { BrewerID: 5,  Name: "Moka Pot",               filterType: "N/A"    },
  { BrewerID: 6,  Name: "Vacuum Pot",             filterType: "cloth"  },
  { BrewerID: 7,  Name: "Kalita Wave",            filterType: "paper"  },
  { BrewerID: 8,  Name: "Clever Dripper",         filterType: "paper"  },
  { BrewerID: 9,  Name: "Cold Brew Tower",        filterType: "metal"  },
  { BrewerID: 10, Name: "Espresso Machine",       filterType: "paper"  },
  { BrewerID: 11, Name: "Percolator",             filterType: "metal"  },
  { BrewerID: 12, Name: "Turkish Coffee (Cezve)", filterType: "N/A"    },
  { BrewerID: 13, Name: "Drip Coffee Maker",      filterType: "paper"  },
  { BrewerID: 14, Name: "Vietnamese Phin",        filterType: "metal"  },
  { BrewerID: 15, Name: "Kyoto Cold Drip",        filterType: "paper"  },
  { BrewerID: 16, Name: "Melitta Dripper",        filterType: "paper"  },
  { BrewerID: 17, Name: "Hario Switch",           filterType: "paper"  },
  { BrewerID: 18, Name: "Origami Dripper",        filterType: "paper"  },
  { BrewerID: 19, Name: "Flair Espresso",         filterType: "N/A"    },
  { BrewerID: 20, Name: "Nel Drip",               filterType: "cloth"  },
  { BrewerID: 21, Name: "Ibrik",                  filterType: "N/A"    },
  { BrewerID: 22, Name: "AeroPress Go",           filterType: "paper"  },
  { BrewerID: 23, Name: "Stagg Pour-Over",        filterType: "paper"  },
  { BrewerID: 24, Name: "Walkure Brewer",         filterType: "paper"  },
  { BrewerID: 25, Name: "Cores Gold Filter",      filterType: "metal"  },
];

/**
 * Connects to MongoDB and inserts the 25 preset brewer documents defined above.
 * Each brewer is checked by BrewerID before insertion — existing records are
 * skipped to make the script safe to re-run without creating duplicates.
 * Disconnects from the database and prints a summary when complete.
 */
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  let inserted = 0;
  let skipped = 0;

  for (const data of brewers) {
    const existing = await Brewer.findOne({ BrewerID: data.BrewerID });
    if (existing) {
      console.log(`  Skipped: ${data.Name} (BrewerID ${data.BrewerID} already exists)`);
      skipped++;
      continue;
    }
    await Brewer.create({ ...data, trackedParameters: {} });
    console.log(`  Inserted: ${data.Name}`);
    inserted++;
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

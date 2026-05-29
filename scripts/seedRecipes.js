import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "../models/recipe.js";
import Brewer from "../models/Brewers.js";

dotenv.config();

/**
 * One canonical recipe per catalog brewer (see scripts/seed.js for the brewer
 * list). Parameters are drawn from widely published methods — James Hoffmann,
 * the World AeroPress Championship, George Howell, Nguyen Coffee Supply, etc.
 *
 * Conventions that match the Recipe schema + the in-app brew timer:
 *   - `pours[].at` is a TIME offset in seconds; `pours[].to` is the CUMULATIVE
 *     water weight (g) you should have poured by then. The schema's pre-save
 *     hook requires the LAST pour's `to` to equal `WaterIn`.
 *   - `WaterTemp` is in °C (schema max is 100).
 *   - Espresso-style methods use `WaterIn` as the shot YIELD (so the in-app
 *     ratio reads as the familiar 1:2), and omit `pours` (no staged pours).
 *   - `Recipe.ID` is fixed at 1000 + BrewerID so this script is idempotent and
 *     never collides with user-created recipes (which auto-number up from 1).
 */
const RECIPES = [
  {
    BrewerID: 1,
    Name: "Hoffmann Ultimate V60",
    CoffeeIn: 15, WaterIn: 250, WaterTemp: 95, BrewTime: 180, bloomTime: 45,
    Agitation: "yes",
    RecipeBody:
      "Grind medium-fine. Bloom with 50g, swirl, wait 45s. Pour to 150g by 0:45, " +
      "then to 250g by 1:15. Swirl to settle the bed; drawdown by ~3:00.",
    pours: [
      { at: 0,  to: 50,  type: "bloom", label: "Bloom", note: "50g, then swirl" },
      { at: 45, to: 150, type: "pour",  label: "First pour" },
      { at: 75, to: 250, type: "pour",  label: "Second pour" },
    ],
  },
  {
    BrewerID: 2,
    Name: "Championship AeroPress",
    CoffeeIn: 16, WaterIn: 230, WaterTemp: 85, BrewTime: 120, bloomTime: 30,
    Agitation: "yes",
    RecipeBody:
      "Standard orientation, rinsed paper filter. Grind medium-fine. Add 40g to " +
      "bloom, stir, then fill to 230g. Steep ~1:00, stir, and press gently over ~30s.",
    pours: [
      { at: 0,  to: 40,  type: "bloom",  label: "Bloom", note: "Stir to saturate" },
      { at: 30, to: 230, type: "pour",   label: "Fill" },
      { at: 90, to: 230, type: "plunge", label: "Press", note: "Slow, gentle press" },
    ],
  },
  {
    BrewerID: 3,
    Name: "Classic Chemex",
    CoffeeIn: 30, WaterIn: 500, WaterTemp: 94, BrewTime: 270, bloomTime: 45,
    Agitation: "no",
    RecipeBody:
      "Rinse the bonded filter with hot water and discard. Grind medium-coarse. " +
      "Bloom 60g for 45s, then pour in slow circles to 300g, then to 500g. " +
      "Total brew 3:30–4:30.",
    pours: [
      { at: 0,  to: 60,  type: "bloom", label: "Bloom" },
      { at: 45, to: 300, type: "pour",  label: "First pour" },
      { at: 90, to: 500, type: "pour",  label: "Second pour" },
    ],
  },
  {
    BrewerID: 4,
    Name: "Hoffmann French Press",
    CoffeeIn: 30, WaterIn: 500, WaterTemp: 95, BrewTime: 480,
    Agitation: "yes",
    RecipeBody:
      "Grind medium-coarse. Add all 500g water, steep 4:00. Break the crust and " +
      "stir, skim the foam and floating grounds, then wait ~5 min. Plunge just " +
      "below the surface and pour.",
    pours: [
      { at: 0, to: 500, type: "pour", label: "Add all water", note: "Steep 4 minutes" },
    ],
  },
  {
    BrewerID: 5,
    Name: "Hoffmann Moka Pot",
    CoffeeIn: 20, WaterIn: 250, WaterTemp: 100, BrewTime: 240,
    Agitation: "no",
    RecipeBody:
      "Fill the base with pre-boiled water to just below the valve (~250g). Grind " +
      "medium-fine, fill the basket level (no tamp). Brew on low-medium heat; as " +
      "soon as coffee flows steadily, pull off the heat and cool the base.",
  },
  {
    BrewerID: 6,
    Name: "Balanced Siphon",
    CoffeeIn: 20, WaterIn: 280, WaterTemp: 92, BrewTime: 300,
    Agitation: "yes",
    RecipeBody:
      "Grind medium. Once water rises to the top chamber, add coffee and stir to " +
      "saturate. Steep 60–90s, stirring once at ~45s. Cut the heat and let it draw " +
      "back down through the cloth filter.",
  },
  {
    BrewerID: 7,
    Name: "Kalita Wave 1:16",
    CoffeeIn: 20, WaterIn: 320, WaterTemp: 94, BrewTime: 210, bloomTime: 30,
    Agitation: "no",
    RecipeBody:
      "Grind medium. Bloom 50g for 30s. Pour in stages keeping the flat bed level: " +
      "to 150g, to 250g, then to 320g. Target a 3:00–3:45 finish.",
    pours: [
      { at: 0,   to: 50,  type: "bloom", label: "Bloom" },
      { at: 30,  to: 150, type: "pour",  label: "Pour 1" },
      { at: 90,  to: 250, type: "pour",  label: "Pour 2" },
      { at: 150, to: 320, type: "pour",  label: "Pour 3" },
    ],
  },
  {
    BrewerID: 8,
    Name: "Clever Steep & Release",
    CoffeeIn: 18, WaterIn: 300, WaterTemp: 94, BrewTime: 240, bloomTime: 45,
    Agitation: "yes",
    RecipeBody:
      "Closed valve. Grind medium. Add all 300g water, give a gentle stir, and " +
      "steep ~3:00. Place the dripper on your cup to open the valve and release; " +
      "drains in ~1:00.",
    pours: [
      { at: 0, to: 300, type: "pour", label: "Add all water", note: "Stir, steep 3:00" },
    ],
  },
  {
    BrewerID: 9,
    Name: "Slow Drip Cold Brew Tower",
    CoffeeIn: 60, WaterIn: 600, WaterTemp: 5, BrewTime: 12600,
    Agitation: "no",
    RecipeBody:
      "Tower/Kyoto-style slow drip with ice water (1:10). Grind medium-coarse. " +
      "Set the drip rate to roughly 1 drop per second so 600g passes over ~3.5 " +
      "hours. Serve over ice or dilute to taste.",
  },
  {
    BrewerID: 10,
    Name: "Classic Double Espresso",
    CoffeeIn: 18, WaterIn: 36, WaterTemp: 93, BrewTime: 28,
    Agitation: "no",
    RecipeBody:
      "18g in, 36g out (1:2) in 25–30s at ~9 bar. Grind fine, distribute and tamp " +
      "level. Pull sour? grind finer. Bitter or harsh? grind coarser or shorten " +
      "the shot.",
  },
  {
    BrewerID: 11,
    Name: "Stovetop Percolator",
    CoffeeIn: 45, WaterIn: 750, WaterTemp: 96, BrewTime: 420,
    Agitation: "no",
    RecipeBody:
      "Grind coarse (fine grounds slip through the basket). Fill with hot water, " +
      "assemble, and percolate over medium heat for 7–8 min once it starts " +
      "burbling. Pull early to avoid over-extraction.",
  },
  {
    BrewerID: 12,
    Name: "Traditional Turkish Coffee",
    CoffeeIn: 8, WaterIn: 80, WaterTemp: 70, BrewTime: 180,
    Agitation: "yes",
    RecipeBody:
      "Grind to a flour-fine powder (1:10). Combine cold water, coffee, and " +
      "optional sugar in the cezve and stir. Heat slowly over low heat; as foam " +
      "rises, pull off before it boils. Let grounds settle before sipping.",
  },
  {
    BrewerID: 13,
    Name: "Golden Cup Batch Drip",
    CoffeeIn: 60, WaterIn: 1000, WaterTemp: 94, BrewTime: 360,
    Agitation: "no",
    RecipeBody:
      "SCA 'golden cup' ratio of 60g coffee per litre. Grind medium. Use a flat or " +
      "cone basket with a rinsed paper filter and let the machine run its full " +
      "~6 min cycle. Stir the carafe before serving.",
  },
  {
    BrewerID: 14,
    Name: "Traditional Cà Phê Phin",
    CoffeeIn: 16, WaterIn: 120, WaterTemp: 92, BrewTime: 270, bloomTime: 35,
    Agitation: "no",
    RecipeBody:
      "Dark-roast robusta, medium-coarse grind. Bloom with 25g for ~35s, then fill " +
      "to 120g and set the gravity press. Slow drip over ~3–4 min; serve over " +
      "condensed milk and ice for cà phê sữa đá.",
    pours: [
      { at: 0,  to: 25,  type: "bloom", label: "Bloom" },
      { at: 40, to: 120, type: "pour",  label: "Fill" },
    ],
  },
  {
    BrewerID: 15,
    Name: "Kyoto Cold Drip",
    CoffeeIn: 60, WaterIn: 600, WaterTemp: 5, BrewTime: 10800,
    Agitation: "no",
    RecipeBody:
      "Cold tower drip (1:10) with ice water. Grind medium and pre-wet the bed. " +
      "Dial the valve to ~40–50 drops/min so the full 600g drips through over " +
      "~3 hours for a clean, syrupy cup.",
  },
  {
    BrewerID: 16,
    Name: "Classic Melitta Pour-Over",
    CoffeeIn: 18, WaterIn: 300, WaterTemp: 93, BrewTime: 210, bloomTime: 30,
    Agitation: "no",
    RecipeBody:
      "Rinse the wedge filter. Grind medium. Bloom 50g for 30s, then pour steadily " +
      "to 180g and finally to 300g, keeping the cone topped up. Finish ~3:00.",
    pours: [
      { at: 0,  to: 50,  type: "bloom", label: "Bloom" },
      { at: 30, to: 180, type: "pour",  label: "First pour" },
      { at: 90, to: 300, type: "pour",  label: "Second pour" },
    ],
  },
  {
    BrewerID: 17,
    Name: "Hoffmann Switch Hybrid",
    CoffeeIn: 16, WaterIn: 260, WaterTemp: 95, BrewTime: 195, bloomTime: 45,
    Agitation: "yes",
    RecipeBody:
      "Hario Switch, rinsed paper filter. Open the valve and bloom 45g (percolation " +
      "phase). Close the valve, pour to 150g then to 260g and steep as immersion " +
      "until ~1:45–2:15. Open the valve to drain.",
    pours: [
      { at: 0,   to: 45,  type: "bloom", label: "Bloom (open valve)" },
      { at: 45,  to: 150, type: "pour",  label: "Fill 1 (close valve)" },
      { at: 120, to: 260, type: "pour",  label: "Fill 2" },
    ],
  },
  {
    BrewerID: 18,
    Name: "Origami Clarity Pour-Over",
    CoffeeIn: 15, WaterIn: 250, WaterTemp: 94, BrewTime: 180, bloomTime: 40,
    Agitation: "yes",
    RecipeBody:
      "Use a V60-style cone filter. Grind medium-fine. Bloom 45g for 40s, then pour " +
      "to 150g and to 250g. Swirl gently; the ribbed cone gives a fast, clean " +
      "drawdown around 2:45–3:00.",
    pours: [
      { at: 0,  to: 45,  type: "bloom", label: "Bloom" },
      { at: 40, to: 150, type: "pour",  label: "First pour" },
      { at: 80, to: 250, type: "pour",  label: "Second pour" },
    ],
  },
  {
    BrewerID: 19,
    Name: "Flair Manual Espresso",
    CoffeeIn: 18, WaterIn: 40, WaterTemp: 93, BrewTime: 40,
    Agitation: "no",
    RecipeBody:
      "Grind fine, distribute and tamp. Preheat the cylinder with hot water. Pre-" +
      "infuse at low pressure ~10s, then ramp to ~9 bar and pull 18g→40g over " +
      "~30s. Watch the gauge and keep pressure steady.",
  },
  {
    BrewerID: 20,
    Name: "Nel Drip Rich & Smooth",
    CoffeeIn: 25, WaterIn: 250, WaterTemp: 83, BrewTime: 210, bloomTime: 45,
    Agitation: "no",
    RecipeBody:
      "Flannel (nel) filter, wetted and wrung out. Higher dose, lower temp for a " +
      "rich body (1:10). Grind medium-fine. Bloom 40g for 45s, then pour very " +
      "slowly to 150g and to 250g for a thick, smooth cup.",
    pours: [
      { at: 0,   to: 40,  type: "bloom", label: "Bloom" },
      { at: 45,  to: 150, type: "pour",  label: "Slow pour 1" },
      { at: 120, to: 250, type: "pour",  label: "Slow pour 2" },
    ],
  },
  {
    BrewerID: 21,
    Name: "Traditional Ibrik Coffee",
    CoffeeIn: 8, WaterIn: 80, WaterTemp: 70, BrewTime: 180,
    Agitation: "yes",
    RecipeBody:
      "Powder-fine grind (1:10). Stir coffee into cold water in the ibrik with " +
      "optional sugar and cardamom. Heat gently; as the foam climbs, lift off the " +
      "heat, then return briefly. Pour foam-first and let it settle.",
  },
  {
    BrewerID: 22,
    Name: "AeroPress Go Travel Cup",
    CoffeeIn: 15, WaterIn: 220, WaterTemp: 85, BrewTime: 110, bloomTime: 30,
    Agitation: "yes",
    RecipeBody:
      "Compact AeroPress Go, rinsed paper filter. Grind medium-fine. Bloom 40g and " +
      "stir, fill to 220g, steep ~0:45, then press gently over ~30s. Dilute to " +
      "taste if it's strong.",
    pours: [
      { at: 0,  to: 40,  type: "bloom",  label: "Bloom", note: "Stir" },
      { at: 25, to: 220, type: "pour",   label: "Fill" },
      { at: 75, to: 220, type: "plunge", label: "Press" },
    ],
  },
  {
    BrewerID: 23,
    Name: "Stagg Balanced Pour-Over",
    CoffeeIn: 22, WaterIn: 350, WaterTemp: 95, BrewTime: 210, bloomTime: 45,
    Agitation: "no",
    RecipeBody:
      "Fellow Stagg [X]/[XF] dripper, rinsed filter. Grind medium (1:16). Bloom 55g " +
      "for 45s, then pour to 200g and to 350g in steady spirals. Finish around " +
      "3:00–3:30.",
    pours: [
      { at: 0,   to: 55,  type: "bloom", label: "Bloom" },
      { at: 45,  to: 200, type: "pour",  label: "First pour" },
      { at: 120, to: 350, type: "pour",  label: "Second pour" },
    ],
  },
  {
    BrewerID: 24,
    Name: "Walkure Flat-Bottom Brew",
    CoffeeIn: 18, WaterIn: 300, WaterTemp: 94, BrewTime: 210, bloomTime: 30,
    Agitation: "no",
    RecipeBody:
      "Walküre porcelain brewer (no paper). Grind medium. Bloom 50g for 30s through " +
      "the slotted plate, then pour gently to 180g and to 300g. The flat bed yields " +
      "a soft, rounded cup; finish ~3:00.",
    pours: [
      { at: 0,  to: 50,  type: "bloom", label: "Bloom" },
      { at: 30, to: 180, type: "pour",  label: "First pour" },
      { at: 90, to: 300, type: "pour",  label: "Second pour" },
    ],
  },
  {
    BrewerID: 25,
    Name: "Cores Gold Filter Pour-Over",
    CoffeeIn: 20, WaterIn: 320, WaterTemp: 92, BrewTime: 210, bloomTime: 30,
    Agitation: "no",
    RecipeBody:
      "Cores gold metal cone (no paper) for fuller body. Grind medium (slightly " +
      "coarser than paper V60 to limit fines). Bloom 50g for 30s, then pour to 180g " +
      "and to 320g. Finish ~3:00.",
    pours: [
      { at: 0,  to: 50,  type: "bloom", label: "Bloom" },
      { at: 30, to: 180, type: "pour",  label: "First pour" },
      { at: 90, to: 320, type: "pour",  label: "Second pour" },
    ],
  },
];

/**
 * Connects to MongoDB and inserts one default recipe per brewer defined above.
 * Each recipe is keyed to its brewer by numeric BrewerID; the recipe's own ID is
 * 1000 + BrewerID, so existing seed recipes are detected and skipped — the script
 * is safe to re-run. When a brewer has no preferred recipe yet, this also points
 * its `preferences.Recipe` at the seeded recipe. Prints a summary when complete.
 */
async function seedRecipes() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  let inserted = 0;
  let skipped = 0;
  let missing = 0;

  for (const data of RECIPES) {
    const { BrewerID, ...recipeFields } = data;

    const brewer = await Brewer.findOne({ BrewerID });
    if (!brewer) {
      console.log(`  Missing brewer: BrewerID ${BrewerID} not in catalog — skipping "${recipeFields.Name}"`);
      missing++;
      continue;
    }

    const ID = 1000 + BrewerID;
    const existing = await Recipe.findOne({ ID });
    if (existing) {
      console.log(`  Skipped: "${recipeFields.Name}" (recipe ID ${ID} already exists)`);
      skipped++;
      continue;
    }

    const recipe = await Recipe.create({
      ...recipeFields,
      ID,
      Brewer: brewer._id,
    });

    // Give the brewer a sensible default recipe if it doesn't already have one.
    if (!brewer.preferences?.Recipe) {
      await Brewer.updateOne(
        { _id: brewer._id },
        { $set: { "preferences.Recipe": recipe._id } }
      );
    }

    console.log(`  Inserted: "${recipeFields.Name}" → ${brewer.Name}`);
    inserted++;
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped, ${missing} missing brewers.`);
  await mongoose.disconnect();
}

seedRecipes().catch((err) => {
  console.error(err);
  process.exit(1);
});

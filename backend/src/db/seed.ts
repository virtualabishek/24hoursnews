import "dotenv/config";
import { db } from "./index.js";
import { publishers } from "./schema.js";

const publisherData = [
  {
    name: "Ratopati",
    logoUrl:
      "https://play-lh.googleusercontent.com/EK7tpygXYxon7v8hLdOjvfL4M5X7ZeERzoxwHhvF5iQ-Wvo5mCCnrzjeQipm67GGrcM",
  },
  {
    name: "Online Khabar",
    logoUrl:
      "https://play-lh.googleusercontent.com/7fQNxv7HXXzN8SivPrNCxvK6Wii_VcKmvyGUvXDlGumOaBOxeFPOAk1zZ2BrWzW3TQ",
  },
  {
    name: "TechPana",
    logoUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSajaOamjFDRxjfpk1gykdD5Y2UZYsM2Bm_Fg&s",
  },
  {
    name: "BBC Nepali",
    logoUrl:
      "https://yt3.googleusercontent.com/ggl56rqMnWuNC7741kzL6qx_Oyl9gLp3YLWEZQ5Ppqc8wjdX5pDVpYGRq6y85piHuF1pjF8B=s900-c-k-c0x00ffffff-no-rj",
  },
  {
    name: "Setopati",
    logoUrl: "https://www.setopati.com/themes/setopati/images/og-image.jpg",
  },
  {
    name: "Rajdhani Daily",
    logoUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvhMD49lqpkIT_6d-UJ3mqN31wMAoVPjgERw&s",
  },
  {
    name: "Himalayan Times",
    logoUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCnIZ9wYAJ-2ZblcXNiyyZ7zoYSqoJHm4_iw&s",
  },
];

async function main() {
  console.log(`Start seeding ...`);

  for (const p of publisherData) {
    await db
      .insert(publishers)
      .values({ name: p.name, logoUrl: p.logoUrl })
      .onDuplicateKeyUpdate({ set: { logoUrl: p.logoUrl } });
    console.log(`Created or found publisher: ${p.name}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .then(async () => {
    process.exit(0);
  });

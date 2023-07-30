import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

async function main(): Promise<void> {
  const nftSupply = +(process.env.NFT_SUPPLY as string);

  initializeMetadatas(nftSupply);
}

async function initializeMetadatas(supply: number): Promise<void> {
  console.log("supply:", supply);

  for (let i = 0; i < supply; i++) {
    const path = `tokens/candy-machine/assets/${i}.json`;
    const data = {
      name: `Buildoor #${i + 1}`,
      symbol: "BUILDOOR",
      description: "Buildoor",
      image: "0.png",
      attributes: [],
      properties: {
        files: [
          {
            uri: "0.png",
            type: "image/png",
          },
        ],
      },
    };

    console.log("writing file:", i);

    fs.writeFileSync(path, JSON.stringify(data));
  }
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

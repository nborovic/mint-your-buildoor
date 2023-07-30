"use strict";

import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import * as fs from "fs";
import {
  Metaplex,
  bundlrStorage,
  keypairIdentity,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import {
  DataV2,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

import { initializeKeypair } from "./initializeKeypair";
import * as config from "./config.json";

async function main() {
  const connection = new web3.Connection(
    web3.clusterApiUrl(process.env.SOLANA_CLUSTER as web3.Cluster)
  );
  const payer = await initializeKeypair(connection);

  const mintKeypair = web3.Keypair.generate();

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
      bundlrStorage({
        address: process.env.BUNDLR_NETWORK_ADDRESS,
        providerUrl: process.env.BUNDLR_PROVIDER_URL,
        timeout: 60000,
      })
    );

  const [createTokenAccountInstruction, initializeTokenMintInstruction] =
    await createTokenMintInstructions({
      connection,
      payer,
      tokenMint: mintKeypair.publicKey,
    });
  const createTokenMetadataInstrcution = await createTokenMetadataInstruction({
    connection,
    metaplex,
    tokenMint: mintKeypair.publicKey,
    payer,
    name: config.TOKEN_NAME,
    description: config.TOKEN_DESCRIPTION,
    symbol: config.TOKEN_SYMBOL,
    imagePath: config.TOKEN_IMAGE_PATH,
    imageName: config.TOKEN_IMAGE_NAME,
  });

  const instructions = [
    createTokenAccountInstruction,
    initializeTokenMintInstruction,
    createTokenMetadataInstrcution,
  ];

  const transaction = new web3.Transaction().add(...instructions);

  const transactionSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair]
  );

  fs.writeFileSync(
    "tokens/bld/cache.json",
    JSON.stringify({
      mint: mintKeypair.publicKey.toBase58(),
      metadataTransaction: transactionSignature,
    })
  );
}

interface CreateTokenMintInstructionsParams {
  connection: web3.Connection;
  payer: web3.Keypair;
  tokenMint: web3.PublicKey;
}

async function createTokenMintInstructions({
  connection,
  payer,
  tokenMint,
}: CreateTokenMintInstructionsParams): Promise<web3.TransactionInstruction[]> {
  const lamports = await token.getMinimumBalanceForRentExemptMint(connection);

  const programId = token.TOKEN_PROGRAM_ID;

  const createTokenAccountInstruction = web3.SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: tokenMint,
    space: token.MINT_SIZE,
    lamports,
    programId,
  });

  const initializeTokenMintInstruction = token.createInitializeMint2Instruction(
    tokenMint,
    2,
    payer.publicKey,
    payer.publicKey,
    programId
  );

  return [createTokenAccountInstruction, initializeTokenMintInstruction];
}

interface CreateTokenMetadataInstructionParams {
  connection: web3.Connection;
  metaplex: Metaplex;
  tokenMint: web3.PublicKey;
  payer: web3.Keypair;
  name: string;
  description: string;
  symbol: string;
  imagePath: string;
  imageName: string;
}

async function createTokenMetadataInstruction({
  connection,
  metaplex,
  tokenMint,
  payer,
  name,
  description,
  symbol,
  imagePath,
  imageName,
}: CreateTokenMetadataInstructionParams): Promise<web3.TransactionInstruction> {
  const imageBuffer = fs.readFileSync(imagePath);

  const imageMetaplexFile = toMetaplexFile(imageBuffer, imageName);

  const imageBundlrUri = await metaplex.storage().upload(imageMetaplexFile);

  const { uri: metadataBundlrUri } = await metaplex.nfts().uploadMetadata({
    name,
    description,
    image: imageBundlrUri,
  });

  const metadataPda = metaplex.nfts().pdas().metadata({ mint: tokenMint });

  const tokenMetadata = {
    name,
    symbol,
    uri: metadataBundlrUri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  const instruction = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPda,
      mint: tokenMint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: tokenMetadata,
        isMutable: true,
        collectionDetails: null,
      },
    }
  );

  return instruction;
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

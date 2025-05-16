import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DscSystem } from "../target/types/dsc_system";
import { PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo, getAccount } from "@solana/spl-token";
import { assert } from "chai";

describe("dsc-system", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.DscSystem as Program<DscSystem>;
  const wallet = provider.wallet as anchor.Wallet;

  // Token mints (devnet addresses)
  const wbtcMint = new PublicKey("3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh"); // WBTC devnet
  const wethMint = new PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"); // WETH devnet
  const solMint = SystemProgram.programId; // SOL (System Program)

  // Pyth price feeds (devnet, simplified for testing)
  const wbtcPriceFeed = new PublicKey("4PNO84jW4VWG4rYc8cTAYC7xM2vXUoAWib2M8Z8V3Gwv"); // WBTC/USD devnet
  const wethPriceFeed = new PublicKey("4XwmN1v88W3HLjV2z3SwumTKtsEcUdSwm2Y2h7rCNdwn"); // WETH/USD devnet
  const solPriceFeed = new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"); // SOL/USD devnet

  let dscMint: PublicKey;
  let dscState: PublicKey;
  let userPosition: PublicKey;
  let vaultWbtc: PublicKey;
  let vaultWeth: PublicKey;
  let solVault: PublicKey;
  let userWbtcAccount: PublicKey;
  let userWethAccount: PublicKey;
  let userDscAccount: PublicKey;

  before(async () => {
    // Create DSC mint
    dscMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      9 // 9 decimals for DSC
    );

    // Derive PDAs
    [dscState] = PublicKey.findProgramAddressSync(
      [Buffer.from("dsc_state")],
      program.programId
    );
    [userPosition] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_position"), wallet.publicKey.toBuffer()],
      program.programId
    );
    [vaultWbtc] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), wbtcMint.toBuffer()],
      program.programId
    );
    [vaultWeth] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), wethMint.toBuffer()],
      program.programId
    );
    [solVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("sol_vault")],
      program.programId
    );

    // Create user token accounts
    userWbtcAccount = await createAccount(
      provider.connection,
      wallet.payer,
      wbtcMint,
      wallet.publicKey
    );
    userWethAccount = await createAccount(
      provider.connection,
      wallet.payer,
      wethMint,
      wallet.publicKey
    );
    userDscAccount = await createAccount(
      provider.connection,
      wallet.payer,
      dscMint,
      wallet.publicKey
    );

    // Mint some WBTC and WETH to user (for testing)
    await mintTo(
      provider.connection,
      wallet.payer,
      wbtcMint,
      userWbtcAccount,
      wallet.payer,
      100_000_000 // 1 WBTC (8 decimals)
    );
    await mintTo(
      provider.connection,
      wallet.payer,
      wethMint,
      userWethAccount,
      wallet.payer,
      1_000_000_000 // 1 WETH (9 decimals)
    );
  });

  it("Initializes the DSC system", async () => {
    await program.methods
      .initialize(
        [wbtcMint, wethMint, solMint], // WBTC, WETH, SOL mint addresses
        [wbtcPriceFeed, wethPriceFeed, solPriceFeed] // Corresponding price feeds
      )
      .accounts({
        dscState,
        dscMint,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.dscState.fetch(dscState);
    assert.equal(state.collateralTokens.length, 3);
    assert.equal(state.collateralTokens[0].toString(), wbtcMint.toString());
    assert.equal(state.collateralTokens[1].toString(), wethMint.toString());
    assert.equal(state.collateralTokens[2].toString(), solMint.toString());
  });

  it("Deposits WBTC collateral", async () => {
    const amount = 50_000_000; // 0.5 WBTC
    await program.methods
      .depositCollateral(new anchor.BN(amount))
      .accounts({
        dscState,
        userPosition,
        user: wallet.publicKey,
        collateralMint: wbtcMint,
        userTokenAccount: userWbtcAccount,
        vaultTokenAccount: vaultWbtc,
        solVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const position = await program.account.userPosition.fetch(userPosition);
    assert.equal(position.collateral[0].amount.toNumber(), amount);
    assert.equal(position.collateral[0].token.toString(), wbtcMint.toString());
  });
});
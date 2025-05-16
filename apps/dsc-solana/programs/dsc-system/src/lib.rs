use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use pyth_sdk_solana::PriceAccount;
use solana_program::system_instruction;

// Placeholder program ID, updated after deployment
declare_id!("11111111111111111111111111111111");

// Constants for precision and liquidation
const ADDITIONAL_FEED_PRECISION: u64 = 1_000_000_000; // 1e10
const PRECISION: u64 = 1_000_000_000_000_000_000; // 1e18
const LIQUIDATION_THRESHOLD: u64 = 50; // 50%
const LIQUIDATION_PRECISION: u64 = 100;
const MIN_HEALTH_FACTOR: u64 = 1_000_000_000_000_000_000; // 1.0 in 1e18
const LIQUIDATION_BONUS: u64 = 10; // 10%

#[error_code]
pub enum DscError {
    #[msg("Amount must be greater than zero")]
    NeedMoreThanZero,
    #[msg("Token addresses and price feed addresses must have the same length")]
    TokenAndPriceFeedLengthMismatch,
    #[msg("Token not allowed as collateral")]
    NotAllowedToken,
    #[msg("Transfer failed")]
    TransferFailed,
    #[msg("Health factor is broken")]
    BreaksHealthFactor,
    #[msg("Mint failed")]
    MintFailed,
    #[msg("Health factor is sufficient")]
    HealthFactorOk,
    #[msg("Health factor not improved after liquidation")]
    HealthFactorNotImproved,
}

#[event]
pub struct CollateralDeposited {
    pub user: Pubkey,
    pub token: Pubkey,
    pub amount: u64,
}

#[event]
pub struct CollateralRedeemed {
    pub from: Pubkey,
    pub to: Pubkey,
    pub token: Pubkey,
    pub amount: Convenience store
}

#[account]
pub struct DscState {
    // Stores allowed collateral token mint addresses (WBTC, WETH, SOL)
    pub collateral_tokens: Vec<Pubkey>,
    // Corresponding Pyth price feeds for each token
    pub price_feeds: Vec<Pubkey>,
    pub dsc_mint: Pubkey, // DSC token mint
}

#[account]
pub struct UserPosition {
    pub user: Pubkey,
    pub dsc_minted: u64,
    pub collateral: Vec<Collateral>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Collateral {
    // Token mint address (WBTC, WETH, or System Program for SOL)
    pub token: Pubkey,
    pub amount: u64,
}

#[program]
pub mod dsc_system {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        collateral_tokens: Vec<Pubkey>,
        price_feeds: Vec<Pubkey>,
    ) -> Result<()> {
        // WBTC and WETH addresses are passed here in collateral_tokens
        require!(
            collateral_tokens.len() == price_feeds.len(),
            DscError::TokenAndPriceFeedLengthMismatch
        );

        let dsc_state = &mut ctx.accounts.dsc_state;
        dsc_state.collateral_tokens = collateral_tokens; // Stores WBTC, WETH, SOL mints
        dsc_state.price_feeds = price_feeds;
        dsc_state.dsc_mint = ctx.accounts.dsc_mint.key();

        Ok(())
    }

    pub fn deposit_collateral(ctx: Context<DepositCollateral>, amount: u64) -> Result<()> {
        require!(amount > 0, DscError::NeedMoreThanZero);

        let dsc_state = &ctx.accounts.dsc_state;
        let token = ctx.accounts.collateral_mint.key();
        // Checks if token (e.g., WBTC, WETH) is in collateral_tokens
        require!(
            dsc_state.collateral_tokens.contains(&token),
            DscError::NotAllowedToken
        );

        let user_position = &mut ctx.accounts.user_position;
        if user_position.user == Pubkey::default() {
            user_position.user = ctx.accounts.user.key();
        }

        // Handle SOL or SPL Token transfer
        if token == anchor_lang::solana_program::system_program::ID {
            let ix = system_instruction::transfer(
                &ctx.accounts.user.key(),
                &ctx.accounts.sol_vault.key(),
                amount,
            );
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.user.to_account_info(),
                    ctx.accounts.sol_vault.to_account_info(),
                ],
            )?;
        } else {
            anchor_spl::token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::Transfer {
                        from: ctx.accounts.user_token_account.to_account_info(),
                        to: ctx.accounts.vault_token_account.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                amount,
            )?;
        }

        // Update user position
        if let Some(collateral) = user_position
            .collateral
            .iter_mut()
            .find(|c| c.token == token)
        {
            collateral.amount = collateral.amount.checked_add(amount).unwrap();
        } else {
            user_position.collateral.push(Collateral { token, amount });
        }

        emit!(CollateralDeposited {
            user: ctx.accounts.user.key(),
            token,
            amount,
        });

        let health_factor = calculate_health_factor(
            &ctx.accounts,
            user_position.dsc_minted,
            &user_position.collateral,
        )?;
        require!(
            health_factor >= MIN_HEALTH_FACTOR,
            DscError::BreaksHealthFactor
        );

        Ok(())
    }

    pub fn mint_dsc(ctx: Context<MintDsc>, amount: u64) -> Result<()> {
        require!(amount > 0, DscError::NeedMoreThanZero);

        let user_position = &mut ctx.accounts.user_position;
        user_position.dsc_minted = user_position.dsc_minted.checked_add(amount).unwrap();

        let health_factor = calculate_health_factor(
            &ctx.accounts,
            user_position.dsc_minted,
            &user_position.collateral,
        )?;
        require!(
            health_factor >= MIN_HEALTH_FACTOR,
            DscError::BreaksHealthFactor
        );

        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.dsc_mint.to_account_info(),
                    to: ctx.accounts.user_dsc_account.to_account_info(),
                    authority: ctx.accounts.dsc_mint.to_account_info(),
                },
                &[&[b"dsc_mint", &[ctx.bumps.dsc_mint]]],
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn redeem_collateral(ctx: Context<RedeemCollateral>, amount: u64) -> Result<()> {
        require!(amount > 0, DscError::NeedMoreThanZero);

        let user_position = &mut ctx.accounts.user_position;
        let token = ctx.accounts.collateral_mint.key();

        let collateral = user_position
            .collateral
            .iter_mut()
            .find(|c| c.token == token)
            .ok_or(DscError::NotAllowedToken)?;
        collateral.amount = collateral
            .amount
            .checked_sub(amount)
            .ok_or(DscError::NeedMoreThanZero)?;

        if token == anchor_lang::solana_program::system_program::ID {
            let ix = system_instruction::transfer(
                &ctx.accounts.sol_vault.key(),
                &ctx.accounts.user.key(),
                amount,
            );
            anchor_lang::solana_program::program::invoke_signed(
                &ix,
                &[
                    ctx.accounts.sol_vault.to_account_info(),
                    ctx.accounts.user.to_account_info(),
                ],
                &[&[b"sol_vault", &[ctx.bumps.sol_vault]]],
            )?;
        } else {
            anchor_spl::token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::Transfer {
                        from: ctx.accounts.vault_token_account.to_account_info(),
                        to: ctx.accounts.user_token_account.to_account_info(),
                        authority: ctx.accounts.vault_token_account.to_account_info(),
                    },
                    &[&[b"vault", &token.to_bytes(), &[ctx.bumps.vault_token_account]]],
                ),
                amount,
            )?;
        }

        emit!(CollateralRedeemed {
            from: ctx.accounts.user.key(),
            to: ctx.accounts.user.key(),
            token,
            amount,
        });

        let health_factor = calculate_health_factor(
            &ctx.accounts,
            user_position.dsc_minted,
            &user_position.collateral,
        )?;
        require!(
            health_factor >= MIN_HEALTH_FACTOR,
            DscError::BreaksHealthFactor
        );

        Ok(())
    }

    pub fn burn_dsc(ctx: Context<BurnDsc>, amount: u64) -> Result<()> {
        require!(amount > 0, DscError::NeedMoreThanZero);

        let user_position = &mut ctx.accounts.user_position;
        user_position.dsc_minted = user_position
            .dsc_minted
            .checked_sub(amount)
            .ok_or(DscError::NeedMoreThanZero)?;

        anchor_spl::token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Burn {
                    mint: ctx.accounts.dsc_mint.to_account_info(),
                    from: ctx.accounts.user_dsc_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn liquidate(
        ctx: Context<Liquidate>,
        debt_to_cover: u64,
        collateral_token: Pubkey,
    ) -> Result<()> {
        require!(debt_to_cover > 0, DscError::NeedMoreThanZero);

        let user_position = &mut ctx.accounts.user_position;
        let starting_health_factor = calculate_health_factor(
            &ctx.accounts,
            user_position.dsc_minted,
            &user_position.collateral,
        )?;
        require!(
            starting_health_factor < MIN_HEALTH_FACTOR,
            DscError::HealthFactorOk
        );

        let collateral_amount = get_token_amount_from_usd(
            &ctx.accounts.dsc_state,
            &ctx.accounts.price_feed,
            collateral_token,
        )?;
        let bonus_collateral = (collateral_amount * LIQUIDATION_BONUS) / LIQUIDATION_PRECISION;
        let total_collateral = collateral_amount
            .checked_add(bonus_collateral)
            .ok_or(DscError::TransferFailed)?;

        let collateral = user_position
            .collateral
            .iter_mut()
            .find(|c| c.token == collateral_token)
            .ok_or(DscError::NotAllowedToken)?;
        collateral.amount = collateral
            .amount
            .checked_sub(total_collateral)
            .ok_or(DscError::NeedMoreThanZero)?;

        if collateral_token == anchor_lang::solana_program::system_program::ID {
            let ix = system_instruction::transfer(
                &ctx.accounts.sol_vault.key(),
                &ctx.accounts.liquidator.key(),
                total_collateral,
            );
            anchor_lang::solana_program::program::invoke_signed(
                &ix,
                &[
                    ctx.accounts.sol_vault.to_account_info(),
                    ctx.accounts.liquidator.to_account_info(),
                ],
                &[&[b"sol_vault", &[ctx.bumps.sol_vault]]],
            )?;
        } else {
            anchor_spl::token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    anchor_spl::token::Transfer {
                        from: ctx.accounts.vault_token_account.to_account_info(),
                        to: ctx.accounts.liquidator_token_account.to_account_info(),
                        authority: ctx.accounts.vault_token_account.to_account_info(),
                    },
                    &[&[
                        b"vault",
                        &collateral_token.to_bytes(),
                        &[ctx.bumps.vault_token_account],
                    ]],
                ),
                total_collateral,
            )?;
        }

        user_position.dsc_minted = user_position
            .dsc_minted
            .checked_sub(debt_to_cover)
            .ok_or(DscError::NeedMoreThanZero)?;
        anchor_spl::token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Burn {
                    mint: ctx.accounts.dsc_mint.to_account_info(),
                    from: ctx.accounts.liquidator_dsc_account.to_account_info(),
                    authority: ctx.accounts.liquidator.to_account_info(),
                },
            ),
            debt_to_cover,
        )?;

        let ending_health_factor = calculate_health_factor(
            &ctx.accounts,
            user_position.dsc_minted,
            &user_position.collateral,
        )?;
        require!(
            ending_health_factor > starting_health_factor,
            DscError::HealthFactorNotImproved
        );

        emit!(CollateralRedeemed {
            from: ctx.accounts.user.key(),
            to: ctx.accounts.liquidator.key(),
            token: collateral_token,
            amount: total_collateral,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 4 + 32 * 10 + 4 + 32 * 10 + 32,
        seeds = [b"dsc_state"],
        bump
    )]
    pub dsc_state: Account<'info, DscState>,
    #[account(mut)]
    pub dsc_mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositCollateral<'info> {
    #[account(mut)]
    pub dsc_state: Account<'info, DscState>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8 + 4 + (32 + 8) * 10,
        seeds = [b"user_position", user.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub collateral_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", collateral_mint.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"sol_vault"],
        bump
    )]
    pub sol_vault: SystemAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintDsc<'info> {
    #[account(mut)]
    pub dsc_state: Account<'info, DscState>,
    #[account(mut)]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"dsc_mint"], bump)]
    pub dsc_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_dsc_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RedeemCollateral<'info> {
    #[account(mut)]
    pub dsc_state: Account<'info, DscState>,
    #[account(mut)]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub collateral_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", collateral_mint.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"sol_vault"],
        bump
    )]
    pub sol_vault: SystemAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BurnDsc<'info> {
    #[account(mut)]
    pub dsc_state: Account<'info, DscState>,
    #[account(mut)]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"dsc_mint"], bump)]
    pub dsc_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_dsc_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub dsc_state: Account<'info, DscState>,
    #[account(mut)]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)]
    pub user: AccountInfo<'info>,
    #[account(mut)]
    pub liquidator: Signer<'info>,
    pub collateral_mint: Account<'info, Mint>,
    #[account(mut)]
    pub liquidator_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"vault", collateral_mint.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"sol_vault"],
        bump
    )]
    pub sol_vault: SystemAccount<'info>,
    #[account(mut)]
    pub liquidator_dsc_account: Account<'info, TokenAccount>,
    #[account(mut, seeds = [b"dsc_mint"], bump)]
    pub dsc_mint: Account<'info, Mint>,
    pub price_feed: Account<'info, PriceAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

fn calculate_health_factor<'info>(
    ctx: &Context<impl anchor_lang::context::CpiContext<'info>>,
    dsc_minted: u64,
    collateral: &[Collateral],
) -> Result<u64> {
    if dsc_minted == 0 {
        return Ok(u64::MAX);
    }

    let mut collateral_value_usd = 0u64;
    for c in collateral {
        // Matches collateral token (e.g., WBTC, WETH) to its price feed
        let price_feed_idx = ctx
            .accounts
            .dsc_state
            .collateral_tokens
            .iter()
            .position(|&t| t == c.token)
            .ok_or(DscError::NotAllowedToken)?;
        let price_feed = ctx.accounts.dsc_state.price_feeds[price_feed_idx];
        let price_account = Account::<PriceAccount>::try_from(&ctx.accounts.remaining_accounts[price_feed_idx])?;
        let price = price_account.price as u64;
        let value = (price * ADDITIONAL_FEED_PRECISION * c.amount) / PRECISION;
        collateral_value_usd = collateral_value_usd.checked_add(value).unwrap();
    }

    let adjusted_collateral = (collateral_value_usd * LIQUIDATION_THRESHOLD) / LIQUIDATION_PRECISION;
    Ok((adjusted_collateral * PRECISION) / dsc_minted)
}

fn get_token_amount_from_usd<'info>(
    dsc_state: &Account<'info, DscState>,
    price_feed: &Account<'info, PriceAccount>,
    token: Pubkey,
    usd_amount: u64,
) -> Result<u64> {
    let price_feed_idx = dsc_state
        .collateral_tokens
        .iter()
        .position(|&t| t == token)
        .ok_or(DscError::NotAllowedToken)?;
    let price = price_feed.price as u64;
    Ok((usd_amount * PRECISION) / (price * ADDITIONAL_FEED_PRECISION))
}
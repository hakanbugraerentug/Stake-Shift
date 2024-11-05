use anchor_lang::prelude::*;

declare_id!("77ym1pwWp4aMpBm9U3QQhJT8W3ntY1CSmehGjaBeVddm");

#[program]
pub mod simple_staker {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

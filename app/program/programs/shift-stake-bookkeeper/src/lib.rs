use anchor_lang::prelude::*;
// use anchor_lang::InstructionData;

declare_id!("YrN37FF9AdJZrqxSeWsrLWJ6UEp2ZEZPwqkPcUu3YQY");

#[program]
// Smart contract functions
pub mod shift_stake_bookkeeper {
    use super::*;

    pub fn create_counter(ctx: Context<CreateCounter>) -> Result<()> {
        msg!("Creating a Counter!!");

        // The creation of the counter must be here
        let counter = &mut ctx.accounts.counter;
        counter.authority = ctx.accounts.authority.key();
        counter.count = 0;
        emit!(OnCounterCreated {
            value: counter.count,
            message: "The counter has been created.".to_string()
        });
        msg!("Current count is {}", counter.count);
        msg!("The Admin PubKey is: {} ", counter.authority);

        Ok(())
    }

    pub fn update_counter(ctx: Context<UpdateCounter>) -> Result<()> {
        msg!("Adding 1 to the counter!!");

        // Updating the counter must be here
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        let message = format!("Current count is {}", counter.count);
        emit!(OnCounterChanged {
            value: counter.count,
            message: format!("Current count is {}", counter.count).to_string()
        });
        //msg!("Current count is {}", counter.count);
        msg!("{} remaining to reach 1000 ", 1000 - counter.count);

        Ok(())
    }

    pub fn create_bookkeeper(ctx: Context<InitializeBookkeeper>) -> Result<()> {
        msg!("Initializing Bookkeeper..."); 

        let bookkeeper = &mut ctx.accounts.bookkeeper;
        bookkeeper.authority = *ctx.accounts.authority.key;
        bookkeeper.request_count = 0;
        bookkeeper.requests = Vec::new();

        Ok(())
    }

    pub fn create_request(
        ctx: Context<CreateRequest>,
        move_stake_instruction: MoveStakeInstruction,
    ) -> Result<()> {
        msg!(
            "Received MoveStakeInstruction: {:?}",
            move_stake_instruction
        );
        // let instruction = move_stake_instruction;
        //  ctx.accounts.request.load_mut()?.

        let bookkeeper = &mut ctx.accounts.bookkeeper;
        let request = &mut ctx.accounts.request;
        request.authorized_pubkey = move_stake_instruction.authorized_pubkey;
        request.source_stake_pubkey = move_stake_instruction.source_stake_pubkey;
        request.destination_stake_pubkey = move_stake_instruction.destination_stake_pubkey;
        request.lamports_to_move = move_stake_instruction.lamports_to_move;
        request.timestamp = Clock::get()?.unix_timestamp;

        // //----uncomment
        bookkeeper.requests.push(request.key()); // testcase //ctx.accounts.user.key()
        bookkeeper.request_count += 1;

        let request_added_event = OnRequestAdded {
            message: format!("Request added successfully. ID: {}", bookkeeper.request_count),
            request_pubkey: request.key(),
            request_count: bookkeeper.request_count,
            authorized_pubkey: request.authorized_pubkey,
            source_stake_pubkey: request.source_stake_pubkey,
            destination_stake_pubkey: request.destination_stake_pubkey,
            lamports_to_move: request.lamports_to_move,
            timestamp: request.timestamp,
        };
        emit!(request_added_event);
        println!("{:?}", request_added_event);
        
//         pub message: String,
//     pub request_pubkey: Pubkey,
//     pub request_count: u64,
// }

        Ok(())
    }
}

#[account]
pub struct Bookkeeper {
    pub authority: Pubkey,
    pub requests: Vec<Pubkey>,
    pub request_count: u64,
}
#[derive(Accounts)]
pub struct InitializeBookkeeper<'info> {

    #[account(init, payer = authority, space = 8 + 32 + 8 + 4 + (32 * 200), //500 requests 
    seeds = [b"solana_beach", b"user_4234989"], bump)]  //Clock::get()?.unix_timestamp //&(Clock::get()?.unix_timestamp / 60 * 60) as i64).to_le_bytes()
    pub bookkeeper: Account<'info, Bookkeeper>,

    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

// #[account(zero_copy)]
// #[derive(AnchorSerialize, AnchorDeserialize)]

//#[repr(packed)] //<------------------------------------------
#[account]
pub struct Request {
    pub authorized_pubkey: Pubkey,
    pub source_stake_pubkey: Pubkey,
    pub destination_stake_pubkey: Pubkey,
    pub lamports_to_move: u64,
    pub timestamp: i64,
}

#[derive(Accounts)]
#[instruction(move_stake_instruction: MoveStakeInstruction)]
pub struct CreateRequest<'info> {
    #[account(mut)]
    pub bookkeeper: Account<'info, Bookkeeper>,
    #[account(init, payer = user, space = 8 + 32 + 32 + 32 + 8 + 8)] //Added extra 100 for testing
    pub request: Account<'info, Request>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

//-----------------------------------------------------
// Data validators
#[derive(Accounts)]
pub struct CreateCounter<'info> {
    #[account(
        init,
        seeds = [authority.key().as_ref()],
        bump,
        payer = authority,
        space = 100
    )]
    counter: Account<'info, Counter>,
    system_program: Program<'info, System>,
    #[account(mut)]
    authority: Signer<'info>,
}

// #[account]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
// #[derive(Debug)]
// #[account(zero_copy)]
// #[derive(Debug)]
pub struct MoveStakeInstruction {
    pub source_stake_pubkey: Pubkey,
    pub destination_stake_pubkey: Pubkey,
    pub authorized_pubkey: Pubkey,
    pub lamports_to_move: u64,
}

#[derive(Accounts)]
pub struct UpdateCounter<'info> {
    authority: Signer<'info>,
    #[account(mut, has_one = authority)]
    counter: Account<'info, Counter>,
}

// Data structures
#[account]
pub struct Counter {
    authority: Pubkey,
    count: u64,
}

#[event]
pub struct OnCounterCreated {
    pub value: u64,
    pub message: String,
}

#[event]
pub struct OnCounterChanged {
    pub value: u64,
    pub message: String,
}

#[event]
#[derive(Debug)]
pub struct OnRequestAdded {
    pub message: String,
    pub request_pubkey: Pubkey,
    pub request_count: u64,
    pub authorized_pubkey: Pubkey,
    pub source_stake_pubkey: Pubkey,
    pub destination_stake_pubkey: Pubkey,
    pub lamports_to_move: u64,
    pub timestamp: i64,
}

// request.authorized_pubkey = move_stake_instruction.authorized_pubkey;
//         request.source_stake_pubkey = move_stake_instruction.source_stake_pubkey;
//         request.destination_stake_pubkey = move_stake_instruction.destination_stake_pubkey;
//         request.lamports_to_move = move_stake_instruction.lamports_to_move;
//         request.timestamp = Clock::get()?.unix_timestamp;
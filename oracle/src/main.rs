use solana_client::rpc_client::RpcClient;
use solana_sdk::clock::Slot;
use tokio::time::{sleep, Duration};
use std::time::{SystemTime, UNIX_EPOCH};

const RPC_URL: &str = "http://localhost:8899"; // Solana Mainnet RPC URL
const BEFORE_SLOT: u64 =  75; // 5 minutes == 300 seconds for 0.4 slot time 300/0.4 = 750 slot. 

async fn foo() {
    println!("foo called at {:?}", SystemTime::now());
}

async fn call_foo_at_epoch_end(client: &RpcClient) {
    loop {
        // Fetch epoch and slot information
        let epoch_info = match client.get_epoch_info() {
            Ok(info) => info,
            Err(err) => {
                eprintln!("Error fetching epoch info: {:?}", err);
                sleep(Duration::from_secs(30)).await;
                continue;
            }
        };

        // Current timestamp
        let current_time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

        // Calculate remaining time to epoch end
        println!("epoch info {}: ", epoch_info.epoch);
        println!("slot_index info {}: ", epoch_info.slot_index);
        println!("slots_in_epoch info {}: ", epoch_info.slots_in_epoch);
        println!("absolute_slot info {}: ", epoch_info.absolute_slot);
        println!("block_height info {}: ", epoch_info.block_height);

        let remaning_slot = epoch_info.slots_in_epoch - epoch_info.slot_index;
        if remaning_slot < BEFORE_SLOT {
            //eprintln!("Not enough time left in this epoch to schedule foo.");
            // Call the foo function
            foo().await;
            sleep(Duration::from_secs(30)).await;
        }

        // Sleep until epoch ends before re-fetching data
        sleep(Duration::from_secs(10)).await;
    }
}

#[tokio::main]
async fn main() {
    let rpc_client = RpcClient::new(RPC_URL.to_string());
    call_foo_at_epoch_end(&rpc_client).await;
}

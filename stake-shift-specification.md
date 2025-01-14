# Stake Shift Specification
Stake Shift is a staking protocol on Solana enabling users to conveniently and efficiently move stake between validators.

## Motivation
Native staking users who want to move their stake between validators on a regular basis face two major problems:
- They need to call three different types of instructions: `Split`, `Deactivate`, `DelegateStake`.
- It is not possible to move the stake in one transaction. After the `Deactivate` instruction, they need to wait for the next epoch to send the `DelegateStake` instruction.
- They lose rewards for the epoch they call the `DelegateStake` instruction.

In a given epoch, the stake moves to and from validators, forming a graph:
- In this graph, each validator represents a node with inflows and outflows.
- In Solana terminology, an inflow is an activating stake account and an outflow is a deactivating stake account.
- The difference between inflows and outflows determines the validator's active stake for the next epoch ignoring staking rewards.
- The absolute sum of inflows and outflows is always equal to or greater than the active stake change for a given validator.

In a scenario where many delegators manage their stake through a canonical program, the program can provide several improvements:
- It can optimize inflows and outflows during an epoch and only move the aggregate change, reducing reward loss.
- Only a single transaction is required from a user, reducing the administrative overhead of moving stake.

## Accounts
| Name | Explanation |
| ----------- | ----------- |
| Stake Shift Program | The deployed program. |
| Stake Shift System Account | A PDA system account derived from the Stake Shift Program address. |
| Validator Stake Account | The canonical stake account for a validator controlled by the Stake Shift System Account. |
| Validator Split Account | The canoncial stake account for a validator created when splitting and deactivating stake from the Validator Stake Account during an epoch and controlled by the Stake Shift System Account. |

## Instructions

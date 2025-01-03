import idl from './counter.json'
import { Idl, Program } from '@coral-xyz/anchor'

export const IDL = idl as Idl
export type Counter = typeof IDL

export type CounterProgram = Program<Counter> & {
  account: {
    counter: {
      fetch: (address: any) => Promise<any>
    }
  }
}
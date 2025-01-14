import { validatorIcons } from '../assets/validator-icons';

export type Validator = {
  validator: string;
  voteAccount: string;
  score: string;
  commission: string;
  amount?: string;
};

export const validators: Validator[] = [
  {
    validator: 'Everstake',
    voteAccount: 'CertusvXhfZGHYCGWiMM3RtgP3wJyNjvQVgYoqXxwPjBM',
    score: "9.8",
    commission: "8%",
  },
  {
    validator: 'Chorus One',
    voteAccount: 'CHoJVQo7NXUYzHeWNM3TfDhNiXEUdXhGzSx4RYsCZT4U',
    score: "9.5",
    commission: "7%",
  },
  {
    validator: 'Figment',
    voteAccount: 'FigmentNetworks1234567890123456789012345678901',
    score: "9.6",
    commission: "8%",
  },
  {
    validator: 'P2P Validator',
    voteAccount: 'P2PValidator12345678901234567890123456789012',
    score: "9.7",
    commission: "6.5%",
  }
];

export const userStakes: Validator[] = [
  {
    validator: 'Everstake',
    voteAccount: 'G7H8GnCF2Z7RtRgjjucwAXTtv9WA2yZvrRd81NcpP3HX',
    score: "9.8",
    commission: "8%",
    amount: "0.1",
  }
]; 
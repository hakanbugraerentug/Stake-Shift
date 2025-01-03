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
];

export const userStakes: Validator[] = [
  {
    validator: 'Everstake',
    voteAccount: 'G7H8GnCF2Z7RtRgjjucwAXTtv9WA2yZvrRd81NcpP3HX',
    score: "9.8",
    commission: "8%",
    amount: "0.1",
  },
  {
    validator: 'Chorus One',
    voteAccount: 'CHoJVQo7NXUYzHeWNM3TfDhNiXEUdXhGzSx4RYsCZT4U',
    score: "9.5",
    commission: "7%",
    amount: "0.05",
  },
]; 
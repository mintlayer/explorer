function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const transactions_mock = [
  {
    transaction: "a1b2c3d4e5f6",
    amount: 10.25,
    fee: 0.002,
    block: 12345,
    datetime: "2023-08-31 14:23:00",
    input: 3,
    output: 5,
  },
  {
    transaction: "f6e5d4c3b2a1...",
    amount: 5.75,
    fee: 0.01,
    block: 12346,
    datetime: "2023-08-31 15:45:00",
    input: 3,
    output: 5,
  },
  {
    transaction: "1a2b3c4d5e6...",
    amount: 1000.0,
    fee: 0.2,
    block: 12347,
    datetime: "2023-08-31 16:10:00",
    input: 3,
    output: 5,
  },
  {
    transaction: "5e6d7c8b9a0...",
    amount: 2.5,
    fee: 0.005,
    block: 12348,
    datetime: "2023-08-31 17:30:00",
    input: 3,
    output: 5,
  },
  {
    transaction: "0f1e2d3c4b5a...",
    amount: 20.0,
    fee: 0.01,
    block: 12349,
    datetime: "2023-08-31 18:15:00",
    input: 3,
    output: 5,
  },
];

export const blocks_mock = [
  {
    block: 12345,
    datetime: "2023-08-31 14:23:00",
    transactions: 3,
    address: "a1b2c3d4e5f6",
  },
  {
    block: 12345,
    datetime: "2023-08-31 14:23:00",
    transactions: 3,
    address: "a1b2c3d4e5f6",
  },
  {
    block: 12345,
    datetime: "2023-08-31 14:23:00",
    transactions: 3,
    address: "a1b2c3d4e5f6",
  },
];

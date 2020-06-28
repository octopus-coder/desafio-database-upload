import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';
import { getCustomRepository } from 'typeorm';
import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Record {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface Request {
  filename: string;
}
class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const transactionsFilePath = path.join(uploadConfig.directory, filename);
    const transactionsFileExists = await fs.promises.stat(transactionsFilePath);
    let transactionRecords: Record[] = [];
    if (transactionsFileExists) {
      const parserOptions = {
        delimiter: ',',
        columns: ['title', 'type', 'value', 'category'],
        ltrim: true,
        rtrim: true,
      };
      const buffer = await fs.promises.readFile(transactionsFilePath);

      csv(buffer, parserOptions, (error, records) => {
        records.shift();
        transactionRecords = [...records];
      });
      await fs.promises.unlink(transactionsFilePath);
    }

    const transactions: Transaction[] = [];

    const starterPromise = Promise.resolve();
    await Promise.all([
      transactionRecords.reduce(async (promise, transactionRecord) => {
        await promise;
        const transaction = await this.createTransactionTask(transactionRecord);
        transactions.push(transaction);
      }, starterPromise),
    ]);

    return transactions;
  }

  private async createTransactionTask(
    transactionRecord: Record,
  ): Promise<Transaction> {
    const { title, value, type, category } = transactionRecord;
    const createTransaction = new CreateTransactionService();
    const transaction = await createTransaction.execute({
      title,
      value,
      type,
      category,
    });
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default ImportTransactionsService;

import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Transaction type is invalid');
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Not enough balance to withdraw specified amount');
    }

    const categoriesRepository = getRepository(Category);

    const categoryAlreadyDefined = await categoriesRepository.findOne({
      where: { title: category },
    });
    let newCategory;
    if (!categoryAlreadyDefined) {
      newCategory = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(newCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryAlreadyDefined || newCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

import CareerService from '../services/career.service';
//import { HTTP_STATUS } from '../utils/const';

import type { Request, Response } from 'express';

export const getCareers = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const careers = await CareerService.listCareers(page, pageSize);
  res.status(200).json({ careers });
};

export const getCareerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      res.status(400).json({ message: 'Invalid career ID' });
      return;
    }
    const career = await CareerService.getCareerWithMentors(id);
    res.status(200).json({ career });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};
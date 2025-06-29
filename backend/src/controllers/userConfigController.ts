import { Request, Response } from 'express';
import { UserConfigModel } from '../db/UserConfig';


export const saveUserConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.identity?._id; // ✅ Use req.identity as defined in auth middleware
    const { csvColumns } = req.body;

    if (!csvColumns || !Array.isArray(csvColumns)) {
      res.status(400).json({ message: 'csvColumns must be an array' });
      return;
    }

    const config = await UserConfigModel.findOneAndUpdate(
      { user: userId },
      { csvColumns },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Configuration saved', config });
  } catch (error) {
    console.error('Save config error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getUserConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.identity?._id;

    const config = await UserConfigModel.findOne({ user: userId });

    if (!config) {
      res.status(404).json({ message: 'No config found for user' });
      return;
    }

    res.status(200).json({ config });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

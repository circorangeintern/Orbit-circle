import SavedCareer from '../models/saved-career.model';
import Career from '../models/career.model';

class SavedCareerService {
  static async saveCareer(userId: string, careerId: string) {
    const career = await Career.findById(careerId);
    if (!career) {
      throw new Error('Career not found');
    }
    const result = await SavedCareer.save(userId, careerId);
    return { alreadySaved: result === null, career };
  }

  static async unsaveCareer(userId: string, careerId: string) {
    const result = await SavedCareer.unsave(userId, careerId);
    if (!result) {
      throw new Error('Career was not saved');
    }
    return result;
  }

  static async listSaved(userId: string) {
    return SavedCareer.listForUser(userId);
  }
}

export default SavedCareerService;
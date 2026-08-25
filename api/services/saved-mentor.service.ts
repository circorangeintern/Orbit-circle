import SavedMentor from '../models/saved-mentor.model';
import Mentor from '../models/mentor.model';

class SavedMentorService {
  static async saveMentor(userId: string, mentorId: string) {
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      throw new Error('Mentor not found');
    }
    const result = await SavedMentor.save(userId, mentorId);
    return { alreadySaved: result === null, mentor };
  }

  static async unsaveMentor(userId: string, mentorId: string) {
    const result = await SavedMentor.unsave(userId, mentorId);
    if (!result) {
      throw new Error('Mentor was not saved');
    }
    return result;
  }

  static async listSaved(userId: string) {
    return SavedMentor.listForUser(userId);
  }
}

export default SavedMentorService;
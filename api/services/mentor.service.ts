import Mentor from '../models/mentor.model';

class MentorService {
  static async getMentor(id: string) {
    const mentor = await Mentor.findById(id);
    if (!mentor) {
      throw new Error('Mentor not found');
    }
    return mentor;
  }

  static async listMentors(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    return Mentor.findAll(pageSize, offset);
  }
}

export default MentorService;
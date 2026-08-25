import Career from '../models/career.model';
import Mentor from '../models/mentor.model';

class CareerService {
  static async getCareer(id: string) {
    const career = await Career.findById(id);
    if (!career) {
      throw new Error('Career not found');
    }
    return career;
  }

  static async listCareers(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    return Career.findAll(pageSize, offset);
  }

  static async getCareerWithMentors(id: string) {
    const career = await this.getCareer(id);
    const mentors = await Mentor.findByCareer(id);
    return { ...career, mentors };
  }
}

export default CareerService;
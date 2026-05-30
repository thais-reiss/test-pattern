import { User } from '../../src/domain/User.js';

export class UserMother {
  static umUsuarioPadrao() {
    return new User('1', 'Augusto Souza', 'jose@gmail.com', 'PADRAO');
  }

  static umUsuarioPremium() {
    return new User('2', 'Miranda Vieira', 'miranda@gmail.com', 'PREMIUM');
  }
}
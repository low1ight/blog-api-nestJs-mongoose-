import { UserDocument } from '../../schemas/user.schema';
import { UserViewModel } from '../../types/User.view.model';

export const usersArrToViewModel = (arr: UserDocument[]): UserViewModel[] => {
  return arr.map((item) => userObjToViewModel(item));
};

export const userObjToViewModel = (item: UserDocument): UserViewModel => {
  return {
    id: item._id.toString(),
    login: item.userData.login,
    email: item.userData.email,
    createdAt: item.userData.createdAt,
  };
};
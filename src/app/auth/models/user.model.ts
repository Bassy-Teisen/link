import { Post } from 'src/app/home/models/Post';

export type Role = 'admin' | 'premium' | 'user';

// Need to make this not optional
export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
  posts?: Post[];
}

export type UserRole = 'admin' | 'user';

export interface MockUser {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: UserRole;
}

export const MOCK_USERS: readonly MockUser[] = Object.freeze([
  {
    id: 1,
    name: 'Aarav Sharma',
    email: 'aarav.admin@product.test',
    passwordHash: 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7',
    role: 'admin',
  },
  {
    id: 2,
    name: 'Meera Patel',
    email: 'meera.admin@product.test',
    passwordHash: '7f484e682c9cf4c42e9cba611bcf04c18d1372bb920756c657c8c0233a2693ae',
    role: 'admin',
  },
  {
    id: 3,
    name: 'Kabir Singh',
    email: 'kabir.user@product.test',
    passwordHash: '3e7c19576488862816f13b512cacf3e4ba97dd97243ea0bd6a2ad1642d86ba72',
    role: 'user',
  },
  {
    id: 4,
    name: 'Ananya Rao',
    email: 'ananya.user@product.test',
    passwordHash: '78fb4e230cccb38cb3fe4951804ad8ac232a1c71a73d42928522494860ba65af',
    role: 'user',
  },
]);

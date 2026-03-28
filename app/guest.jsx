import { createLazyRoute } from '../src/navigation/create-lazy-route';

export default createLazyRoute(() => import('../src/features/auth/screens/guest-screen'));

import { createLazyRoute } from '../src/navigation/create-lazy-route';

export default createLazyRoute(() => import('../src/features/room/screens/create-room-screen'));

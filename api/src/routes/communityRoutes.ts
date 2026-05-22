import { Router } from 'express';
import { getAllCommunities, getCommunityById } from '../controllers/communityController';

const router = Router();

router.get('/', getAllCommunities);
router.get('/:communityId', getCommunityById);

export default router;

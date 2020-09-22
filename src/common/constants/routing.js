import { objMenuTypes, supportedObjectFields } from './listOfFields';

export default {
  WOBJ: {
    tabs: [
      'about',
      'gallery',
      'updates',
      'reviews',
      'followers',
      'expertise',
      'menu',
      'page',
      'list',
    ].join('|'),
    filters: [...supportedObjectFields, ...objMenuTypes, 'album'].join('|'),
  },
  USER: {
    tabs: [
      'comments',
      'followers',
      'following',
      'reblogs',
      'transfers',
      'activity',
      'expertise',
      'about',
    ].join('|'),
  },
  FEED: {
    tabs: ['trending', 'created', 'hot', 'promoted', 'feed', 'blog', 'notifications-list'].join(
      '|',
    ),
  },
};

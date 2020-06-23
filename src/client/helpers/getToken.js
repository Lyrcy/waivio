import { getAccessToken } from '../../waivioApi/ApiClient';
import { setGuestAccessToken, setGuestName } from './localStorageHelpers';

export const setToken = async (socialToken, social, regData) => {
  try {
    const { userData, token, expiration } = await getAccessToken(socialToken, social, regData);
    setGuestAccessToken(token, expiration);
    setGuestName(userData.name);

    return { userData, token };
  } catch (err) {
    return err;
  }
};

export default {
  setToken,
};

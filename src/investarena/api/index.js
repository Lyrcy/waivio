import Brokers from './Brokers';
import Deals from './Deals';
import Charts from './Charts';
import Authentications from './authentications/Authentications';
import Performers from './Performers';
import Forecasts from './Forecasts';
import Statistics from './Statistics';
import ApiClient from './ApiClient';
import Platform from './Platform';

export default function({ apiPrefix } = {}) {
  const api = new ApiClient({ prefix: apiPrefix });
  const apiPlatform = new ApiClient({ prefix: '' });

  return {
    authentications: new Authentications({ apiClient: api }),
    brokers: new Brokers({ apiClient: api }),
    deals: new Deals({ apiClient: api }),
    charts: new Charts({ apiClient: api }),
    performers: new Performers({ apiClient: api }),
    forecasts: new Forecasts({ apiClient: api }),
    statistics: new Statistics({ apiClient: api }),
    platform: new Platform({ apiClient: apiPlatform }),
  };
}

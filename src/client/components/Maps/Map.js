import PropTypes from 'prop-types';
import _ from 'lodash';
import React from 'react';
import Map from 'pigeon-maps';
import Marker from 'pigeon-marker/react';
import Overlay from 'pigeon-overlay';
import { getClientWObj } from '../../adapters';
import './Map.less';
import { getFieldWithMaxWeight } from '../../object/wObjectHelper';
import { mapFields, objectFields } from '../../../common/constants/listOfFields';
import Loading from '../Icon/Loading';

class MapOS extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      infoboxData: false,
      markersLayout: null,
      zoom: 8,
      userCoordinates: null,
    };

    this.setPosition = this.setPosition.bind(this);
    this.showUserPosition = this.showUserPosition.bind(this);
    this.setCoordinates = this.setCoordinates.bind(this);
  }

  componentDidMount() {
    this.setCoordinates();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) this.setState({ markersLayout: this.getMarkers(nextProps) });
  }

  getMarkers = props =>
    _.map(props.wobjects, wobject => {
      const lat = getFieldWithMaxWeight(wobject, objectFields.map, mapFields.latitude);
      const lng = getFieldWithMaxWeight(wobject, objectFields.map, mapFields.longitude);
      return lat && lng ? (
        <Marker
          key={`${lat}${lng}`}
          anchor={[lat, lng]}
          payload={wobject}
          onClick={this.handleMarkerClick}
        />
      ) : null;
    });

  getOverlayLayout = () => {
    const wobj = getClientWObj(this.state.infoboxData.wobject);
    return (
      <Overlay anchor={this.state.infoboxData.coordinates} offset={[-12, 35]}>
        <div className="MapOS__overlay-wrap">
          <img src={wobj.avatar} width={35} height={35} alt="" />
          <div className="MapOS__overlay-wrap-name">{wobj.name}</div>
        </div>
      </Overlay>
    );
  };

  setPosition = () => {
    this.setState({ userCoordinates: null });
    this.setCoordinates();
  };

  setCoordinates = () => {
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showUserPosition);
    } else {
      this.setState({ userCoordinates: [this.props.centerLat, this.props.centerLng] });
    }
  };

  showUserPosition = position => {
    this.setState({ userCoordinates: [position.coords.latitude, position.coords.longitude] });
  };

  handleMarkerClick = ({ payload, anchor }) => {
    if (this.state.infoboxData && this.state.infoboxData.coordinates === anchor) {
      this.setState({ infoboxData: null });
    }
    this.setState({ infoboxData: { wobject: payload, coordinates: anchor } });
  };

  incrementZoom = () => {
    this.setState({ zoom: this.state.zoom + 1 });
  };
  decrementZoom = () => {
    this.setState({ zoom: this.state.zoom - 1 });
  };

  render() {
    const { mapHeigth, setCoordinates } = this.props;
    const { markersLayout, infoboxData, zoom, userCoordinates } = this.state;
    return userCoordinates ? (
      <div className="MapOS">
        <Map
          center={userCoordinates}
          zoom={zoom}
          height={mapHeigth}
          onClick={setCoordinates}
          animate
          zoomSnap={false}
        >
          {markersLayout}
          {infoboxData && this.getOverlayLayout()}
        </Map>
        <div className="MapOS__zoom">
          <div role="presentation" className="MapOS__zoom-button" onClick={this.incrementZoom}>
            +
          </div>
          <div role="presentation" className="MapOS__zoom-button" onClick={this.decrementZoom}>
            -
          </div>
        </div>
        <div role="presentation" className="MapOS__locateGPS" onClick={this.setPosition}>
          <img src="/images/icons/aim.png" alt="aim" className="MapOS__locateGPS-button" />
        </div>
      </div>
    ) : (
      <Loading />
    );
  }
}

MapOS.defaultProps = {
  centerLat: 37.0902,
  centerLng: 95,
  markers: {},
  wobjects: [],
  mapHeigth: 200,
  setCoordinates: () => {},
};

MapOS.propTypes = {
  setCoordinates: PropTypes.func,
  mapHeigth: PropTypes.number,
  centerLat: PropTypes.number,
  centerLng: PropTypes.number,
};

export default MapOS;

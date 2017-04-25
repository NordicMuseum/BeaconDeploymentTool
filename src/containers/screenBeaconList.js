import { connect } from 'react-redux';

import ScreenBeaconList from '../components/screenBeaconList';

const mapStateToProps = (state) => {
  const beacons = state.beacons.allBeacons;
  return {
    beacons,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ScreenBeaconList);

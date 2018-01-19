import React from 'react';
import { GoogleApiWrapper } from 'google-maps-react';
import MeetupMap from './MeetupMap.jsx';
// import config from '../../config.js';
const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
console.log(MAPS_API_KEY);
//const MEETUPS_API_KEY = process.env.MEETINGS_API_KEY;

class MapContainer extends React.Component {
  render() {
    return (
      <div className="MapContainer">
        <MeetupMap
          google={this.props.google}
          initialCenter = {this.props.initialLocation}
          zoom = {13}
          meetups={this.props.meetups}
          {...this.props}/>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: MAPS_API_KEY,  
  libraries:['places']
})(MapContainer)
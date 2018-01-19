import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import axios from 'axios';
import MeetUpList from './MeetUpList.jsx';
import Login from './Login.jsx';
import Profile from './Profile.jsx';
import ProfileCard from './ProfileCard.jsx';
import LoginForm from './LoginForm.jsx';
import SignUpForm from './SignUpForm.jsx';
import MapContainer from '../components/MapContainer.jsx';
import { Link } from 'react-router-dom';
import {BrowserRouter, Router, Route, browserHistory, Switch, IndexRoute} from 'react-router-dom';
const path = require('path');
class SecondPage extends React.Component {
  constructor(props) {
    super(props);

      this.state = {
        items: [],
        zipcode: '',
        events: [],
        location: '',
        lat: '',
        lon: '',
        // zipcodeAsker: '',
        // zipcodebutton: '',
        profile: ''
      }
      this.fetchProfileInfo = this.fetchProfileInfo.bind(this);
      this.getZipcode = this.getZipcode.bind(this);
      this.getMeetups = this.getMeetups.bind(this);
      this.weKnowTheLocation = this.weKnowTheLocation.bind(this);
      this.errorHandler = this.errorHandler.bind(this);
      this.displayList = this.displayList.bind(this);
      this.id = 0;
    }

    displayList () {
      console.log('we are trying to display the list');

    };

    weKnowTheLocation (pos) {
        var crd = pos.coords;
        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);
        var thisLat = crd.latitude;
        var thisLon = crd.longitude;
        this.setState({lat: thisLat});
        this.setState({lon: thisLon});
        navigator.geolocation.clearWatch(this.id);
        this.getMeetups();
    };

    errorHandler () {
        // this.setState({zipcodeAsker: (<input id="ourZip" placeholder="zipcode" value={this.state.zipcodes} onChange={this.getZipcode}></input>)});
        // this.setState({zipcodebutton: (<button id="meetupRequest" onClick={this.getMeetups}>Find MeetUps</button>)});
        $("#zipCodeAsker").removeClass("invisible");
        $("#zipCodeButton").removeClass("invisible");
        // $("zipCodeDiv").removeClass("invisible");
        $("#zipCodeAsker").addClass("visible");
        $("#zipCodeButton").addClass("visible");

        // $("zipCodeDiv").addClass("visible");
      };

    fetchProfileInfo() {
      console.log('im in fetching?')
      $.ajax({
      url: '/users',
      method: 'GET',
      success: (data) => {
        this.setState({
          profile: data
        });
        console.log('hello', data);
      },
      error: (error) => {
        console.log('fail safe', error)
      }
    });
    }

    componentDidMount() {
      var options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      };
      this.fetchProfileInfo();
      this.id = navigator.geolocation.getCurrentPosition(this.weKnowTheLocation, this.errorHandler, options);
    }

    getZipcode(event) {
      console.log('we got the zipcode');
      this.setState({zipcode : event.target.value});
    }

    getMeetups() {
      console.log('we are trying to get the meetups');
      $.ajax({
        url: '/meetups',
        type: 'GET',
        contentType: 'application/json',
        data: {zipcode : this.state.zipcode, lat: this.state.lat, lon: this.state.lon},
        success: (meetups) => {
          console.log('successsssssss!');
         this.setState({meetups : meetups});
        },
        error: (err) => {
          console.log('an error is happen');
          console.log(err);
        }
      }).done((meetups) => {
        console.log('done');
          meetups = JSON.parse(meetups);
          this.setState({location: meetups.city});
          this.setState({events: meetups.events});
          console.log(meetups.events);});
          this.displayList();
    }


  render() {
    return (
      <div>
      <div>
      <h1 style={{display: 'flex'}}>
      <text style={{display: 'flex', flex: 1, textAlign: 'center', alignSelf: 'center', flexDirection: 'row', justifyContent: 'center'}}>What's Going On Tonight?</text>
      <Link className="btn" to={{pathname:'/home'}}>Home</Link>
      <Link className="btn" to={{pathname:'/logout'}}>Logout</Link>
      <Link className="btn" to={{pathname:'/profile'}}>{this.state.profile.username}'s profile</Link>
      </h1>
      </div>
      <div id="zipCodeDiv" className="visible">
      <textArea id="zipCodeAsker" className="invisible" placeholder="What is your zip code?"></textArea><button id="zipCodeButton" className="invisible">Look up nearby meetups</button>
      </div>
      <div className="map">
      <div>
       <MapContainer meetups={this.state.events}
       initialLocation={{lat: this.state.lat, lng: this.state.lon}}
       />
      </div>
      </div>
      <div className="list">
      <MeetUpList events={this.state.events} />
      <ProfileCard profile={this.state.profile}/>
      </div>
      </div>
    );
  };
}
export default SecondPage;

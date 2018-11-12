import React, { Component } from 'react';
import { WebView, View, Linking, Text, TextInput, ScrollView, StyleSheet, Button, TouchableOpacity, Image } from 'react-native';
import {ImageBackground,  ActivityIndicator,} from 'react-native';
import DatePicker from 'react-native-datepicker';
import CircleSlider from 'react-native-circle-slider';
import Modal from 'react-native-modal';
import {Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import FitImage from 'react-native-fit-image';
import Carousel from 'react-native-snap-carousel';
import { Font, LinearGradient } from 'expo';
import t from 'tcomb-form-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import key from './google.js';
import MapView from 'react-native-maps';
import SunCalc from 'suncalc';
import {
  BallIndicator,
  BarIndicator,
  DotIndicator,
  MaterialIndicator,
  PacmanIndicator,
  PulseIndicator,
  SkypeIndicator,
  UIActivityIndicator,
  WaveIndicator
} from 'react-native-indicators';

global.self = global;

// const Weather = require('./models/Weather.js');
import { getWeatherData } from './models/Helper.js';
import { returnWeatherData } from './models/Helper.js';
import { Helper } from './models/Helper.js';
import axios from 'axios';


const Form = t.form.Form;

const User = t.struct({
  location: t.String
});

const formStyles = {
  ...Form.stylesheet,
  formGroup: {
    normal: {
      marginBottom: 10,
      width: '80%',
      alignSelf: 'center'
    },
  },
  controlLabel: {
    normal: {
      color: 'transparent',
      fontSize: 0,
      marginBottom: 7,
      fontWeight: 'bold'
    },
    // the style applied when a validation error occours
    error: {
      color: 'red',
      fontSize: 18,
      marginBottom: 7,
      fontWeight: '600'
    }
  }
}


const options = {
  fields: {
    location: {
      placeholder: "Where (place or postcode)?",
      placeholderTextColor: "white",
      error: 'Please enter a place or postcode',
      textAlign: 'center',
      fontSize: 28,
      fontWeight: 'bold',
      opacity: '50%'
    },
    date: {
      mode: 'date',
      dialogMode: 'spinner'
    },
  },
  stylesheet: formStyles,
};

export default class App extends Component {


  constructor(props) {
  super(props);
  this.processSubmit = this.processSubmit.bind(this);
  this.toggleModal = this.toggleModal.bind(this);
  this.toggleInfoModal = this.toggleInfoModal.bind(this);
  this.getWeatherData = this.getWeatherData.bind(this);
  this.getCoordinates = this.getCoordinates.bind(this);
}


  state = {
   fontLoaded: false,
   dateSelected: null,
   isModalVisible: false,
   weather: null,
   second_year_weather: null,
   position: null,
   searchedLocation: null,
   icon: '',
   loadingInProcess: null,
   infoModalVisible: false
 };

  // handleSubmit = () => {
  //   const value = this._form.getValue();
  //   console.log('value: ', value);
  // }

  async componentDidMount() {
    await Font.loadAsync({
      'Raleway-Regular': require('./assets/fonts/Raleway-Regular.ttf'),
    });

     this.setState({ fontLoaded: true });
     console.log("FONT LOADED", this.state.fontLoaded);
  }

  convertSecondsToCalendarDate(){
    var fractionOfYear = this.state.dateSelected / 365;
    var secondsInAYear = 31536000;
    var seconds = fractionOfYear * secondsInAYear;

    var dateToDisplay = new Date(seconds * 1000);
    var months = ['January','Febuary','March','April','May','June','July','August','September','October','November','December'];
    var month = months[dateToDisplay.getMonth()];
    var date = dateToDisplay.getDate();

    if (date == 3) {
   var formattedDate = `${date}rd`
} else if (date == 2) {
   var formattedDate = `${date}nd`
}
else if (date == 1) {
   var formattedDate = `${date}st`
}
else if (date == 21) {
   var formattedDate = `${date}st`
}
else if (date == 31) {
   var formattedDate = `${date}st`
}
else if (date == 22) {
   var formattedDate = `${date}nd`
}
else if (date == 23) {
   var formattedDate = `${date}rd`
}
 else {
   var formattedDate = `${date}th`
}

    if (!this.state.dateSelected){
      return 'Slide to select date'
    }
    else {
      return `${formattedDate} ${month}`;
    }
  }

  moonPhase(){

    console.log("DATE", this.moonPhaseDate(this.dateForRequest(this.state.dateSelected)));
    return SunCalc.getMoonIllumination(this.moonPhaseDate(this.dateForRequest(this.state.dateSelected))).phase;
  }


  convertMoonPhaseNumberToName(moonPhaseNumber) {


  if (moonPhaseNumber <= 0.01 && moonPhaseNumber >= 0){
    var moonPhaseName = 'New moon'
  }
  else if(moonPhaseNumber <= 0.245 && moonPhaseNumber > 0.01){
    var moonPhaseName = 'Waxing crescent moon'
  }
  else if(moonPhaseNumber <= 0.255 && moonPhaseNumber > 0.245){
    var moonPhaseName = 'First quarter moon'
  }
  else if(moonPhaseNumber > 0.475 && moonPhaseNumber < 0.525){
    var moonPhaseName = 'Full moon'
  }
  else if(moonPhaseNumber <= 0.475 && moonPhaseNumber > 0.255){
    var moonPhaseName = 'Waxing gibbous moon'
  }
  else if(moonPhaseNumber <= 0.755 && moonPhaseNumber > 0.745){
    var moonPhaseName = 'Last quarter moon'
  }
  else if(moonPhaseNumber <= 0.745 && moonPhaseNumber >= 0.525 ){
    var moonPhaseName = 'Waning gibbous moon'
  }
  else{
    var moonPhaseName = 'Waning crescent moon'
  }
  return moonPhaseName;
};


  moonPhaseImage(phaseImageName){

    switch(phaseImageName) {

    case "new_moon.jpg": return require("./assets/icons/new_moon.jpg");
    case "waxing_crescent.jpg": return require("./assets/icons/waxing_crescent.jpg");
    case "first_quarter.jpg": return require("./assets/icons/first_quarter.jpg");
    case "full_moon.jpg": return require("./assets/icons/full_moon.jpg");
    case "waxing_gibbous.jpg": return require("./assets/icons/waxing_gibbous.jpg");
    case "last_quarter.jpg": return require("./assets/icons/last_quarter.jpg");
    case "waning_gibbous.jpg": return require("./assets/icons/waning_gibbous.jpg");
    case "waning_crescent.jpg": return require("./assets/icons/waning_crescent.jpg");

  }

  }

  convertMoonPhaseNumberToImageName(moonPhaseNumber) {

  if (moonPhaseNumber <= 0.01 && moonPhaseNumber >= 0){
    var moonPhaseName = 'new_moon.jpg'
  }
  else if(moonPhaseNumber <= 0.245 && moonPhaseNumber > 0.01){
    var moonPhaseName = 'waxing_crescent.jpg'
  }
  else if(moonPhaseNumber <= 0.255 && moonPhaseNumber > 0.245){
    var moonPhaseName = 'first_quarter.jpg'
  }
  else if(moonPhaseNumber > 0.475 && moonPhaseNumber < 0.525){
    var moonPhaseName = 'full_moon.jpg'
  }
  else if(moonPhaseNumber <= 0.475 && moonPhaseNumber > 0.255){
    var moonPhaseName = 'waxing_gibbous.jpg'
  }
  else if(moonPhaseNumber <= 0.755 && moonPhaseNumber > 0.745){
    var moonPhaseName = 'last_quarter.jpg'
  }
  else if(moonPhaseNumber <= 0.755 && moonPhaseNumber >= 0.525 ){
    var moonPhaseName = 'waning_gibbous.jpg'
  }
  else{
    var moonPhaseName = 'waning_crescent.jpg'
  }
  return moonPhaseName;
};

  convertSecondsToCalendarDateForOutputText(){
    var fractionOfYear = this.state.dateSelected / 365;
    var secondsInAYear = 31536000;
    var seconds = fractionOfYear * secondsInAYear;

    var dateToDisplay = new Date(seconds * 1000);
    var months = ['January','Febuary','March','April','May','June','July','August','September','October','November','December'];
    var month = months[dateToDisplay.getMonth()];
    var date = dateToDisplay.getDate();

    if (date == 3) {
   var formattedDate = `${date}rd`
} else if (date == 2) {
   var formattedDate = `${date}nd`
}
else if (date == 1) {
   var formattedDate = `${date}st`
}
else if (date == 21) {
   var formattedDate = `${date}st`
}
else if (date == 31) {
   var formattedDate = `${date}st`
}
else if (date == 22) {
   var formattedDate = `${date}nd`
}
else if (date == 23) {
   var formattedDate = `${date}rd`
}
 else {
   var formattedDate = `${date}th`
}

    if (!this.state.dateSelected){
      return '1st January';
    }
    else {
      return `${formattedDate} ${month}`;
    }
  }

  getVal(val) {
        console.warn(val);
    }

  processSubmit(){
    var self = this;
    // var location = `${lat}, ${long}`

    this.setState({ loadingInProcess: true }, function(){this.getCoordinates(self.state.searchedLocation)})
  }

    toggleModal(){

      this.setState({ loadingInProcess: false }, function(){this.setState({ isModalVisible: !this.state.isModalVisible })});

    }

    toggleInfoModal(){

      console.log("INFO MODAL VISIBLE", this.state.infoModalVisible);

      this.setState({ infoModalVisible: !this.state.infoModalVisible })

    }

    dateForRequest(dateChosen){
      var newYearsDay2019 = 1483228800;
      var fractionOfYear = dateChosen / 365;
      var secondsInAYear = 31536000;
      var seconds = fractionOfYear * secondsInAYear;

      return seconds + 1483228800;
    }

    moonPhaseDate(searchedDate){
      var now = new Date(Date.now());
      var theirDate = new Date();
      var dateSearched = new Date((searchedDate + 86400) * 1000);

      theirDate.setMonth(dateSearched.getMonth());
      theirDate.setDate(dateSearched.getDate());
      theirDate.setFullYear(now.getFullYear());

      if (theirDate.getMonth() >= now.getMonth()){
        return theirDate;
      }

      else {
        theirDate.setFullYear((now.getFullYear()) + 1);
        return theirDate;
      }
    }


    getCoordinates(location){

      const url = `http://weather2wed.herokuapp.com/longlat/${location}`
      var self = this;

        axios.get(url).then((response) => {

          var position = [parseFloat(response.data.items[0].lat), parseFloat(response.data.items[0].long)]
          console.log("DATE SEARCHED", self.state.dateSelected);
          this.setState({
            coordinatesDataLoaded: true,
            position: position,
          }, function(){this.getWeatherData(`${self.state.position[0]},${self.state.position[1]}`, self.dateForRequest(self.state.dateSelected))})
    }).catch(function(error){
      console.log(error);
      console.log("Error fetching coordinates data.");
    })
    }


    getWeatherData = function(location, seconds){
      console.log("API Key", key);
        const url = `http://weather2wed.herokuapp.com/weather/${location}/${seconds}`
        console.log("RETRIEVING WEAther");
        axios.get(url).then(response => {

          console.log("data", this.data);
          this.setState({
            weather: response.data,
            icon: `${response.data.daily.data[0].icon}`
          }, function(){this.getSecondYearOfWeatherData(`${this.state.position[0]},${this.state.position[1]}`, (this.dateForRequest(this.state.dateSelected) - 31536000)) })

    }).catch(function(error){
      console.log(error);
      console.log("Error fetching weather data.");
    })
    }

    getSecondYearOfWeatherData = function(location, seconds){
      console.log("API Key", key);
        const url = `http://weather2wed.herokuapp.com/weather/${location}/${seconds}`
        axios.get(url).then(response => {

          console.log("data", this.data);
          this.setState({
            second_year_weather: response.data
          }, function(){this.toggleModal()})

    }).catch(function(error){
      console.log(error);
      console.log("Error fetching weather data.");
    })
    }

    fahrenheitToCelsius = function (fahrenheit) {
      const celsius = Math.round(((fahrenheit - 32)/1.8));
      return celsius;
    };

     getImage(icon) {
      switch(icon) {
      case "partly-cloudy-day": return require("./assets/icons/partly-cloudy-day.png");
      case "partly-cloudy-day": return require("./assets/icons/partly-cloudy-day.png");
      case "fog": return require("./assets/icons/fog.png");
      case "clear-day": return require("./assets/icons/clear-day.png");
      case "clear-night": return require("./assets/icons/clear-night.png");
      case "clouds": return require("./assets/icons/clouds.png");
      case "cloudy": return require("./assets/icons/cloudy.png");
      case "partly-cloudy-night1": return require("./assets/icons/partly-cloudy-night1.png");
      case "partly-cloudy-night": return require("./assets/icons/partly-cloudy-night.png");
      case "pine": return require("./assets/icons/pine.png");
      case "rain": return require("./assets/icons/rain.png");
      case "raining": return require("./assets/icons/raining.png");
      case "sleet": return require("./assets/icons/sleet.png");
      case "wind": return require("./assets/icons/wind.png");
      case "wind1": return require("./assets/icons/wind1.png");
      case "snow": return require("./assets/weather_icons/png/037-snowflake.png");
  }
}

  timeConverterToHours = function (UNIX_timestamp) {

  var a = new Date(UNIX_timestamp * 1000);

  var hour = a.getHours(); // makes time easier to read (presumes wedding is pm!)
  var min = a.getMinutes();
  if (min < 10){
    min = `0${min}`;
  }
  if (hour > 12){
  var time = hour-12 + ':' + min + ' pm'  ;
  }
  else if (hour == 12){
  var time = hour + ':' + min + ' pm' + ' (midday)'  ;
  }
  else if (hour == 0){
  var time = 12 + ':' + min + ' pm' + ' (midnight)'  ;
  }
  else{
  var time = hour + ':' + min + ' am'  ;
  }

  return time;
  }


  updateLocationState(searchedLocation){
    this.setState({
      searchedLocation: searchedLocation
    })
  }

  getAverageHumidity(){
    return (this.state.weather.daily.data[0].humidity + this.state.second_year_weather.daily.data[0].humidity) / 2
  }

  getAverageCloudCover(){
    return (this.state.weather.daily.data[0].cloudCover + this.state.second_year_weather.daily.data[0].cloudCover) / 2
  }

  getAverageWindSpeed(){
    return (this.state.weather.daily.data[0].windSpeed + this.state.second_year_weather.daily.data[0].windSpeed) / 2
  }

  getAveragePrecipitationProbability(){
    return (this.state.weather.daily.data[0].precipProbability + this.state.second_year_weather.daily.data[0].precipProbability) / 2
  }

  getAverageHigh(){
    return (this.state.weather.daily.data[0].temperatureHigh + this.state.second_year_weather.daily.data[0].temperatureHigh) / 2
  }

  getAverageLow(){
    return (this.state.weather.daily.data[0].temperatureLow + this.state.second_year_weather.daily.data[0].temperatureLow) / 2
  }

  getAverageAverageTemperature(){
    return (this.state.weather.hourly.data[14].temperature + this.state.second_year_weather.hourly.data[14].temperature) / 2
  }

  render() {
    var self = this;


    if (self.state.loadingInProcess === true){
      return (

        <ImageBackground
                 source={require('./assets/affair-anniversary-beach.png')}
                 style={styles.backgroundStyle}
                 >

        <View style={styles.container}>
        {
     this.state.fontLoaded ? (

       <View>
       <Text style={{ fontFamily: 'Raleway-Regular', paddingBottom: '7.5%', fontSize: 45, fontWeight: '400', textAlign: 'center',  color: "white"}}>
         Weather2Wed
       </Text>
       </View>
     ) : null
   }
          <View style={{paddingBottom: '10%', paddingLeft: 20, paddingRight: 20}}>
          <TextInput
        style={{height: 40, borderColor: 'white', borderWidth: 1, textAlign: 'center', fontWeight: 'normal', fontSize: 19, paddingLeft: 20, paddingRight: 20}}
        onChangeText={(searchedLocation) => {this.updateLocationState(searchedLocation)}}
        value={this.state.searchedLocation} placeholder='Where? Place or postcode' placeholderTextColor='white'
        underlineColorAndroid='transparent'
      />

          </View>

          <View style={{ width: '100%', height: '50%', alignItems: 'center'}}>
          <CircleSlider style={{position: 'relative', top: '10%', paddingTop: '100%'}}
        arcDirection={'CW'}
              backgroundColor={"white"}
              value={0}
              btnRadius={10}
              btnColor={'#24b599'}
              sliderRadius={110}
              sliderWidth={17.5}
              startDegree={0}
              maxValue={365}
              onPressInnerCircle={(value) => console.log(`Inner: ${value}`)}
              onPressOuterCircle={(value) => console.log(`Outer: ${value}`)}
              onValueChange={val => this.setState({ dateSelected: val })}
              onSlidingComplete={val => this.getVal(val)}
              endGradient={"#A6FFCB"}
              startGradient={"#12D8FA"}
              showValue={'true'}
              textColor={'black'}
              textSize={20}
      />
      <Text style={{fontSize: 25, fontWeight: 'normal', color: "white"}}>
      {`${this.convertSecondsToCalendarDate()}`}
      </Text>
      </View>

          <View style={styles.buttonContainer}>
          < BarIndicator count={7} size={60} color={'white'}/>
          </View>

          <Modal
          isVisible={this.state.isModalVisible}
          style={styles.modalContainer}
          >
            <TouchableOpacity onPress={this.toggleModal} style={{ height: 22}}>
              <Image source={require('./assets/image.png')} style={{height: 22, width: 22, marginBottom: 10, position: 'relative', left:'91%'}}/>
            </TouchableOpacity>

            <View style={{flex: 1, backgroundColor: 'pink'}}>

            <View style={{backgroundColor: '#24b599', borderTopRightRadius: 5, borderTopLeftRadius: 5}}>
          {
            this.state.weather ? (
              <View style={styles.weatherItem}>
              <Image source={ this.getImage(this.state.icon) } style={{width: 130, height: 130}}/>
                 <Text style={{color: 'white', padding: 5, fontSize: 20}}>'{this.state.searchedLocation}', {this.convertSecondsToCalendarDateForOutputText()}: '{this.state.weather.hourly.summary}'</Text>
                </View>
            ) :
            <View style={styles.weatherItem}>
            <Image source={ this.getImage(this.state.icon) } style={{width: 130, height: 130}}/>

            <Text style={{color: 'white', padding: 5, fontSize: 20}}>'{this.state.searchedLocation}', {this.convertSecondsToCalendarDateForOutputText()}: (Hardcoded) Light rain starting in the evening.</Text>
            </View>
          }

            </View>

          {
       this.state.weather ? (
         <View style={styles.resultsWrapper}>

         <ScrollView>

         <View style={styles.weatherItem}>

         <Image source={ this.getImage(this.state.icon) } style={{width: 75, height: 75}}/>

         <Text style={styles.weatherItemText}> Average temp: { this.fahrenheitToCelsius(this.state.weather.hourly.data[14].temperature) }°C</Text>

         </View>

         <View style={styles.weatherItem}>
         <Image source={require('./assets/icons/rain_chance.png')} style={{width: 75, height: 75}}/>
         <Text style={styles.weatherItemText}> Chance of rain: { Math.round(this.state.weather.daily.data[0].precipProbability * 100) }%</Text>
         </View>

         <View style={styles.weatherItem}>
         <Image source={require('./assets/icons/sunset.png')} style={{width: 75, height: 75}}/>
         <Text style={styles.weatherItemText}>Sunrise: { this.timeConverterToHours(this.state.weather.daily.data[0].sunriseTime) } Sunset: { this.timeConverterToHours(this.state.weather.daily.data[0].sunsetTime) }</Text>
         </View>

         <View style={styles.weatherItem}>
         <Image source={ this.moonPhaseImage(this.convertMoonPhaseNumberToImageName(this.moonPhase())) } style={{width: 75, height: 75}}/>
         <Text style={styles.weatherItemText}>{this.convertMoonPhaseNumberToName(this.moonPhase())} ({this.moonPhaseDate(this.dateForRequest(this.state.dateSelected)).getDate()}/{this.moonPhaseDate(this.dateForRequest(this.state.dateSelected)).getMonth()}/{this.moonPhaseDate(this.dateForRequest(this.state.dateSelected)).getFullYear()})</Text>
         </View>

         <View style={styles.weatherItem}>
         <Image source={require('./assets/icons/temperature.png')} style={{width: 75, height: 75}}/>
         <Text style={styles.weatherItemText}>Low: {this.fahrenheitToCelsius(this.state.weather.daily.data[0].temperatureLow)}°C at { this.timeConverterToHours(this.state.weather.daily.data[0].temperatureLowTime) }, High: {this.fahrenheitToCelsius(this.state.weather.daily.data[0].temperatureHigh)}°C at { this.timeConverterToHours(this.state.weather.daily.data[0].temperatureHighTime) } </Text>
         </View>

         <View style={styles.weatherItem}>
         <Image source={require('./assets/icons/humidity.jpg')} style={{width: 75, height: 75}}/>
         <Text style={styles.weatherItemText}>Humidity: { this.state.weather.daily.data[0].humidity*100 }%</Text>
         </View>

         <View style={styles.weatherItem}>
         <Image source={require('./assets/icons/wind-speed.png')} style={{width: 75, height: 75}}/>
         <Text style={styles.weatherItemText}>Wind speed: {this.state.weather.daily.data[0].windSpeed} mph</Text>
         </View>

         <View style={styles.lastWeatherItem}>
         <Image source={require('./assets/icons/clouds.png')} style={{width: 75, height: 75}}/>
         <Text style={styles.weatherItemText}>Cloud cover: { this.state.weather.daily.data[0].cloudCover * 100 }%</Text>
         </View>

         </ScrollView>

         </View>

       ) : <Text> </Text>
     }

     <TouchableOpacity onPress={this.toggleModal} style={{justifyContent: 'center', height: '10%'}}>
     <View style={{justifyContent: 'center'}}>
       <Image source={require('./assets/darksky.png')} style={{ height: 33.98509187, width: 150, marginLeft: 75 }}/>
     </View>
     </TouchableOpacity>

            </View>

          </Modal>

        </View>
      </ImageBackground>

      )

    }

    else {
          return (
      <ImageBackground
               source={require('./assets/affair-anniversary-beach.png')}
               style={styles.backgroundStyle}
               >

      <View style={styles.container}>
      {
   this.state.fontLoaded ? (

     <View>
     <Text style={{ fontFamily: 'Raleway-Regular', paddingBottom: '7.5%', fontSize: 45, fontWeight: '400', textAlign: 'center',  color: "white"}}>
       Weather2Wed
     </Text>
     </View>
   ) : null
 }
        <View style={{paddingBottom: '10%', paddingLeft: 20, paddingRight: 20}}>
        <TextInput
      style={{height: 40, borderColor: 'white', borderWidth: 1, textAlign: 'center', fontWeight: 'normal', fontSize: 19}}
      onChangeText={(searchedLocation) => {this.updateLocationState(searchedLocation)}}
      value={this.state.searchedLocation} placeholder='Where? Place or postcode' placeholderTextColor='white'
      underlineColorAndroid='transparent'
    />

        </View>

        <View style={{ width: '100%', height: '50%', alignItems: 'center'}}>
        <CircleSlider style={{position: 'relative', top: '0%', paddingTop: '100%'}}
			arcDirection={'CW'}
            backgroundColor={"white"}
            value={0}
            btnRadius={10}
            btnColor={'#24b599'}
            sliderRadius={110}
            sliderWidth={17.5}
            startDegree={0}
            maxValue={365}
            onPressInnerCircle={(value) => console.log(`Inner: ${value}`)}
            onPressOuterCircle={(value) => console.log(`Outer: ${value}`)}
            onValueChange={val => this.setState({ dateSelected: val })}
            onSlidingComplete={val => this.getVal(val)}
            endGradient={"#A6FFCB"}
            startGradient={"#12D8FA"}
            showValue={'true'}
            textColor={'black'}
            textSize={20}
		/>
    <Text style={{fontSize: 25, fontWeight: 'normal', color: "white"}}>
    {`${this.convertSecondsToCalendarDate()}`}
    </Text>
    </View>

        <View style={styles.buttonContainer}>
        <TouchableOpacity
        style={styles.button}
        onPress={this.processSubmit}>
        <Image source={require('./assets/weather2wed_button.jpg')} style={{height: 75, width: 75 }}/>
        </TouchableOpacity>
      </View>

      <View>
      <TouchableOpacity
      style={{position: 'relative', top: '-185%'}}
      onPress={this.toggleInfoModal}>
      <Image source={require('./assets/info_icon.png')} style={{height: 20, width: 20, position: 'relative', left: '92%', top: '0%'}}/>
      </TouchableOpacity>
      </View>

      <Modal  isVisible={this.state.infoModalVisible}
      style={{borderWidth: 0, borderRadius: 10, justifyContent: 'center', alignItems: 'center'}}>

      <LinearGradient
        colors={['#A6FFCB', '#12D8FA']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '100%',
          borderRadius: 10
        }}
      >

      <TouchableOpacity onPress={this.toggleInfoModal} style={{ height: 32}}>
        <Image source={require('./assets/image.png')} style={{height: 22, width: 22, marginBottom: 10, marginTop: 10, position: 'relative', left:'91%'}}/>
      </TouchableOpacity>

      <View style={{alignItems: "center"}}>
       <Image source={require('./assets/weather-clip-animated-3.gif')} style={{height: 100, width: 100}}/>
       </View>

        <ScrollView>

       <Text style={{fontSize: 17, fontWeight: 'bold', color: 'white', paddingLeft: 20, paddingRight: 20, paddingTop: 10}}>Weather2Wed was born from a vanilla Javascript project undertaken by <Text style={{fontSize: 17, color: '#a8a8a8'}} onPress={()=>Linking.openURL('https://github.com/jah1603')}>James Henderson</Text><Text style={{fontSize: 17, color: '#a8a8a8'}} onPress={()=>Linking.openURL('https://github.com/SFR1981')}>, Stephen Rooney</Text><Text style={{fontSize: 17, color: '#a8a8a8'}} onPress={()=>Linking.openURL('https://github.com/helenosheaa')}>, Helen O’Shea</Text> &<Text style={{fontSize: 18, color: '#a8a8a8'}} onPress={()=>Linking.openURL('https://github.com/DavidAPears')}> David Pears.</Text></Text>
        <Text style={{fontSize: 17, fontWeight: 'bold', color: 'white', padding: 20}}> The project formed part of the <Text style={{fontSize: 17, color: '#a8a8a8'}} onPress={()=>Linking.openURL('https://codeclan.com')}>CodeClan</Text> Software Development course. The original web app can still be seen <Text style={{fontSize: 17, color: '#a8a8a8'}} onPress={()=>Linking.openURL('http://weather2wed.herokuapp.com')}>here</Text>. Then, James, Stephen and David holed themselves up in an Edinburgh cafe to convert Weather2Wed into <Text style={{fontSize: 18, color: '#a8a8a8'}} onPress={()=>Linking.openURL('https://www.reactnative.com')}>ReactNative</Text> (teaching themselves the language in the process).  Several hundred cups of coffee later, the result is this app.</Text>

       <Text style={{fontSize: 17, fontWeight: 'bold', color: 'white', paddingLeft: 20, paddingTop: 10, paddingRight: 20, paddingBottom: 10}}>Weather2Wed’s aim is to allow brides and grooms to assess the weather for their potential wedding date - at any UK location. Powered by <Text style={{fontSize: 17, color: '#a8a8a8'}} onPress={()=>Linking.openURL('https://darksky.net/')}>Dark Sky</Text>, the app returns the average/typical weather (based on historical weather data) for any given location in the UK. The app utilises <Text style={{fontSize: 18, color: '#a8a8a8'}} onPress={()=>Linking.openURL('https://www.geograph.org.uk/')}>Geograph's API</Text> which means that any part of the UK can be entered as a search term (the fuzzy search can handle place names, postcodes, regions, sites of interest or even landmarks). Weather2Wed also suggests hotels in and around a prospective wedding venue using the <Text style={{fontSize: 18, color: '#a8a8a8'}} onPress={()=>Linking.openURL('https://developer.foursquare.com/places-api')}>FourSquare API</Text>. There is no commercial benefit to us, the creators; this information is provided as a free service. </Text>

       <Text style={{fontSize: 17, fontWeight: 'bold', color: 'white', paddingLeft: 20}}>Weather2Wed</Text>

       <Text style={{fontSize: 17, fontWeight: 'bold', color: 'white', paddingBottom: 20, paddingLeft: 20}}>November 2018</Text>

       </ScrollView>
       </LinearGradient>
      </Modal>

          {
            this.state.weather ? (

                <Modal  isVisible={this.state.isModalVisible}
                style={styles.modal}

                >

                <LinearGradient
                  colors={['#A6FFCB', '#12D8FA']}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: '100%',
                    borderRadius: 15
                  }}
                >




                  {/* Exit cross element begins here */}

                  <TouchableOpacity onPress={this.toggleModal} style={{ height: 28}}>
                    <Image source={require('./assets/image.png')} style={{height: 22, width: 22, marginTop: 6, marginBottom: 10, position: 'relative', left:'91%'}}/>
                  </TouchableOpacity>

                  {/* Exit cross element ends here */}



              <View style={styles.weatherSummaryItem}>

                 <Text style={styles.weatherHeadingText}>{this.convertSecondsToCalendarDateForOutputText()} in "{this.state.searchedLocation}"</Text>
                 <Image source={ this.getImage(this.state.icon) } style={{width: 125, height: 125, paddingBottom: 10}}/>
                 <Text style={styles.weatherHeadingSummaryText}>"{this.state.weather.hourly.summary}" ({ this.fahrenheitToCelsius(this.getAverageAverageTemperature()) }°C)</Text>

                </View>


                     <ScrollView>

                     <View style={styles.weatherItem}>
                     <Image source={require('./assets/icons/rain_chance.png')} style={{width: 75, height: 75}}/>
                     <Text style={styles.weatherItemText}> Chance of rain: { Math.round(this.getAveragePrecipitationProbability() * 100) }%</Text>
                     </View>

                     <View style={styles.weatherItem}>
                     <Image source={require('./assets/icons/sunset.png')} style={{width: 75, height: 75}}/>
                     <Text style={styles.weatherItemText}>Sunrise: { this.timeConverterToHours(this.state.weather.daily.data[0].sunriseTime) } Sunset: { this.timeConverterToHours(this.state.weather.daily.data[0].sunsetTime) }</Text>
                     </View>

                     <View style={styles.weatherItem}>
                     <Image source={ this.moonPhaseImage(this.convertMoonPhaseNumberToImageName(this.moonPhase())) } style={{width: 75, height: 75}}/>
                     <Text style={styles.weatherItemText}>{this.convertMoonPhaseNumberToName(this.moonPhase())} ({this.moonPhaseDate(this.dateForRequest(this.state.dateSelected)).getDate() - 1}/{this.moonPhaseDate(this.dateForRequest(this.state.dateSelected)).getMonth() + 1}/{this.moonPhaseDate(this.dateForRequest(this.state.dateSelected)).getFullYear()})</Text>
                     </View>

                     <View style={styles.weatherItem}>
                     <Image source={require('./assets/icons/temperature.png')} style={{width: 75, height: 75}}/>
                     <Text style={styles.weatherItemText}>Low: {this.fahrenheitToCelsius(this.getAverageLow())}°C at { this.timeConverterToHours(this.state.weather.daily.data[0].temperatureLowTime) }, High: {this.fahrenheitToCelsius(this.getAverageHigh())}°C at { this.timeConverterToHours(this.state.weather.daily.data[0].temperatureHighTime) } </Text>
                     </View>

                     <View style={styles.weatherItem}>
                     <Image source={require('./assets/icons/humidity.jpg')} style={{width: 75, height: 75}}/>
                     <Text style={styles.weatherItemText}>Humidity: { this.getAverageHumidity() * 100 }%</Text>
                     </View>

                     <View style={styles.weatherItem}>
                     <Image source={require('./assets/icons/wind-speed.png')} style={{width: 75, height: 75}}/>
                     <Text style={styles.weatherItemText}>Wind speed: {this.getAverageWindSpeed()} mph</Text>
                     </View>

                     <View style={styles.weatherItem}>
                     <Image source={require('./assets/icons/clouds.png')} style={{width: 75, height: 75}}/>
                     <Text style={styles.weatherItemText}>Cloud cover: { this.getAverageCloudCover() * 100 }%</Text>
                     </View>

                      <View style={{height: 500, width: '90%',
                        marginLeft: '5%'}}>
                      <MapView style={styles.map}
                      scrollEnabled={false}
                      toolbarEnabled={false}
                      zoomEnabled={true}
                      zoomControlEnabled={true}
                      region={{
                        latitude: self.state.position[0],
                        longitude: self.state.position[1],
                        latitudeDelta: 1,
                        longitudeDelta: 1
                      }}
                      >

                      <MapView.Marker
                        coordinate={{
                          latitude: self.state.position[0],
                          longitude: self.state.position[1]
                        }}
                        title={'You searched:'}
                        description={`'${this.state.searchedLocation}'`}
                        />

                      </MapView>
                      </View>



                     </ScrollView>


                     <TouchableOpacity onPress={this.toggleModal} style={{justifyContent: 'center', height: '10%'}}>
                     <View style={{justifyContent: 'center'}}>
                       <Image source={require('./assets/darksky.png')} style={{ height: 33.98509187, width: 150, marginLeft: 75 }}/>
                     </View>
                     </TouchableOpacity>

                        </LinearGradient>



                    </Modal>

            ) :

            <View>
            </View>
          }

      </View>
    </ImageBackground>
    );
  }
}
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'stretch',
    marginTop: 45,
    paddingTop: 10,
    backgroundColor: 'transparent'
  },
  resultsWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column'
  },
  weatherSummaryItem: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'white'
  },
  weatherItem: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 15
  },
  weatherHeadingStyle: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column'
  },
  lastWeatherItem: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 15,
    height: 500
  },
  weatherItemText: {
    flex: 1,
    flexWrap: 'wrap',
    paddingLeft: 25,
    fontSize: 18,
    color: 'white'
  },
  weatherSummaryText: {
    flex: 1,
    flexWrap: 'wrap',
    paddingLeft: 25,
    fontSize: 18,
    color: 'white'
  },
  weatherHeadingText: {
    flexWrap: 'wrap',
    paddingLeft: 15,
    fontSize: 18,
    marginBottom: 0,
    paddingBottom: 7,
    fontWeight: 'bold',
    color: 'white'
  },
  infoHeadingText: {
    flexWrap: 'wrap',
    paddingLeft: 20,
    fontSize: 18,
    marginBottom: 0,
    paddingBottom: 7,
    fontWeight: 'bold',
    color: 'white'
  },
  weatherHeadingSummaryText: {
    flexWrap: 'wrap',
    paddingLeft: 15,
    fontSize: 18,
    marginBottom: 0,
    paddingBottom: 7,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'white',
    paddingTop: 8
  },
  innerModal: {
    backgroundColor: 'pink',
    height: '100%',
    borderWidth: 1,
    borderRadius: 15
  },
  buttonContainer: {
    alignItems: 'center',
    height: '25%'
  },
  loadingIndicator: {
    marginTop: '10%',
    height: '25%'
  },
  backgroundStyle: {
    width: '100%',
    height: '100%'
  },
  button: {
    alignItems: 'center',
    position: 'absolute',
    top: '20%',
    height: '100%',
    width: '50%'
  },
  map: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  modal: {
    borderWidth: 0,
    borderRadius: 10
  }
});

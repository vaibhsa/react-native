import React, { Component } from 'react';
import {
  Platform,
  ReactNative,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Picker,
  Alert,
  findNodeHandle,
  BackHandler,
  Keyboard,
  ActivityIndicator,
  Dimensions
} 
from 'react-native';

import Orientation from 'react-native-orientation';

import { Dropdown } from 'react-native-material-dropdown';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import ReusableClass from "../ReusableClass";

import ImagePicker from 'react-native-image-picker';

import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 
'react-native-simple-radio-button';


type Props = {};

export default class DonationGuest extends Component<Props> {

  static navigationOptions = {
    	title: 'Donation Money',
    	headerTintColor: '#f42e78',
      headerStyle: { backgroundColor: '#f8f8f8', borderWidth: 1, borderBottomColor: 'white' },
      headerTitleStyle: { 
        color: '#f42e78', 
        fontSize:20,
        width:Platform.OS === 'ios' ? 'auto' : 180,
        textAlign:Platform.OS === 'ios' ? 'auto' : 'center'
      },
      headerRight:<View />
  };

  constructor(props) {
    super(props);
    this.state = {
      screen: Dimensions.get('window'),
      language:'',
      avatarSource: null,
      uploadPic:0,
      fname:'',
      organizationTo:'',
      mobile:'',
      dAmt:'',
      description:'',
      value:0,
      loading:false,
      payTMValue:0,
      value3:0,
      value3Index:0
    };

    this.inputs = {};
    this.radio_props = [
      {label: 'Paytm', value: 0 },
      {label: 'Debit/Credit Card', value: 1 },
      {label: 'Net Banking', value: 2 }
    ];

    this.options ={};

    obj = new ReusableClass();

    this.focusNextField = this.focusNextField.bind(this);
    this.handleDonateTo = this.handleDonateTo.bind(this);
    this.submitDonation = this.submitDonation.bind(this);
    this.imgPicker = this.imgPicker.bind(this);
  }

  componentWillMount() {
    // The getOrientation method is async. It happens sometimes that
    // you need the orientation at the moment the JS runtime starts running on device.
    // `getInitialOrientation` returns directly because its a constant set at the
    // beginning of the JS runtime.
    const initial = Orientation.getInitialOrientation();
    if (initial === 'PORTRAIT') {
      // do something
    } else {
      // do something else
    }
    // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this))
    // this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this))
  }

  componentDidMount() {
    // this locks the view to Portrait Mode
    // Orientation.lockToPortrait();
    // this locks the view to Landscape Mode
    // Orientation.lockToLandscape();
    // this unlocks any previous locks to all Orientations
    // this.inputs['two'].focus();
    Orientation.unlockAllOrientations();

    Orientation.addOrientationListener(this._orientationDidChange);

    BackHandler.addEventListener('hardwareBackPress', obj.handleBackButton);
  }

  _orientationDidChange = (orientation) => {
    if (orientation === 'LANDSCAPE') {
      // do something with landscape layout
    } else {
      // do something with portrait layout
    }
  }

  componentWillUnmount() {
    Orientation.getOrientation((err, orientation) => {
      console.log(`Current Device Orientation: ${orientation}`);
    });
    // Orientation.unlockAllOrientations();
    // Remember to remove listener
    Orientation.removeOrientationListener(this._orientationDidChange);
    BackHandler.removeEventListener('hardwareBackPress', obj.handleBackButton);
    // this.keyboardDidShowListener.remove()
    // this.keyboardDidHideListener.remove()
  }

  // _keyboardDidShow(){

  // }

  // _keyboardDidHide(){
  //   if(this.state.isModal2Visible){
  //     if(Platform.OS == 'android'){
  //       // Alert.alert(Platform.OS);
  //       this.refs.scroll.scrollToPosition(0, 100)
  //     }
  //   }
  // }

  focusNextField(id) {
    this.inputs[id].focus();
  }


  imgPicker= () => {

    ImagePicker.showImagePicker({title: 'Select Avatar'}, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else {
        let source = { uri: response.uri };
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        this.setState({
          avatarSource: source
        });
      }
    });
  }

  submitDonation(){

    if(this.state.fname =='' || this.state.mobile == '' || this.state.description=='' 
    || this.state.dAmt=='' || this.state.organizationTo== ''){
      Alert.alert('please fill all the fields to continue');
      return;
    }else if(this.state.value3 == 0 && this.state.payTMValue == 0){
      Alert.alert('Are you sure to use Paytm');
      this.state.payTMValue = this.state.payTMValue + 1;
      return;
    }else if(this.state.avatarSource == null && this.state.uploadPic==0){
      this.state.uploadPic = 1;
      Alert.alert(
        'Upload Photo',
        'Are You sure you don\'t want to upload your photo' ,
        [
          {text: 'Yes'},
          {text: 'Upload Photo', onPress: this.imgPicker}
        ],
        { cancelable: true }
      )
      return;
    }
    
    this.setState({loading:true});
    let photo = this.state.avatarSource == null ? 
    'https://shrouded-escarpment-62032.herokuapp.com/uploads/profile.png':this.state.avatarSource.uri;

    // FormData is used to create bundle of multipart/form-data.
    let formdata = new FormData();
    formdata.append("name", this.state.fname)
    formdata.append("donateTo", this.state.organizationTo)
    formdata.append("phone", this.state.mobile)
    formdata.append("donateAmt", this.state.dAmt)
    formdata.append("description", this.state.description)
    formdata.append("paymentOption", this.state.value3)
    formdata.append("profile", 
      {uri: photo, name: 'image.jpg', type: 'multipart/form-data'})

    fetch('https://shrouded-escarpment-62032.herokuapp.com/donate/donate_money',{
    // fetch('http://192.168.1.59:3000/donate/donate_money',{
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formdata
      })
      .then(res =>res.json())
      .then(res =>
        {
          this.setState({
            avatarSource: null,
            fname:'',
            loading:false,
            mobile:'',
            dAmt:'',
            description:'',
            value3:0
          });
          Alert.alert(
            'Received',
            res.message,
            [
              {text: 'OK', onPress: () => this.props.navigation.navigate('tabDonationScreen')},
            ],
            { cancelable: true })
        }
      )
      .catch(err => {
        Alert.alert("There may be internet connection problem")
      })
  }

  handleDonateTo(text){
    // Alert.alert(text);
    this.setState({ organizationTo: text });
    
  }

  onLayout(){
    this.setState({screen: Dimensions.get('window')});
  }

  getOrientation(){
    if (this.state.screen.width > this.state.screen.height) {
      return 'LANDSCAPE';
    }else {
      return 'PORTRAIT';
    }
  }

  getStyle(){
    if (this.getOrientation() === 'LANDSCAPE') {
      return stylesLandscape;
    } else {
      return styles;
    }
  }

    
  render() {
    const resizeMode = 'center';
    const text = 'I am some centered text';
    let data = [{
      value: 'Charity Navigator',
    }, {
      value: 'Bal Basera',
    }, {
      value: 'Charity Foundation',
    },{
      value: 'Helping Hand',
    },{
      value: 'Habitat For Humanity',
    }
    ];
    return (
      <View style={styles.container}>

        <Image style={this.getStyle().logo} onLayout = {this.onLayout.bind(this)}
          source={this.state.avatarSource === null ? require('../../images/imageThumbnail.png'): this.state.avatarSource}/>

        <TouchableOpacity style={styles.buttonContainerThumbnail}
          onPress = {this.imgPicker}>
            <Text style = {styles.buttonTextThumbnail}>Add Photo</Text>
        </TouchableOpacity>  
        <ActivityIndicator size="large" color="#0000ff" 
          style={{opacity: this.state.loading ? 1.0 : 0.0}} animating={true}/>
        <KeyboardAwareScrollView ref='scroll' enableOnAndroid style={this.getStyle().scroll} 
          enableResetScrollToCoords={false} keyboardShouldPersistTaps = 'always'
          onLayout = {this.onLayout.bind(this)}>
           
          <TextInput style={this.getStyle().input1} onLayout = {this.onLayout.bind(this)}
            underlineColorAndroid = 'transparent'
            placeholder = "Enter Full Name"
            placeholderTextColor = "rgba(128,128,128,0.7)"
            autoCapitalize = "none"
            autoCorrect = {false}
            onChangeText = {(fname) => this.setState({fname})}
            value = {this.state.fname}
            blurOnSubmit={ false }
            returnKeyType = "next"
            keyboardType = "default"
            onSubmitEditing = {() => {
              if(this.state.fname==''){
                // emailErr = 'Please enter email';
                Alert.alert('Please enter Full Name')
              }else{
                this.focusNextField('three');     
              }
            }}  
            ref = { input => {
              this.inputs['two'] = input;
            }}>
          </TextInput>

          <TextInput style = {this.getStyle().input1} onLayout = {this.onLayout.bind(this)}
            underlineColorAndroid = 'transparent'
            placeholder = "Enter Mobile Number"
            placeholderTextColor = "rgba(128,128,128,0.9)"
            autoCapitalize = "none"
            autoCorrect = {false}
            value = {this.state.mobile}
            onChangeText = {(mobile) => this.setState({mobile})}
            blurOnSubmit ={(this.state.mobile=='' || this.state.mobile.length != 10) ? false : true }
            returnKeyType = "done"   
            keyboardType = {Platform.OS === 'ios' ? "phone-pad" : "numeric"}                      
            ref= { input => {
              this.inputs['three'] = input;
            }}
            onSubmitEditing = {() => {
              if(this.state.mobile==''){
                // emailErr = 'Please enter email';
                Alert.alert('Please enter mobile Number')
              }else if(this.state.mobile.length != 10){
                Alert.alert('Mobile Number is not valid')
              }
            }}
          ></TextInput>

          <Dropdown 
            label = 'Donate To'
            data = {data}
            onChangeText = {(value, index, data) => 
              this.handleDonateTo(data[index].value)}>
          </Dropdown>

          <TextInput 
            style={this.getStyle().input1} 
            onLayout = {this.onLayout.bind(this)}
            underlineColorAndroid = 'transparent'
            placeholder = "Donation Amount"
            placeholderTextColor = "rgba(128,128,128,0.9)"
            autoCapitalize = "none"
            value = {this.state.dAmt}
            onChangeText = {(dAmt) => this.setState({dAmt})}
            autoCorrect = {false}
            returnKeyType = {Platform.OS === 'ios' ? "done" : "next"}
            blurOnSubmit = {Platform.OS === 'ios' ? (this.state.dAmt=='' ? false : true) : false }   
            keyboardType = {Platform.OS === 'ios' ? "phone-pad" : "numeric"}
            onSubmitEditing = {() => {
              if(this.state.dAmt==''){
                // emailErr = 'Please enter email';
                Alert.alert('Please enter donation amount')
              }else{
                Platform.OS === 'ios' ? '' : this.focusNextField('five');
              }
            }}                      
            ref={ input => {
              this.inputs['four'] = input;
            }}
            >
          </TextInput>  

          <TextInput style = {this.getStyle().input1} onLayout = {this.onLayout.bind(this)}
            underlineColorAndroid = 'transparent'
            placeholder = "Description"
            placeholderTextColor = "rgba(128,128,128,0.7)"
            autoCapitalize = "none"
            autoCorrect = {false}
            value = {this.state.description}
            onChangeText = {(description) => this.setState({description})}
            blurOnSubmit={ (this.state.description=='') ? false : true }
            ref={ input => {
              this.inputs['five'] = input;
            }}
            onSubmitEditing = {() => {
              if(this.state.description==''){
                // emailErr = 'Please enter email';
                Alert.alert('Please enter description')
              }else{
                this.refs.scroll.scrollToPosition(0, 350)
              }  
            }}
            returnKeyType = "done"> 
          </TextInput>   

          <Text style={styles.payOption}>Payment Options</Text>

          <RadioForm formHorizontal={false} style={{marginTop:20}} animation={true} >
            {this.radio_props.map((obj, i) => {
              var onPress = (value, index) => {
                if(Platform.OS == 'ios'){
                  this.refs.scroll.scrollToPosition(0, 350)
                }else{
                  this.refs.scroll.scrollToPosition(0, 400)
                }
                this.setState({
                  value3: value,
                  value3Index: index
                })
              }
              return (
                  <RadioButton style={{alignSelf:'flex-start', marginBottom:20}} labelHorizontal={true} key={i} >
                    {/*  You can set RadioButtonLabel before RadioButtonInput */}
                    <RadioButtonInput
                      obj={obj}
                      index={i}
                      isSelected={this.state.value3Index === i}
                      onPress={onPress}
                      buttonInnerColor={'#f42e78'}
                      buttonOuterColor={this.state.value3Index === i ? '#f42e78' : '#cdcdcc'}
                      buttonSize={20}
                      buttonStyle={{}}
                      buttonWrapStyle={{marginLeft: 10}}/>
                    <RadioButtonLabel
                      obj={obj}
                      index={i}
                      labelHorizontal={true}
                      onPress={onPress}
                      labelStyle={{fontSize: 20, color: '#000000'}}
                      labelWrapStyle={{}} />
                  </RadioButton>
                
                )
            })}
          </RadioForm>

          <TouchableOpacity style={this.getStyle().buttonContainer} 
            onLayout = {this.onLayout.bind(this)} onPress={this.submitDonation} >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>    

        </KeyboardAwareScrollView>
      </View>
    );
  } 
}


const styles = StyleSheet.create({
    container: {
      backgroundColor: '#f8f8f8',
      flex: 1,
      alignItems: 'center',
      padding: 20
    },
    logo: {
      marginTop: 10,
      width: 120,
      height: 120
    },
    input1: {
      width: 300,
      height: 60,
      marginTop: 30,
      borderWidth: 2,
      borderColor: '#e7e7e7',
      borderRadius: 8,
      backgroundColor: '#fff',
    },
    buttonContainer: {
      width: 300,
      height: 60,
      marginTop: 30,	
      backgroundColor: '#f42e78',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginBottom: 30
    },
    buttonText: {
      color: '#FFF',
      fontSize: 20,
      fontWeight: 'bold',
      width:Platform.OS === 'ios' ? 'auto' : 120,
      textAlign:Platform.OS === 'ios' ? 'auto' : 'center'
    },
    buttonContainerThumbnail: {
      width: 300,
      height: 20,
      marginTop: 0,  
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8
    },
    buttonTextThumbnail: {
      color: '#f42e78',
      fontSize: 20,
      fontWeight: 'bold',
      width: Platform.OS === 'ios' ? 'auto' : 180,
      textAlign: Platform.OS === 'ios' ? 'auto' : 'center'
    },
    pickerStyle: {
      marginTop: 30
    },
    scroll: {
      marginTop: 20
    },
    payOption:{
      color: '#000000',
      fontSize: 20,
      fontWeight: 'bold',
      marginTop:20
    }
});

const stylesLandscape = StyleSheet.create(
{
  container: {
    backgroundColor: '#f8f8f8',
    flex: 1,
    alignItems: 'center',
    padding: 20
  },
  logo: { 
    marginTop: 10,
    width: 80,
    height: 80
  },
  viewBtn: {
    flexDirection: 'row',
  },
  input1: {
    width: '100%',
    height: 60,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#e7e7e7',
    borderRadius: 8,
    backgroundColor: '#fff',
  }, 
  buttonContainer: {
    width: '100%',
    height: 60,
    marginTop: 30,  
    backgroundColor: '#f42e78',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 30
  },
  scroll: {
    width: '100%'
  }
});

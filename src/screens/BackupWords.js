/**
 * Copyright (c) Hathor Labs and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { t } from 'ttag';
import QRCode from 'react-native-qrcode-svg';
import CopyClipboard from '../components/CopyClipboard';
import _ from 'lodash';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import NewHathorButton from '../components/NewHathorButton';
import HathorHeader from '../components/HathorHeader';
import FeedbackModal from '../components/FeedbackModal';
import checkIcon from '../assets/images/icCheckBig.png';
import errorIcon from '../assets/images/icErrorBig.png';

import baseStyle from '../styles/init';

import { PRIMARY_COLOR } from '../constants';
import { Strong } from '../utils';




class BackupWords extends React.Component {
  
  /**
   * step {number} Which validation step user is
   * indexes {Array} Array of indexes that will be used to execute the validation
   * wordsOptions {Array} For each step we have some options for the user to choose the correct word
   * modal {FeedbackModal} modal to display. If null, do not display
   */
  state = {
    step: 0,
    indexes: [],
    wordOptions: [],
    modal: null,
  };

  


  style = Object.assign({}, baseStyle, StyleSheet.create({
    footerView: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    past: {
      backgroundColor: '#000',
    },
    current: {
      backgroundColor: PRIMARY_COLOR,
    },
    future: {
      backgroundColor: '#000',
      opacity: 0.3,
    },
    lastView: {
      marginRight: 0,
    },
    button: {
      marginBottom: 16,
    },
    wrapper: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 32,
      borderWidth: 1.5,
      borderColor: '#e5e5ea',
      borderRadius: 8,
      marginBottom: 32,
    },
    qrcodeWrapper: {
      padding: 24,
      flex: 1,
      marginTop: 32,
    },
    buttonContainer: {
      flex: 1,
      alignSelf: 'stretch',
      alignItems: 'center',
      paddingVertical: 16,
    },
    leftButtonBorder: {
      borderRightWidth: 1.5,
      borderColor: '#eee',
    },
    title: {
      alignItems: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      marginLeft: 24
    },
    text: {
      fontSize: 16,
      marginLeft: 24
    }
  }));

  



  // Array of words shown on the previous screen
  words = null;

  /**
   * Expects 'words' as navigation parameter with all generated words as a string separated by space
   */
  constructor(props) {
    super(props);

    const paramWords = this.props.navigation.getParam('words')?.split(' ') ?? [];

    this.words = paramWords.map((word, id) => ({ word, id }));
  }

  componentDidMount() {
    // Get 5 random indexes of word to check backup
    const indexesArr = Array(24).fill().map((v, i) => i + 1);
    const indexesToBackup = _.shuffle(indexesArr).slice(0, 5);
    this.setState({ indexes: indexesToBackup }, () => {
      this.updateWordsShownOnScreen();
    });
  }

  /**
   * Update state with options to be shown to the user depending on the step
   * If the step is the word in position 4, we must show the words in position 2, 3, 4, 5, 6
   * If we get one of the corner cases
   * (positions 1, 2, 23, or 24 we expand to the side we still have words) e.g., if we want to
   * validate word in position 2, we must have 5 options.
   * Positions 1, 2, 3, 4, 5 (the position 0 is substituted by position 5)
   */
  updateWordsShownOnScreen = () => {
    const index = this.state.indexes[this.state.step] - 1;
    let optionsStartIndex = index - 2;
    let optionsEndIndex = index + 2;

    // If index is 0 or 1, startIndex would be negative
    // So we set start to 0 and end to 4
    if (optionsStartIndex < 0) {
      optionsStartIndex = 0;
      optionsEndIndex = optionsStartIndex + 4;
    }

    // If index is 22 or 23, endIndex would be greater than the max
    // So we set to the max and decrease the startIndex
    const maxIndex = this.words.length - 1;
    if (optionsEndIndex > maxIndex) {
      optionsEndIndex = maxIndex;
      optionsStartIndex = maxIndex - 4;
    }

    const options = this.words.slice(optionsStartIndex, optionsEndIndex + 1);
    this.setState({ wordOptions: _.shuffle(options) });
  }

  render() {
    // This is used to set the width of the address wrapper view
    // For some reason I was not being able to set as 100%, so I had to use this
    const { height, width } = Dimensions.get('window');

    const addressWrapperStyle = StyleSheet.create({
      style: {
        padding: 16,
        borderBottomWidth: 1.5,
        borderTopWidth: 1.5,
        borderColor: '#e5e5ea',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: width - 70,
      },
    });

    const renderQrCodeWords = () => {


      let myWords = "";

      const getWords = Array.from(this.words.values());

      for (let i=0; i<getWords.length; i++){
        myWords = myWords + (getWords[i]["word"]) + " ";
      }

      return (
      <View style={this.style.wrapper}>
      <View style={this.style.qrcodeWrapper}>
        <QRCode value={myWords} size={height < 650 ? 160 : 250} />
      </View>
      <View style={addressWrapperStyle.style}>
        <CopyClipboard
          text={myWords}
          textStyle={{ fontSize: height < 650 ? 13 : 16 }}
        />
      </View>
      </View>
      );};

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <HathorHeader
          onBackPress={() => this.props.navigation.goBack()}
        />
        <View style={[this.style.container, { flexDirection: 'column', justifyContent: 'center' }]}>
          <View >
            <Text style={this.style.title}>{t`Save your qrcode,`}</Text>
            <Text style={this.style.text}>
              {t`it's on your word list:`}
            </Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
            {renderQrCodeWords()}
          </View>

          <NewHathorButton
              title={t`Next`}
              // disabled={!this.state.address}
              onPress={() => this.props.navigation.navigate('ChoosePinScreen', { words: this.props.navigation.getParam('words') })}
          />

          
        </View>
      </SafeAreaView>
    );
  }
}

export default BackupWords;

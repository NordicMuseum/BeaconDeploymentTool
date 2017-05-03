// @flow
import React, { Component } from 'react';
import {
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { List } from 'immutable';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import type {
  BeaconType,
  BeaconIDType,
  UpdateBeaconType,
  RecreateBeaconType,
  DeleteBeaconType,
} from '../actions/beacons';
import { Beacon } from '../actions/beacons';

import {
  activeColor,
  screenBackgroundColor,
  headingTextSize,
  textSupportingColor,
  textSize,
  textColor,
  listSeparatorColor,
  listHeaderColor,
} from '../styles';
import { paramsToProps } from '../utilities';

const styles = StyleSheet.create({
  container: {
    backgroundColor: screenBackgroundColor,
  },
  contentContainer: {
    flexDirection: 'column',
    padding: 10,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowHeaderText: {
    fontSize: headingTextSize,
    color: textSupportingColor,
  },
  rowTitleItem: {
    flex: 0.3,
    alignItems: 'flex-start',
  },
  rowTitleText: {
    fontSize: textSize,
    color: textColor,
  },
  rowDataItem: {
    flex: 0.7,
    alignItems: 'flex-end',
  },
  rowDataText: {
    fontSize: textSize,
    color: activeColor,
  },
  rowDataEditableText: {
    textAlign: 'right',
  },
  rowListHeader: {
    backgroundColor: listHeaderColor,
    // TODO: Fix this latter...
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  rowListText: {
    fontSize: textSize,
  },
  removeButton: {
    borderColor: activeColor,
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 15,
  },
  removeButtonTitle: {
    fontSize: textSize,
    color: activeColor,
  },
});

class ScreenBeaconInfo extends Component {
  static navigationOptions = ({ navigation }) => {
    const { beaconUuid, deleteBeacon } = navigation.state.params;

    const disableDelete = !beaconUuid;
    const deleteBeaconAction = () => {
      Alert.alert(
        'Delete Beacon',
        'Are you sure you want to delete this beacon? This action cannot be undone.',
        [
          {
            text: 'Delete',
            onPress: () => {
              deleteBeacon(beaconUuid);
            },
            style: 'destructive',
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: false },
      );
    };

    const deleteButton = (
      <Button
        title="Delete"
        color={activeColor}
        disabled={disableDelete}
        onPress={deleteBeaconAction}
      />
    );

    const screenTitle = navigation.state.params.screenTitle || 'Beacon Info';
    return {
      title: screenTitle,
      headerRight: deleteButton,
    };
  };

  constructor(props) {
    super(props);

    this.updateState.bind(this);
    this.updateBeacon.bind(this);

    this.removeListItem.bind(this);

    this.updateHeader.bind(this);
    this.renderList.bind(this);

    if (props.beaconUuid) {
      const beacon = props.allBeacons.get(props.beaconUuid);
      this.state = {
        name: beacon.name,
        uuid: beacon.uuid,
        floor: beacon.floor,
        regions: beacon.regions,
        blocks: beacon.blocks,
      };
    } else {
      this.state = {
        name: 'Unnamed',
        uuid: 'None',
        floor: 'Unassigned',
        regions: List(),
        blocks: List(),
      };
    }
  }

  state: {
    prevUuid?: BeaconIDType,
    name: string,
    uuid: BeaconIDType,
    floor: string,
    regions: List<BeaconIDType>,
    blocks: List<BeaconIDType>,
  };

  componentWillReceiveProps(nextProps) {
    const beacon: BeaconType = nextProps.allBeacons.get(this.state.uuid);

    if (beacon) {
      const prevUuid = this.state.prevUuid;
      this.setState(
        () => {
          return {
            prevUuid: null,
            name: beacon.name,
            uuid: beacon.uuid,
            floor: beacon.floor,
            regions: beacon.regions,
            blocks: beacon.blocks,
          };
        },
        () => {
          if (nextProps.screenTitle !== beacon.name || prevUuid != null) {
            this.updateHeader(beacon.name, beacon.uuid);
          }
        },
      );
    }
  }

  props: {
    screenTitle: string, // eslint-disable-line react/no-unused-prop-types
    navigation: any,
    beaconUuid: BeaconIDType,
    allBeacons: Array<BeaconType>,
    updateBeacon: UpdateBeaconType,
    recreateBeacon: RecreateBeaconType,
    deleteBeacon: DeleteBeaconType,
  };

  updateHeader(name, uuid) {
    this.props.navigation.setParams({
      screenTitle: name,
      beaconUuid: uuid,
      deleteBeacon: this.props.deleteBeacon,
    });
  }

  updateState(key, value) {
    this.setState(() => {
      const obj = {};
      obj[key] = value;

      if (key === 'uuid' && this.state.prevUuid == null) {
        obj.prevUuid = this.state.uuid;
      }

      return Object.assign({}, this.state, obj);
    });
  }

  updateBeacon(key) {
    const newBeacon = Beacon({
      name: this.state.name,
      uuid: this.state.uuid,
      floor: this.state.floor,
      regions: this.state.regions,
      blocks: this.state.blocks,
    });

    if (key === 'uuid') {
      this.props.recreateBeacon(newBeacon, this.state.prevUuid);
    } else {
      this.props.updateBeacon(newBeacon);
    }
  }

  removeListItem(list, listItem) {
    let newList = list === 'regions' ? this.state.regions : this.state.blocks;

    const indexToRemove = newList.indexOf(listItem);
    if (indexToRemove === -1) {
      return;
    }

    newList = newList.delete(indexToRemove);

    const newBeacon = Beacon({
      name: this.state.name,
      uuid: this.state.uuid,
      floor: this.state.floor,
      regions: list === 'regions' ? newList : this.state.regions,
      blocks: list === 'blocks' ? newList : this.state.blocks,
    });

    this.props.updateBeacon(newBeacon);
  }

  renderList(listData) {
    return listData.toArray().map((datum, index, array) => {
      const lastItem = index === array.length - 1;

      return (
        <View
          key={datum}
          style={[
            styles.row,
            lastItem
              ? { marginBottom: 10 }
              : {
                height: 45,
                borderBottomColor: listSeparatorColor,
                borderBottomWidth: 1,
              },
          ]}
        >
          <View style={styles.rowTitleItem}>
            <Text style={styles.rowListText}>{datum}</Text>
          </View>
        </View>
      );
    });
  }

  render() {
    const editListButton = (editMessage, onPress) => {
      return (
        <TouchableOpacity onPress={onPress}>
          <Text style={{ color: activeColor, fontSize: textSize }}>
            {editMessage}
          </Text>
        </TouchableOpacity>
      );
    };

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.row}>
            <View style={styles.rowTitleItem}>
              <Text style={styles.rowHeaderText}>Info</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowTitleItem}>
              <Text style={styles.rowTitleText}>Name</Text>
            </View>
            <TextInput
              style={[styles.rowDataItem, styles.rowDataText, styles.rowDataEditableText]}
              returnKeyType={'done'}
              onChangeText={(text) => {
                this.updateState('name', text);
              }}
              onBlur={() => {
                this.updateBeacon();
              }}
              value={this.state.name}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowTitleItem}>
              <Text style={styles.rowTitleText}>ID</Text>
            </View>
            <TextInput
              style={[styles.rowDataItem, styles.rowDataText, styles.rowDataEditableText]}
              returnKeyType={'done'}
              onChangeText={(text) => {
                this.updateState('uuid', text);
              }}
              onBlur={() => {
                this.updateBeacon('uuid');
              }}
              value={this.state.uuid}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowTitleItem}>
              <Text style={styles.rowTitleText}>Floor</Text>
            </View>
            <TextInput
              style={[styles.rowDataItem, styles.rowDataText, styles.rowDataEditableText]}
              returnKeyType={'done'}
              onChangeText={(text) => {
                this.updateState('floor', text);
              }}
              onBlur={() => {
                this.updateBeacon();
              }}
              value={this.state.floor}
            />
          </View>
          <View style={[styles.row, styles.rowListHeader]}>
            <View style={styles.rowTitleItem}>
              <Text style={styles.rowHeaderText}>Regions</Text>
            </View>
            <View style={styles.rowDataItem}>
              {editListButton('Edit Regions', () => {
                console.log('Edit Regions');
              })}
            </View>
          </View>
          {this.renderList(this.state.regions, 'regions')}
          <View style={[styles.row, styles.rowListHeader]}>
            <View style={styles.rowTitleItem}>
              <Text style={styles.rowHeaderText}>Blocks</Text>
            </View>
            <View style={styles.rowDataItem}>
              {editListButton('Edit Blocks', () => {
                console.log('Edit Blocks');
              })}
            </View>
          </View>
          {this.renderList(this.state.blocks, 'blocks')}
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    );
  }
}

export default paramsToProps(ScreenBeaconInfo);

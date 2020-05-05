// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React, { useContext, useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  Platform,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import useIsMounted from 'ismounted';
import Moment from 'moment';

// load contexts
import MainContext from '../../../contexts/MainContext';

// load settings
import I18n from '../../../locales/locales';
import theme from '../../../themes/themes.default';
import s from '../../../themes/styles';

// load helpers
import ColorsHelper from '../../../helpers/Colors.helpers';

// load pages
import navpages from '../../AppMain/components/AppNavigator.pages';

// load components
import ButtonTouch from '../../ButtonTouch/components/ButtonTouch';

// load images
const imageEdit = require('../../../images/edit.png');
const imageDelete = require('../../../images/delete.png');

/**
 * component
 */
export default function Points() {
  const { state } = useContext(MainContext);
  const { db } = state;
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const isMounted = useIsMounted();

  // states
  const [isloading, setIsloading] = useState(true);
  const [forcerefresh, setForcerefresh] = useState(true);
  const [listpoints, setListpoints] = useState(null);
  const [selectedpointsid, setSelectedpointsid] = useState([]);
  const [roundid] = useState(route.params.roundid);
  const [playerid] = useState(route.params.playerid);
  const [canedit] = useState(route.params.canedit);

  // effects - request refresh
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (route.params?.refresh) {
      setForcerefresh(!forcerefresh);
    }
  }, [route.params?.refresh]);

  // effects - page load
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (isFocused) {
      const objfind = db.Rounds.find(roundid);
      // load games list
      setListpoints(
        objfind.points
          .filter((point) => point.player?.id === playerid)
          .map((row) => ({
            rowid: row.id,
            row
          }))
          .sort((a, b) => ((a.row.date > b.row.date) ? -1 : 1))
      );
    }
  }, [forcerefresh, isFocused]);

  // effects - reset loading
  useEffect(() => {
    if (!isMounted.current) { return; }
    if (isloading) {
      setIsloading(false);
    }
  }, [isloading]);

  /**
   * point row
   * @param {object} param0
   */
  function PointRow({ item }) {
    const {
      rowid,
      row
    } = item;
    const selected = selectedpointsid.includes(rowid);
    const color = ColorsHelper.hashColor(row.player.id);
    const pointisplus = row.point >= 0;
    return (
      <TouchableOpacity
        key={rowid}
        style={[selected ? s.listrowselected : s.listrow, { borderColor: color }]}
        onPress={() => {
          if (canedit) {
            if (selectedpointsid.length > 0) {
              setSelectedpointsid([]);
            } else {
              navigation.navigate(
                navpages.Point,
                {
                  id: rowid, roundid, pointisplus, playerid
                }
              );
            }
          }
        }}
        onLongPress={() => (canedit
          ? setSelectedpointsid(selected ? [] : rowid)
          : null)}
      >
        <View style={s.listrowcontent}>
          <View style={[
            s.listrowtextview,
            selected ? s.listrowtextviewselected : null]}
          >
            <Text numberOfLines={1} style={[s.listrowtexttext, styles.pointtext]}>
              {row.point}
            </Text>
            <View style={s.listrowtextviewsub}>
              <View style={s.listrowtextviewsubview}>
                <Text style={s.listrowtextviewsubtext}>{Moment(row.date).format('LL LT')}</Text>
              </View>
            </View>
          </View>
          {selected
            ? (
              <View style={s.listrowactionsview}>
                <ButtonTouch
                  title={I18n.t('appmain.buttonedit')}
                  backgroundColor={theme.COLOR_BUTTONINROW_BACKGROUNDCOLOR}
                  color={theme.COLOR_BUTTONINROW_COLOR}
                  imageLeft={imageEdit}
                  fontSize={14}
                  paddingText={5}
                  paddingImage={5}
                  onPress={() => {
                    setSelectedpointsid([]);
                    navigation.navigate(
                      navpages.Point,
                      {
                        id: rowid, roundid, pointisplus, playerid, isediting: true
                      }
                    );
                  }}
                />
                <ButtonTouch
                  title={I18n.t('appmain.buttondelete')}
                  backgroundColor={theme.COLOR_BUTTONINROW_BACKGROUNDCOLOR}
                  color={theme.COLOR_BUTTONINROW_COLOR}
                  imageLeft={imageDelete}
                  fontSize={14}
                  paddingText={5}
                  paddingImage={5}
                  onPress={() => {
                    Alert.alert(
                      I18n.t('appmain.alertdeletetitle'),
                      I18n.t('points.alertdeletepointmessage'),
                      [
                        {
                          text: I18n.t('appmain.buttoncancel'),
                          style: 'cancel'
                        },
                        {
                          text: I18n.t('appmain.buttonok'),
                          onPress: () => {
                            db.Points.remove(rowid);
                            setForcerefresh(!forcerefresh);
                            setSelectedpointsid([]);
                          }
                        },
                      ]
                    );
                  }}
                />
              </View>
            )
            : null}
        </View>
      </TouchableOpacity>
    );
  }

  // loader
  if (isloading) {
    return (
      <View style={s.container}>
        <View style={s.loadingcontainer}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <View style={s.listcontainer}>
        <FlatList
          data={listpoints}
          renderItem={({ item }) => (item.row.isValid() ? <PointRow item={item} /> : null)}
          keyExtractor={(item) => item.rowid}
          ListEmptyComponent={(
            <Text style={s.emptytext}>
              {I18n.t('points.emptypointslist')}
            </Text>
              )}
          ListHeaderComponent={(
            <View style={s.listheader} />
              )}
          ItemSeparatorComponent={() => <View style={s.listrowseparator} />}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * styles
 */
const styles = StyleSheet.create({
  pointtext: {
    fontSize: 22,
    paddingLeft: 10
  }
});

// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import React, { useContext, useState, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import useIsMounted from 'ismounted';

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
const imageAdd = require('../../../images/add.png');
const imageEdit = require('../../../images/edit.png');
const imageDelete = require('../../../images/delete.png');

/**
 * component
 */
export default function Games() {
  const { state } = useContext(MainContext);
  const { db } = state;
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const isMounted = useIsMounted();

  // states
  const [isloading, setIsloading] = useState(true);
  const [forcerefresh, setForcerefresh] = useState(true);
  const [listgames, setListgames] = useState(null);
  const [selectedgamesid, setSelectedgamesid] = useState([]);

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
      // load games list
      setListgames(
        db.Games.list()
          .map((row) => ({
            rowid: row.id,
            row,
            name: row.name
          }))
          .sort((a, b) => ((a.row.name > b.row.name) ? 1 : -1))
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
   * game row
   * @param {object} param0
   */
  function GameRow({ item }) {
    const {
      rowid,
      row
    } = item;
    const selected = selectedgamesid.includes(rowid);
    const color = ColorsHelper.hashColor(rowid);
    return (
      <TouchableOpacity
        key={rowid}
        style={[selected ? s.listrowselected : s.listrow, { borderColor: color }]}
        onPress={() => {
          if (selectedgamesid.length > 0) {
            setSelectedgamesid([]);
          } else {
            navigation.navigate(
              navpages.Game,
              { id: rowid }
            );
          }
        }}
        onLongPress={() => setSelectedgamesid(selected ? [] : rowid)}
      >
        <View style={s.listrowcontent}>
          <View style={[s.listrowcolor, { backgroundColor: color }]} />
          <View style={[
            s.listrowtextview,
            selected ? s.listrowtextviewselected : null]}
          >
            <Text numberOfLines={1} style={s.listrowtexttext}>
              {row.name}
            </Text>
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
                    setSelectedgamesid([]);
                    navigation.navigate(
                      navpages.Game,
                      { id: rowid, isediting: true }
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
                      I18n.t('games.alertdeletegamemessage'),
                      [
                        {
                          text: I18n.t('appmain.buttoncancel'),
                          style: 'cancel'
                        },
                        {
                          text: I18n.t('appmain.buttonok'),
                          onPress: () => {
                            db.Games.removeAll(rowid);
                            setForcerefresh(!forcerefresh);
                            setSelectedgamesid([]);
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
    <View style={s.container}>
      <View style={s.listcontainer}>
        <FlatList
          data={listgames}
          renderItem={({ item }) => (item.row.isValid() ? <GameRow item={item} /> : null)}
          keyExtractor={(item) => item.rowid}
          ListEmptyComponent={(
            <Text style={s.emptytext}>
              {I18n.t('games.emptygameslist')}
            </Text>
          )}
          ListHeaderComponent={(
            <View style={s.listheader}>
              <ButtonTouch
                title={I18n.t('games.buttonaddgame')}
                backgroundColor={theme.COLOR_BUTTONADD_BACKGROUNDCOLOR}
                color={theme.COLOR_BUTTONADD_COLOR}
                imageLeft={imageAdd}
                onPress={() => navigation.navigate(
                  navpages.Game,
                  { id: null }
                )}
              />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={s.listrowseparator} />}
        />
      </View>

    </View>
  );
}

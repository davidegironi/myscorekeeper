// Copyright (c) 2020 Davide Gironi
// Please refer to LICENSE file for licensing information.

import {
  StyleSheet,
} from 'react-native';

// load settings
import theme from './themes.default';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: theme.COLOR_BACKGROUNDCOLOR
  },
  loadingcontainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center'
  },
  listcontainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginBottom: 10
  },
  listcontainernoflex: {
    justifyContent: 'flex-start',
    marginBottom: 10
  },
  listemptytext: {
    textAlign: 'center'
  },
  listheader: {
    paddingBottom: 10
  },
  listheaderinfoview: {
    paddingTop: 10
  },
  listheaderinfotext: {
    textAlign: 'center'
  },
  listrow: {
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: theme.COLOR_ROW_BACKGROUNDCOLOR
  },
  listrowselected: {
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: theme.COLOR_ROW_BACKGROUNDCOLOR
  },
  listrowseparator: {
    marginVertical: 3,
    borderBottomColor: theme.COLOR_FLATLIST_SEPARATORCOLOR,
    borderBottomWidth: 1,
  },
  listrowcontent: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  listrowcolor: {
    width: 40,
    alignContent: 'center',
    justifyContent: 'center'
  },
  listrowcolorimage: {
    width: 40,
    height: 40,
    resizeMode: 'contain'
  },
  listrowtextview:
  {
    flex: 1,
    paddingLeft: 10,
    marginRight: 0,
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'center'
  },
  listrowtextviewselected:
  {
    marginRight: -100,
  },
  listrowtextviewsub:
  {
    paddingTop: 5,
    flexWrap: 'wrap',
    flexDirection: 'row'
  },
  listrowtextviewsubview: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  listrowtextviewsubtext: {
    padding: 5,
    fontWeight: 'bold'
  },
  listrowtextviewsubitems: {
    flexDirection: 'row'
  },
  listrowtextviewsubitemsdotview:
  {
    width: 10,
    justifyContent: 'center'
  },
  listrowtextviewsubitemsdotimage: {
    height: 12,
    width: 12,
    resizeMode: 'contain'
  },
  listrowtextviewsubitemstext: {
    padding: 5
  },
  listrowtexttext:
  {
    fontSize: 18,
    textAlign: 'left',
    fontWeight: 'bold'
  },
  listrowactionsview:
  {
    backgroundColor: theme.COLOR_ROWACTIONS_BACKGROUNDCOLOR,
    width: 100,
    margin: 5,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  listtoolscontainer: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    marginTop: 5
  },
  listtoolsbuttonscontainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  listtoolsbuttoncontainer: {
    width: 120
  },
  listtoolstoolscontainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.COLOR_TOOLS_BORDERCOLOR,
    padding: 10
  },
  listsortcontainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  listsorttext: {
    paddingRight: 10,
    fontWeight: 'bold'
  },
  listsortitemtext: {
    paddingLeft: 10
  },
  listrowtextviewsubitemspointsbutton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listrowtextviewsubitemspointsbuttonimage: {
    height: 30,
    resizeMode: 'contain',
    tintColor: theme.COLOR_BUTTONPOINTS_COLOR
  },
  formcontainer: {
    paddingBottom: 10
  },
  formrow: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: 5
  },
  formlabel: {
    justifyContent: 'center'
  },
  formlabeltext: {
    fontWeight: 'bold',
    paddingBottom: 2
  },
  forminputtextinput: {
    padding: 10
  },
  forminputtextinputenabled: {
    color: theme.COLOR_TEXTINPUT_COLOR,
    backgroundColor: theme.COLOR_TEXTINPUT_BACKGROUNDCOLOR
  },
  forminputtextinputdisabled: {
    color: theme.COLOR_TEXTINPUT_DISABLEDCOLOR,
    backgroundColor: theme.COLOR_TEXTINPUT_DISABLEDBACKGROUNDCOLOR
  },
  formswitchcontainer: {
    flexDirection: 'row',
    paddingLeft: 10
  },
  formswitchinfo: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 10
  },
  formswitchswitch: {
    marginRight: 15,
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]
  },
  formbutton: {
    marginTop: 5
  },
  gametoolcontainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  gametooltextcontainer: {
    flex: 1
  },
  gametooltext:
  {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  gametoolbutton:
  {
    width: 50
  },
  gametoolbuttonimage:
  {
    height: 40,
    width: 40
  }
});

export default styles;

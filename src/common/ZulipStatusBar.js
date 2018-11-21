/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import Color from 'color';

import type { Dimensions, ThemeType } from '../types';
import { DEFAULT_TITLE_BACKGROUND_COLOR, getTitleBackgroundColor } from '../title/titleSelectors';
import { foregroundColorFromBackground } from '../utils/color';
import { getSession, getSettings } from '../selectors';

type BarStyle = $PropertyType<$PropertyType<StatusBar, 'props'>, 'barStyle'>;

export const getStatusBarStyle = (backgroundColor: string, theme: ThemeType): BarStyle => {
  if (backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR) {
    return theme === 'night' ? 'light-content' : 'dark-content';
  }
  return foregroundColorFromBackground(backgroundColor) === 'white'
    ? 'light-content'
    : 'dark-content';
};

export const getStatusBarColor = (backgroundColor: string, theme: ThemeType): string =>
  backgroundColor === DEFAULT_TITLE_BACKGROUND_COLOR
    ? theme === 'night'
      ? '#212D3B'
      : 'white'
    : backgroundColor;

type Props = {
  barStyle?: BarStyle,
  hidden: boolean,
  theme: ThemeType,
  backgroundColor: string,
  safeAreaInsets: Dimensions,
  orientation: string,
};

/**
 * Controls the status bar settings depending on platform
 * and current navigation position.
 * If narrowed to a stream or topic the color of the status bar
 * matches that of the stream.
 *
 * @prop [narrow] - Currently active narrow.
 */
class ZulipStatusBar extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    hidden: false,
  };

  render() {
    const { theme, backgroundColor, hidden, barStyle, safeAreaInsets, orientation } = this.props;
    const style = { height: hidden ? 0 : safeAreaInsets.top, backgroundColor };
    const statusBarStyle = !barStyle ? getStatusBarStyle(backgroundColor, theme) : barStyle;
    const statusBarColor = getStatusBarColor(backgroundColor, theme);
    return (
      orientation === 'PORTRAIT' && (
        <View style={style}>
          <StatusBar
            animated
            showHideTransition="slide"
            hidden={hidden && Platform.OS !== 'android'}
            backgroundColor={Color(statusBarColor).darken(0.1)}
            barStyle={statusBarStyle}
          />
        </View>
      )
    );
  }
}

export default connect((state, props) => ({
  safeAreaInsets: getSession(state).safeAreaInsets,
  theme: getSettings(state).theme,
  backgroundColor: props.backgroundColor || getTitleBackgroundColor(props.narrow)(state),
  orientation: getSession(state).orientation,
}))(ZulipStatusBar);

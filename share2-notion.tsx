import React from 'react';
import {Card, Input, Layout} from '@ui-kitten/components';
import {View, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native-gesture-handler';

import {useNavigation} from '@react-navigation/native';

const NotionStack = createStackNavigator();
export function Share2Notion() {
  return (
    <NotionStack.Navigator initialRouteName="Default">
      <NotionStack.Screen name="Default" component={Share2NotionDefault} />
      <NotionStack.Screen
        name="NotionPostSelect"
        component={NotionPostSelect}
      />
    </NotionStack.Navigator>
  );
}

function Share2NotionDefault() {
  const navigation = useNavigation();

  function onChangePost() {
    navigation.navigate('NotionPostSelect');
    console.info('aaa');
  }
  return (
    <Layout>
      <Card>
        <Input multiline={true} textStyle={{minHeight: 64}} />
      </Card>
      <Card>
        <TouchableOpacity onPress={onChangePost}>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 0.3}}>
              <Text>Add to</Text>
            </View>
            <View style={{flex: 0.7}}>
              <Text>A post</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onChangePost}>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 0.3}}>
              <Text>Workspace</Text>
            </View>
            <View style={{flex: 0.7}}>
              <Text>My Workspace</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Layout>
  );
}

function NotionPostSelect() {
  return <Text>Select post from notion.</Text>;
}

import * as eva from '@eva-design/eva';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {ApplicationProvider, Text} from '@ui-kitten/components';
import React, {useEffect} from 'react';
import {SafeAreaView, ScrollView, StatusBar, StyleSheet} from 'react-native';
import RNFS from 'react-native-fs';
import 'react-native-gesture-handler';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {handleShareFile} from './handle-share-file';
import {Share2Notion} from './share2-notion';

const Stack = createStackNavigator();

const App = () => {
  React.useEffect(() => {
    ReceiveSharingIntent.getReceivedFiles(handleShareFile, (error: Error) => {
      console.error(error);
    });

    return () => {
      ReceiveSharingIntent.clearReceivedFiles();
    };
  }, []);

  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}></ScrollView>
      </SafeAreaView>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Default">
          <Stack.Screen
            name="Notion"
            component={Share2Notion}
            options={{title: 'Share to Notion'}}
          />
          <Stack.Screen
            name="Default"
            component={DevShortcut}
            options={{title: 'Dev shortcut'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ApplicationProvider>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;

function DevShortcut() {
  const {navigate} = useNavigation();

  useEffect(() => {
    // navigate('Notion', {
    //   screen: 'NotionPostSelect',
    // });
    navigate('Notion', {
      screen: 'Default',
      params: {
        selectedItem: {
          record: {
            collectionId: 'ef3c75e8-517e-4b8f-b602-93423d607f7b',
            id: '6daf797c-a341-4a81-8acb-2f94877860b5',
            name: 'Mathematic thinkings coursera',
            role: 'editor',
            table: 'block',
            type: 'collection_view',
          },
        },
      },
    });
  }, []);

  return (
    <React.Fragment>
      <Text>Dev...</Text>
    </React.Fragment>
  );
}

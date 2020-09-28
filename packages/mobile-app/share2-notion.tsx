import {
  useNavigation,
  StackActions,
  useRoute,
  BaseRouter,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  Button,
  Card,
  Input,
  Layout,
  List,
  ListItem,
  Text,
} from '@ui-kitten/components';
import {debounce} from 'lodash';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {sharedObj} from './handle-share-file';
import {getSuggestionList, notionQSRecord, sendNote} from './util';

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

function Share2NotionDefault({
  route,
}: {
  route: {
    params: {
      sharing?: sharedObj[];
      [key: string]: any;
    };
  };
}) {
  const navigation = useNavigation();

  const [description, setDescription] = React.useState('default title...');

  React.useEffect(() => {
    if (route.params.sharing) {
      let subject = route.params.sharing[0].subject;
      let text = route.params.sharing[0].text;
      setDescription([subject, text].filter(i=> i).join('\n'));
    }
  }, []);

  function onChangePost() {
    navigation.navigate('NotionPostSelect');
  }

  let addToItem = {
    name: 'please select...',
    id: 0,
  };

  console.info({route});

  if (route.params?.selectedItem) {
    addToItem = route.params?.selectedItem.record;
  }

  function push2Notion() {
    sendNote({
      text: description,
      service: 'notion',
      payload: {isWebLink: false, addToItem},
    }).then(() => {
      navigation.goBack();
    });
  }

  return (
    <Layout style={{padding: 5}}>
      <Card style={{marginBottom: 5}}>
        <Input
          multiline={true}
          value={description}
          textStyle={{minHeight: 64}}
          onChangeText={(t) => setDescription(t)}
        />
        <TouchableOpacity onPress={onChangePost}>
          <View style={{flexDirection: 'row', margin: 5}}>
            <View style={{flex: 0.3}}>
              <Text appearance="hint">Add to</Text>
            </View>
            <View style={{flex: 0.7}}>
              <Text category="s1">{addToItem.name}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <Button style={{marginTop: 20}} onPress={push2Notion}>
          SUBMIT
        </Button>
      </Card>
    </Layout>
  );
}

function NotionPostSelect({route}) {
  const [suggestionList, setSuggestionList] = React.useState<any[]>([]);
  const navigation = useNavigation();

  console.info({route});

  React.useEffect(() => {
    getSuggestionList('mathematic').then((results) => {
      setSuggestionList(results);
    });
  }, []);

  let debounceQuery = React.useCallback(
    debounce((text) => {
      getSuggestionList(text).then((result) => {
        setSuggestionList(result);
      });
    }, 500),
    [],
  );

  function onChangeText(text: string) {
    debounceQuery(text);
  }

  function onSelectItem(item: notionQSRecord) {
    navigation.dispatch(
      StackActions.replace('Notion', {
        screen: 'Default',
        params: {
          selectedItem: item,
        },
      }),
    );
  }

  function renderItem(item: any) {
    let {item: data} = item;
    return (
      <ListItem
        key={data.record.id}
        title={data.record.name}
        onPress={() => onSelectItem(data)}
        description={data.ancestors
          .map((i: notionQSRecord) => i.name)
          .join(' / ')}></ListItem>
    );
  }

  return (
    <Layout style={styles.root}>
      <Input
        style={styles.input}
        placeholder="search..."
        onChangeText={onChangeText}
      />
      <List
        style={styles.listContainer}
        data={suggestionList}
        renderItem={renderItem}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  input: {
    flexGrow: 0,
    flex: 0,
  },
  listContainer: {
    flex: 1,
  },
});

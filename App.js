import React, { useState, useEffect } from "react";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import Moment from 'moment';

import {
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList
} from "react-native";

import moment from "moment";

export default function App() {

  const local = 'pt-br';

  Moment.locale('pt-br');

  const [task, setTask] = useState([]);

  const estadoInicial = {
    name: '',
    priority: '',
    date: new Date(),
    done: false,
  };

  const [newTask, setNewTask] = useState(estadoInicial);

  function resetForm() {
    setNewTask(estadoInicial)
  }

  // const [date, setDate] = useState(new Date(1598051730000));

  const [show, setShow] = useState(false);

  // const dateCaptured = (event, selectDate) => {
  //   setDate(selectDate);
  //   setShow(false)
  // }

  const showDatePicker = () => {
    setShow(true)
  };

  // ATUALIZAÇÃO DOS DADOS
  function updateNewTask(prop, value) {
    setNewTask(prevState => ({
      ...prevState,
      [prop]: value,
    }))

  }

  // ADIÇÃO DE TASK
  async function addTask() {

    // CONSULTA DE NOME NAS TASKS EXISTENTES
    const search = task.filter(task => task.name === newTask.name);

    // ALERT CASO ENCONTRE ALGUM
    if (search.length !== 0) {
      Alert.alert("Atenção", "Nome da tarefa repetida!");
      return;
    }

    // INCLUSÃO DE TASK AS EXISTENTES
    setTask([...task, newTask]);

    // LIMPEZA DE CAMPOS APÓS INCLUSÃO
    resetForm();

    // REMOVER TECLADO APÓS INCLUSÃO
    Keyboard.dismiss();
  }

  // REMOÇÃO DE TASK
  async function removeTask(item) {
    Alert.alert(
      "Deletar Tarefa",
      "Tem certeza que deseja remover esta anotação?",
      [
        {
          text: "Cancelar",
          onPress: () => {
            return;
          },
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => setTask(task.filter(tasks => tasks !== item))
        }
      ],
      { cancelable: false }
    );
  }

  // MARCAR CONCLUSÃO DE TASK
  async function taskDone(index) {

    setTask([
      ...task.slice(0, index),
      { ...task[index], done: !task[index].done },
      ...task.slice(index + 1)
    ])

  }

  function dateUpdated(event, selectDate) {

    setNewTask(prevState => ({
      ...prevState,
      date: selectDate,
    }))
    setShow(false)
  }

  const dateNow = moment();

  // MUDANÇA DE BACKGROUND DE ACORDO COM O STATUS DA TAREFA

  function getStylePriority(value) {

    if (value == 1) {

      return {
        fontSize: 14,
        color: "red",
        fontWeight: "bold",
        marginTop: 4,
        textAlign: "center"
      }
    } else if (value == 2) {
      return {
        fontSize: 14,
        color: "orange",
        fontWeight: "bold",
        marginTop: 4,
        textAlign: "center"
      }
    } else if (value == 3) {
      return {
        fontSize: 14,
        color: "blue",
        fontWeight: "bold",
        marginTop: 4,
        textAlign: "center"
      }
    } else if (value > 3) {
      return {
        fontSize: 14,
        color: "green",
        fontWeight: "bold",
        marginTop: 4,
        textAlign: "center"
      }
    }
  }

  // MUDANÇA DE BORDA DE ACORDO COM O STATUS DA TAREFA

  function getStyle(value) {

    const dateMemory = moment(value);
    const dateNow = moment();

    if (dateMemory < dateNow) {

      return {
        marginBottom: 15,
        padding: 15,
        borderRadius: 4,
        backgroundColor: "#eee",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "red"
      }
    } else {
      return {
        marginBottom: 15,
        padding: 15,
        borderRadius: 4,
        backgroundColor: "#eee",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#eee"
      }
    }
  }


  // CARREGAMENTO DOS DADOS DO ARRAY TASK DO ASYNC
  useEffect(() => {
    async function carregaDados() {
      const task = await AsyncStorage.getItem("task");

      if (task) {
        setTask(JSON.parse(task));
      }
    }
    carregaDados();
  }, []);

  // SALVANDO OS DADOS DO ARRAY TASK NO ASYNC
  useEffect(() => {
    async function salvaDados() {
      AsyncStorage.setItem("task", JSON.stringify(task));
      setShow(false)
    }
    salvaDados();
  }, [task]);

  return (
    <>
      <KeyboardAvoidingView
        keyboardVerticalOffset={0}
        behavior="padding"
        style={{ flex: 1 }}
        enabled={Platform.OS === "ios"}
      >
        <View style={styles.container}>
          <View style={styles.Body}>
            <FlatList
              data={task}
              showsVerticalScrollIndicator={false}
              style={styles.FlatList}
              renderItem={({ item, index }) => (
                <View
                  style={getStyle(item.date)}
                >

                  <View style={styles.itemRenderClick}>
                    <Checkbox
                      style={styles.Texto}
                      value={item.done}
                      onValueChange={() => taskDone(index)}
                    />
                  </View>

                  <View style={styles.itemRender}>
                    <Text style={styles.Texto}> {item.name} </Text>
                  </View>

                  <View style={styles.itemRenderPriority}>
                    <Text style={getStylePriority(item.priority)}> {item.priority} </Text>
                  </View>

                  <View style={styles.itemRender}>
                    <Text style={styles.Texto}> {Moment(item.date).format('DD/MM/yyyy')} </Text>
                  </View>

                  <View style={styles.itemRenderClick}>
                    <TouchableOpacity onPress={() => removeTask(item)}>
                      <MaterialIcons
                        name="delete-forever"
                        size={25}
                        color="#f64c75"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>

          <View style={styles.Form}>
            <TextInput
              name="name"
              style={styles.Input}
              autoCorrect={true}
              placeholder="TÍTULO"
              value={newTask.name}
              maxLength={25}
              onChangeText={(text) => updateNewTask("name", text)}
            />

            <TextInput
              name="priority"
              placeholder="PRIORIDADE"
              style={styles.InputPrioridade}
              autoFocus={true}
              value={newTask.priority}
              keyboardType='numeric'
              maxLength={1}
              onChangeText={(text) => updateNewTask("priority", text)}
            />

            <TouchableOpacity
              style={styles.pickDate}
              onPress={() => showDatePicker()}
              width={1000}
              title="Vencimento"
            >
              <AntDesign
                name="calendar"
                size={20}
                color="white"
              />
            </TouchableOpacity>

            {show && (
              <DateTimePicker
                name="date"
                value={newTask.date}
                mode={'date'}
                is24Hour={true}
                display='default'
                onChange={dateUpdated}
              />
            )}

            <TouchableOpacity
              style={styles.Button}
              onPress={() => addTask()}>
              <Ionicons
                name="ios-add"
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 20,
    backgroundColor: "#FFF"
  },
  Body: {
    flex: 1
  },
  Form: {
    padding: 0,
    height: 60,
    justifyContent: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    paddingTop: 13,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  Input: {
    flex: 1,
    height: 40,
    backgroundColor: "#eee",
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee"
  },
  InputPrioridade: {
    flex: 1,
    marginLeft: 10,
    height: 40,
    backgroundColor: "#eee",
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee"
  },
  Button: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "green",
    borderRadius: 4,
    marginLeft: 10
  },
  FlatList: {
    flex: 1,
    marginTop: 5
  },
  Texto: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center"
  },
  ContainerView: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 4,
    backgroundColor: "#eee",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee"
  },
  pickDate: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c6cce",
    borderRadius: 4,
    marginLeft: 10
  },
  itemRender: {
    width: 117,
  },
  itemRenderClick: {
    width: 40,
  },
  itemRenderPriority: {
    width: 40,
  }
});
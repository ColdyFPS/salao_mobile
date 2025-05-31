import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

function formatValue(value) {
  if (value === null || isNaN(value)) {
    return "0.00";
  }
  return value.toFixed(2);
}

const { height: deviceHeight } = Dimensions.get('window');
const BASE_HEIGHT = 812;
const scaleFactor = deviceHeight / BASE_HEIGHT;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AnimatedButton = ({ onPress, children }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
    onPress && onPress();
  };

  return (
    <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleValue }] }]}>
        <View style={styles.gradient}>
          <Text style={styles.buttonText}>{children}</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

function formatDateBR(dateString) {
  if (!dateString) return "";
  if (dateString.includes("/")) {
    return dateString;
  }
  if (dateString.includes("-")) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

function isToday(dateString) {
  const todayString = new Date().toISOString().slice(0, 10);
  return dateString === todayString;
}

function getFinishDate(appt) {
  return appt.feitoEm ? appt.feitoEm.slice(0, 10) : appt.date;
}

// ================== componentes do nosso app ==================

// ================== parte do calendario aqui ==================

function FullCalendarScreen({ navigation, route }) {
  const { appointments } = route.params;
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayAppointments, setDayAppointments] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

const markedDates = {};
appointments
  .filter((item) => item.status !== 'feito')
  .forEach((item) => {
    if (!markedDates[item.date]) {
      markedDates[item.date] = {
        customStyles: {
          container: {
            backgroundColor: '#90EE90',
            borderRadius: 16,
          },
          text: {
            color: '#000',
            fontWeight: 'bold',
          },
        },
      };
    }
  });
  
  if (selectedDate) {
    markedDates[selectedDate] = {
      customStyles: {
        container: {
          backgroundColor: '#f5f5f5',
          borderRadius: 16,
          borderWidth: 2,
          borderColor: '#fff',
        },
        text: {
          color: '#000',
          fontWeight: 'bold',
        },
      },
    };
  }

const onDayPress = (day) => {
  if (day.month !== currentMonth) return; 
  setSelectedDate(day.dateString);
  const events = appointments.filter(
    (appt) => appt.date === day.dateString && appt.status !== 'feito'
  );
  setDayAppointments(events);
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000', }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginTop: 40 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          Agenda Completa
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <Calendar
        current={selectedDate || new Date().toISOString().slice(0, 10)}
        markedDates={markedDates}
        markingType="custom"
        onDayPress={onDayPress}
        hideExtraDays={false} 
        dayComponent={({ date, state, marking }) => {
          const isExtra = state === 'disabled';
          const containerStyle =
            marking && marking.customStyles && marking.customStyles.container
              ? marking.customStyles.container
              : {};
          const textStyle =
            marking && marking.customStyles && marking.customStyles.text
              ? marking.customStyles.text
              : {};
          return (
            <TouchableOpacity
              onPress={() => {
                if (!isExtra) onDayPress(date);
              }}
            >
              <View
                style={[
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                  },
                  containerStyle,
                ]}
              >
                <Text style={[{ fontSize: 16, color: isExtra ? '#aaa' : '#fff' }, textStyle]}>
                  {date.day}
                </Text>
                {isExtra && (
                  <View
                    style={{
                      height: 5,
                      width: 5,
                      borderRadius: 2.5,
                      backgroundColor: 'grey',
                      marginTop: 2,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        onMonthChange={(monthInfo) => {
          setCurrentMonth(monthInfo.month);
        }}
        theme={{
          backgroundColor: '#000',
          calendarBackground: '#000',
          textSectionTitleColor: '#fff',
          dayTextColor: '#fff',
          todayTextColor: '#90EE90',
          selectedDayBackgroundColor: '#90EE90',
          selectedDayTextColor: '#000',
          arrowColor: '#90EE90',
          monthTextColor: '#fff',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: 'bold',
        }}
      />
      
      {selectedDate && (
        <Text style={{ color: '#fff', textAlign: 'center', marginVertical: 10 }}>
          Agendamentos para {formatDateBR(selectedDate)}
        </Text>
      )}
      
      <View style={{ flex: 1, padding: 10 }}>
        {dayAppointments.length > 0 ? (
          <FlatList
            data={dayAppointments}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={({ item }) => (
              <View style={{ backgroundColor: '#222', padding: 10, borderRadius: 8, marginVertical: 5 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
                <Text style={{ color: '#fff' }}>Serviço: {item.service}</Text>
                <Text style={{ color: '#90EE90' }}>Valor: R$ {formatValue(item.value)}</Text>
                <Text style={{ color: '#fff' }}>Horário: {item.time}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
            Nenhum agendamento para este dia.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

// ================== parte da agenda aqui ==================

function AgendaScreen({ appointments, setAppointments, navigation }) {
  const [filtroServico, setFiltroServico] = useState('');
  const [filtroHorario, setFiltroHorario] = useState('');
  const [showDone, setShowDone] = useState(true); 

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setShowDone(!showDone)}>
            <Ionicons
              name={showDone ? "eye" : "eye-off"}
              size={24}
              color="#fff"
              style={{ marginRight: 15 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('FullCalendarScreen', { appointments })}>
            <Ionicons
              name="calendar"
              size={24}
              color="#fff"
              style={{ marginRight: 15 }}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, appointments, showDone]);

  const cancelarAgendamento = (appointmentId) => {
    const novos = appointments.filter(item => item.id !== appointmentId);
    setAppointments(novos);
  };

  const filtrados = appointments.filter((item) => {
    return (
      (!filtroServico || item.service.toLowerCase().includes(filtroServico.toLowerCase())) &&
      (!filtroHorario || item.time.includes(filtroHorario))
    );
  });

  const pendentes = filtrados.filter((item) => item.status === 'pendente');
  const feitos = filtrados.filter((item) => item.status === 'feito');

  const marcarFeito = (appointmentId) => {
    const novosAgendamentos = appointments.map(item =>
      item.id === appointmentId
        ? { ...item, status: 'feito', feitoEm: new Date().toISOString() }
        : item
    );
    setAppointments(novosAgendamentos);
  };

  const renderItem = ({ item }) => {
    const statusStyle = {
      color: item.status === 'pendente' ? 'orange' : '#ccc',
      fontWeight: '600',
      fontSize: 17,
    };

    return (
      <View style={styles.itemCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            {item.service}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <View>
            <Text style={{ color: '#90EE90', fontSize: 16, fontWeight: '600' }}>
              R$ {formatValue(item.value)}
            </Text>
            <Text style={[statusStyle, { marginTop: 2 }]}>
              {item.status}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
              {item.time || "—"}
            </Text>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
              {formatDateBR(item.date) || "—"}
            </Text>
          </View>
        </View>
        {item.status === 'pendente' && (
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <TouchableOpacity
              onPress={() => marcarFeito(item.id)}
              style={[styles.smallButton, { paddingVertical: 8, paddingHorizontal: 12 }]}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Feito</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => cancelarAgendamento(item.id)}
              style={[
                styles.smallButton,
                { backgroundColor: 'red', marginLeft: 'auto', paddingVertical: 8, paddingHorizontal: 12 },
              ]}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.status === 'feito' && (
          <View style={{ marginTop: 5 }}>
            <TouchableOpacity
              onPress={() => cancelarAgendamento(item.id)}
              style={[
                styles.smallButton,
                { width: '30%', alignSelf: 'center', backgroundColor: 'red', paddingVertical: 8, paddingHorizontal: 12 },
              ]}
            >
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10, backgroundColor: '#000' }}>
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', padding: 10 }}>Agenda 📅</Text>
        <TextInput
          placeholder="Filtrar por serviço"
          placeholderTextColor="#aaa"
          value={filtroServico}
          onChangeText={setFiltroServico}
          style={styles.input}
        />
        <TextInput
          placeholder="Filtrar por horário"
          placeholderTextColor="#aaa"
          value={filtroHorario}
          onChangeText={setFiltroHorario}
          style={styles.input}
        />
        <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10, color: '#fff', padding: 10 }}>Pendentes</Text>
        <FlatList
          data={pendentes}
          keyExtractor={(item, index) => `pendente-${index}`}
          renderItem={renderItem}
        />
        {showDone && (
          <>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10, color: '#fff', padding: 10 }}>Feitos</Text>
            <FlatList
              data={feitos}
              keyExtractor={(item, index) => `feito-${index}`}
              renderItem={renderItem}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ================== parte do cadastro ==================

function CadastroScreen({ appointments, setAppointments }) {
  const [nome, setNome] = useState('');
  const [servico, setServico] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date());
  const [horario, setHorario] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [mostrarHorario, setMostrarHorario] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados para o cadastro rápido
  const [servicoRapido, setServicoRapido] = useState('');
  const [etapa, setEtapa] = useState(0);
  const [rapidoNome, setRapidoNome] = useState('');
  const [rapidoData, setRapidoData] = useState(new Date());
  const [rapidoHora, setRapidoHora] = useState(new Date());
  const [rapidoValor, setRapidoValor] = useState('');

  // Função para adicionar um agendamento normal
  const adicionarAgendamento = () => {
    if (nome && servico && valor && data && horario) {
      const novo = {
        id: Date.now().toString(), // id único baseado no timestamp
        time: horario.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: data.toISOString().slice(0, 10), // formato ISO
        service: servico,
        value: isNaN(parseFloat(valor)) ? 0 : parseFloat(valor),
        name: nome,
        color: '#E0FFE0',
        status: 'pendente',
      };
      setAppointments([...appointments, novo]);
      setNome('');
      setServico('');
      setValor('');
    } else {
      Alert.alert('Preencha todos os campos');
    }
  };

  // Atualizamos a função para aceitar também um valor default
  const iniciarServicoRapido = (tipo, valorDefault) => {
    setServicoRapido(tipo);
    setEtapa(0);
    setRapidoNome('');
    setRapidoData(new Date());
    setRapidoHora(new Date());
    // Se houver valor default, pré-preenche com ele; senão, deixa em branco
    setRapidoValor(valorDefault ? String(valorDefault) : '');
    setModalVisible(true);
  };

  const confirmarEtapa = () => {
    if (etapa < 3) {
      setEtapa(etapa + 1);
    } else {
      const novoAgendamento = {
        id: Date.now().toString(), // adiciona um id único
        name: rapidoNome,
        value: parseFloat(rapidoValor),
        date: rapidoData.toISOString().slice(0, 10), // garante o mesmo formato ISO
        time: rapidoHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        service: servicoRapido,
        status: 'pendente',
      };
      setAppointments([...appointments, novoAgendamento]);
      handleCloseModal();
      Alert.alert('Sucesso', 'O agendamento foi cadastrado');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEtapa(0);
    setRapidoNome('');
    setRapidoValor('');
    setRapidoData(new Date());
    setRapidoHora(new Date());
  };

  // Nova lista de serviços para cadastro rápido, conforme a imagem
  const quickServices = [
  { name: 'Escova', price: 40, icon: 'brush-outline' },
  { name: 'Hidratação', price: 50, icon: 'water-outline' },
  { name: 'Reconstrução com escova', price: 80, icon: 'fitness-outline' },
  { name: 'Nutrição', price: 50, icon: 'leaf-outline' },
  { name: 'Realinhamento', price: 180, icon: 'cut-outline' },
  { name: 'Botox', price: 140, icon: 'sad-outline' },
  { name: 'Coloração com tinta', price: 60, icon: 'color-palette-outline' },
];

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: '#000' }}>
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <Text style={{ fontSize: 18, marginBottom: 10, color: '#fff', padding: 3 }}>Nome do Cliente</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Digite o nome"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <Text style={{ fontSize: 18, marginBottom: 10, color: '#fff' }}>Serviço</Text>
        <TextInput
          value={servico}
          onChangeText={setServico}
          placeholder="Ex: Corte de cabelo"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <Text style={{ fontSize: 18, marginBottom: 10, color: '#fff' }}>Valor</Text>
        <TextInput
          value={valor}
          onChangeText={setValor}
          placeholder="Ex: 50.00"
          keyboardType="numeric"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <Text style={{ fontSize: 18, color: '#fff' }}>Data</Text>
        <TouchableOpacity onPress={() => setMostrarData(true)} style={styles.input}>
          <Text style={{ color: "#fff" }}>{data.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {mostrarData && (
          <DateTimePicker
            value={data}
            mode="date"
            display="default"
            onChange={(e, d) => {
              setMostrarData(false);
              if (d) setData(d);
            }}
          />
        )}
        <Text style={{ fontSize: 18, color: '#fff' }}>Horário</Text>
        <TouchableOpacity onPress={() => setMostrarHorario(true)} style={styles.input}>
          <Text style={{ color: "#fff" }}>
            {horario.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
        {mostrarHorario && (
          <DateTimePicker
            value={horario}
            mode="time"
            display="default"
            onChange={(e, h) => {
              setMostrarHorario(false);
              if (h) setHorario(h);
            }}
          />
        )}
        <TouchableOpacity onPress={adicionarAgendamento} style={styles.button}>
          <Text style={{ color: '#fff' }}>Adicionar</Text>
        </TouchableOpacity>
        
        {/* Nova seção para cadastro rápido com os novos serviços e preços */}
       <Text style={{ fontSize: 18, color: '#fff', marginTop: 20 }}>
  Selecione um serviço rápido:
</Text>
<View style={styles.quickServicesContainer}>
  {quickServices.map(service => (
    <TouchableOpacity
      key={service.name}
      onPress={() => iniciarServicoRapido(service.name, service.price)}
      style={styles.quickServiceButton}
    >
      <View style={styles.quickServiceRow}>
        <Ionicons 
          name={service.icon} 
          size={24} 
          color="#FFF"
          style={styles.quickServiceIcon} 
        />
        <View style={styles.quickServiceTextContainer}>
          <Text style={styles.quickServiceName}>{service.name}</Text>
          <Text style={styles.quickServicePrice}>R${service.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ))}
</View>
  
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="red" />
              </TouchableOpacity>
              {etapa === 0 && (
                <TextInput
                  placeholder="Nome"
                  placeholderTextColor="#aaa"
                  value={rapidoNome}
                  onChangeText={setRapidoNome}
                  style={styles.input}
                />
              )}
              {etapa === 1 && (
                <TextInput
                  placeholder="Valor"
                  placeholderTextColor="#aaa"
                  value={rapidoValor}
                  onChangeText={setRapidoValor}
                  keyboardType="numeric"
                  style={styles.input}
                />
              )}
              {etapa === 2 && (
                <DateTimePicker
                  value={rapidoData}
                  mode="date"
                  display="default"
                  onChange={(e, d) => {
                    if (d) setRapidoData(d);
                  }}
                />
              )}
              {etapa === 3 && (
                <DateTimePicker
                  value={rapidoHora}
                  mode="time"
                  display="default"
                  onChange={(e, h) => {
                    if (h) setRapidoHora(h);
                  }}
                />
              )}
              <TouchableOpacity onPress={confirmarEtapa} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>
                  {etapa === 3 ? 'Salvar Agendamento' : 'Confirmar'}
                </Text>
              </TouchableOpacity>
  
              {etapa > 0 && (
                <TouchableOpacity onPress={() => setEtapa(etapa - 1)} style={styles.backButton}>
                  <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================== parte dos relatorios ==================

function RelatorioScreen({ appointments }) {
  const today = new Date();

  // Receita do dia (usando data final de agendamento)
  const revenueToday = appointments
    .filter(a => a.status === 'feito' && isToday(getFinishDate(a)))
    .reduce((sum, a) => sum + a.value, 0);

  // Estado que guarda o período de gráfico: 7 ou 30 dias
  const [chartPeriod, setChartPeriod] = useState(7);

  // Geração dos dados para o gráfico de linha de acordo com chartPeriod:
  const labels = [];
  const revenueData = [];
  for (let i = chartPeriod - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    labels.push(d.getDate().toString());
    const dateISO = d.toISOString().slice(0, 10);
    const dailyRevenue = appointments
      .filter(a => a.status === 'feito' && getFinishDate(a) === dateISO)
      .reduce((total, a) => total + a.value, 0);
    revenueData.push(dailyRevenue);
  }

  // Cálculo dos totais semanais e mensais (os cartões continuam sendo exibidos com receita do dia, total da semana e total do mês)
  // No caso dos totais semanais e mensais, usamos os mesmos cálculos anteriores:
  let revenueLast7 = [];
  for (let i = 6; i >= 0; i--) {
    let d = new Date();
    d.setDate(today.getDate() - i);
    const dateISO = d.toISOString().slice(0, 10);
    const dailyRevenue = appointments
      .filter(a => a.status === 'feito' && getFinishDate(a) === dateISO)
      .reduce((total, a) => total + a.value, 0);
    revenueLast7.push(dailyRevenue);
  }
  const totalWeek = revenueLast7.reduce((acc, val) => acc + val, 0);


 const chartConfig = {
    backgroundColor: "#000",
    backgroundGradientFrom: "#000",
    backgroundGradientTo: "#000",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(144,238,144,${opacity})`,
    labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#8A2BE2",
    },
  };
  
  let totalMonth = 0;
  for (let i = 29; i >= 0; i--) {
    let d = new Date();
    d.setDate(today.getDate() - i);
    const dateISO = d.toISOString().slice(0, 10);
    const rev = appointments
      .filter(a => a.status === 'feito' && getFinishDate(a) === dateISO)
      .reduce((acc, a) => acc + a.value, 0);
    totalMonth += rev;
  }

  // Ticket médio permanece o mesmo
  const doneAppointments = appointments.filter(a => a.status === 'feito');
  const ticketAverage = doneAppointments.length > 0 
    ? doneAppointments.reduce((sum, a) => sum + a.value, 0) / doneAppointments.length 
    : 0;

  // Paleta de cores e dados para o gráfico de pizza
  const colorPalette = [
    '#90EE90',
    '#8A2BE2',
    '#FFA07A',
    '#20B2AA',
    '#FFD700',
    '#FF69B4',
    '#87CEFA',
    '#FF7F50',
    '#66CDAA',
  ];
  let serviceDistribution = {};
  doneAppointments.forEach(a => {
    if (serviceDistribution[a.service]) {
      serviceDistribution[a.service] += 1;
    } else {
      serviceDistribution[a.service] = 1;
    }
  });
  const pieData = Object.keys(serviceDistribution).map((key, index) => ({
    name: key,
    population: serviceDistribution[key],
    color: colorPalette[index % colorPalette.length],
    legendFontColor: '#fff',
    legendFontSize: 12,
  }));

  return (
    <ScrollView contentContainerStyle={styles.dashboardContainer}>
      <Text style={styles.dashboardTitle}>Dashboard de Relatórios</Text>

      <View style={styles.cardsContainer}>
        <View style={styles.cardDashboard}>
          <Text style={styles.cardTitle}>Total do Dia</Text>
          <Text style={styles.cardValue}>R$ {revenueToday.toFixed(2)}</Text>
        </View>
        <View style={styles.cardDashboard}>
          <Text style={styles.cardTitle}>Total Semana</Text>
          <Text style={styles.cardValue}>R$ {totalWeek.toFixed(2)}</Text>
        </View>
        <View style={styles.cardDashboard}>
          <Text style={styles.cardTitle}>Total Mês</Text>
          <Text style={styles.cardValue}>R$ {totalMonth.toFixed(2)}</Text>
        </View>
        <View style={styles.cardDashboard}>
          <Text style={styles.cardTitle}>Ticket Médio</Text>
          <Text style={styles.cardValue}>R$ {ticketAverage.toFixed(2)}</Text>
        </View>
      </View>

      {/* Título do gráfico com um botão de alternância */}
      <View style={styles.chartTitleContainer}>
        <Text style={styles.sectionTitle}>
          Receita dos Últimos {chartPeriod} Dias
        </Text>
        <TouchableOpacity onPress={() => setChartPeriod(chartPeriod === 7 ? 30 : 7)}>
          <Ionicons
            name="swap-horizontal-outline"
            size={24}
            color="#fff"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      </View>

      <LineChart
        data={{
          labels: labels,
          datasets: [{ data: revenueData }]
        }}
        width={Dimensions.get("window").width - 40}
        height={220}
        yAxisLabel="R$"
        chartConfig={{
          backgroundColor: "#000",
          backgroundGradientFrom: "#000",
          backgroundGradientTo: "#000",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(144,238,144,${opacity})`,
          labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: "4", strokeWidth: "2", stroke: "#8A2BE2" }
        }}
        style={styles.chartStyle}
      />

      <Text style={styles.sectionTitle}>Distribuição de Serviços</Text>
      {pieData.length > 0 ? (
        <PieChart
          data={pieData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#000",
            backgroundGradientFrom: "#000",
            backgroundGradientTo: "#000",
            color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 10 }}>
          Nenhum serviço concluído para exibir a distribuição.
        </Text>
      )}
    </ScrollView>
  );
}

// ================== parte do estoque ==================

const sampleProducts = [
  {
    id: '1',
    name: 'Shampoo',
    quantity: 10,
    capacity: 20,
    min: 5,
  },
  {
    id: '2',
    name: 'Condicionador',
    quantity: 3,
    capacity: 20,
    min: 5,
  },
  {
    id: '3',
    name: 'Máscara de Hidratação',
    quantity: 15,
    capacity: 20,
    min: 5,
  },
  {
    id: '4',
    name: 'Óleo Capilar',
    quantity: 8,
    capacity: 20,
    min: 5,
  },
  {
    id: '5',
    name: 'Protetor Térmico',
    quantity: 12,
    capacity: 20,
    min: 5,
  },
];

function EstoqueScreen() {
  const navigation = useNavigation();

  // Estados do formulário de adição em modal
  const [produtoNome, setProdutoNome] = useState('');
  const [produtoValor, setProdutoValor] = useState('');
  const [produtoCategoria, setProdutoCategoria] = useState('');
  const [produtoDataCompra, setProdutoDataCompra] = useState(new Date());
  const [mostrarDataCompra, setMostrarDataCompra] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Estado dos produtos e do filtro de busca
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Carrega os produtos do AsyncStorage
  useEffect(() => {
    async function loadProducts() {
      try {
        const storedProducts = await AsyncStorage.getItem('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        }
      } catch (error) {
        console.error('Erro ao carregar os produtos do AsyncStorage', error);
      }
    }
    loadProducts();
  }, []);

  // Salva os produtos no AsyncStorage sempre que houver mudança
  useEffect(() => {
    async function saveProducts() {
      try {
        await AsyncStorage.setItem('products', JSON.stringify(products));
      } catch (error) {
        console.error('Erro ao salvar os produtos', error);
      }
    }
    saveProducts();
  }, [products]);

  // Função para adicionar um novo produto
  const adicionarProduto = () => {
    if (!produtoNome.trim() || !produtoValor.trim() || !produtoCategoria.trim()) {
      Alert.alert('Preencha todos os campos');
      return;
    }
    const novoProduto = {
      id: Date.now().toString(),
      nome: produtoNome,
      valor: parseFloat(produtoValor),
      quantidade: 1, // valor inicial
      dataCompra: produtoDataCompra.toLocaleDateString(),
      categoria: produtoCategoria,
      capacity: 20,
      min: 5,
      logs: [],
    };
    setProducts([...products, novoProduto]);
    setProdutoNome('');
    setProdutoValor('');
    setProdutoCategoria('');
    setProdutoDataCompra(new Date());
    setAddModalVisible(false);
  };

  // Funções para incrementar e decrementar quantidade
  const incrementarQuantidade = (id) => {
    const updatedProducts = products.map((prod) =>
      prod.id === id ? { ...prod, quantidade: prod.quantidade + 1 } : prod
    );
    setProducts(updatedProducts);
  };

  const decrementarQuantidade = (id) => {
    const updatedProducts = products.reduce((acc, prod) => {
      if (prod.id === id) {
        // Se a quantidade for 1, remova o produto
        if (prod.quantidade === 1) {
          return acc;
        } else {
          acc.push({ ...prod, quantidade: prod.quantidade - 1 });
        }
      } else {
        acc.push(prod);
      }
      return acc;
    }, []);
    setProducts(updatedProducts);
  };

  // Filtra os produtos conforme o campo de busca (por nome)
  const filteredProducts = products.filter((product) =>
    product.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Função que renderiza cada card de produto
  const renderProduct = ({ item }) => {
    const capacity = item.capacity !== undefined ? item.capacity : 20;
    const min = item.min !== undefined ? item.min : 5;
    const percentage = Math.min(100, (item.quantidade / capacity) * 100);
    const progressColor = item.quantidade < min ? '#FF6347' : '#8A2BE2';

    return (
      <View style={estoqueStyles.card}>
        {/* Linha superior para os botões de diminuir e aumentar */}
        <View style={estoqueStyles.cardTopRow}>
          <TouchableOpacity onPress={() => decrementarQuantidade(item.id)}>
            <Ionicons name="remove-circle" size={24} color="#FF6347" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => incrementarQuantidade(item.id)}>
            <Ionicons name="add-circle" size={24} color="#28a745" />
          </TouchableOpacity>
        </View>
        <View style={estoqueStyles.cardHeader}>
          <Ionicons name="cube-outline" size={30} color="#8A2BE2" />
          <Text style={estoqueStyles.productName}>{item.nome}</Text>
          <Text style={estoqueStyles.productCategory}>{item.categoria}</Text>
        </View>
        <Text style={estoqueStyles.productQuantity}>
          Quantidade: {item.quantidade} / {capacity}
        </Text>
        <View style={estoqueStyles.progressBarBackground}>
          <View
            style={[
              estoqueStyles.progressBarFill,
              { width: `${percentage}%`, backgroundColor: progressColor },
            ]}
          />
        </View>
        {item.quantidade < min && (
          <View style={estoqueStyles.lowStockIndicator}>
            <Ionicons name="warning-outline" size={18} color="#FF6347" />
            <Text style={estoqueStyles.lowStockText}>Estoque Baixo</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={estoqueStyles.container}>
      {/* Ícone no canto superior direito para navegar à tela de relatório */}
      <TouchableOpacity
        style={estoqueStyles.headerIcon}
        onPress={() => navigation.navigate('RelatorioEstoqueScreen')}
      >
        <Ionicons name="bar-chart" size={28} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={estoqueStyles.productsContainer}>
        <Text style={estoqueStyles.header}>Estoque 📦</Text>
        <TextInput
          style={estoqueStyles.searchInput}
          placeholder="Buscar produto..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </ScrollView>
      <TouchableOpacity
        style={estoqueStyles.fab}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal para adicionar novo produto */}
      <Modal visible={addModalVisible} transparent animationType="fade">
        <View style={estoqueStyles.modalBackground}>
          <View style={estoqueStyles.modalContainer}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Adicionar Produto
            </Text>
            <TextInput
              placeholder="Nome do Produto"
              placeholderTextColor="#aaa"
              value={produtoNome}
              onChangeText={setProdutoNome}
              style={estoqueStyles.modalInput}
            />
            <TextInput
              placeholder="Valor (R$)"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={produtoValor}
              onChangeText={(text) =>
                setProdutoValor(text.replace(/[^0-9.]/g, ''))
              }
              style={estoqueStyles.modalInput}
            />
            <TextInput
              placeholder="Categoria"
              placeholderTextColor="#aaa"
              value={produtoCategoria}
              onChangeText={setProdutoCategoria}
              style={estoqueStyles.modalInput}
            />
            <TouchableOpacity
              onPress={() => setMostrarDataCompra(true)}
              style={[estoqueStyles.modalInput, { justifyContent: 'center' }]}
            >
              <Text style={{ color: '#fff' }}>
                Data da Compra: {produtoDataCompra.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {mostrarDataCompra && (
              <DateTimePicker
                value={produtoDataCompra}
                mode="date"
                display="default"
                onChange={(e, d) => {
                  setMostrarDataCompra(false);
                  if (d) setProdutoDataCompra(d);
                }}
              />
            )}
            <TouchableOpacity
              onPress={adicionarProduto}
              style={estoqueStyles.modalButton}
            >
              <Text style={estoqueStyles.modalButtonText}>Adicionar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAddModalVisible(false)}
              style={[estoqueStyles.modalButton, { backgroundColor: '#FF6347' }]}
            >
              <Text style={estoqueStyles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ========================= RelatorioEstoqueScreen (Relatório do Estoque) =========================

function RelatorioEstoqueScreen() {
  const [products, setProducts] = useState([]);
  const [totalGasto, setTotalGasto] = useState(0);
  const [gasto30Dias, setGasto30Dias] = useState(0);

  useEffect(() => {
    async function loadProducts() {
      try {
        const storedProducts = await AsyncStorage.getItem('products');
        if (storedProducts) {
          const prods = JSON.parse(storedProducts);
          setProducts(prods);
          calcularGastos(prods);
        }
      } catch (error) {
        console.error('Erro ao carregar os produtos:', error);
      }
    }
    loadProducts();
  }, []);

  const calcularGastos = (prods) => {
    // Total gasto com todos os produtos (valor * quantidade)
    const total = prods.reduce((acc, prod) => acc + prod.valor * prod.quantidade, 0);
    setTotalGasto(total);

    // Gasto nos últimos 30 dias: filtramos os produtos cuja data de compra
    // esteja dentro de 30 dias a partir de hoje.
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() - 30);

    const total30 = prods.reduce((acc, prod) => {
      // Supondo que prod.dataCompra esteja no formato local, tente convertê-lo
      const dataCompra = new Date(prod.dataCompra);
      if (dataCompra >= dataLimite && dataCompra <= hoje) {
        return acc + prod.valor * prod.quantidade;
      }
      return acc;
    }, 0);
    setGasto30Dias(total30);
  };

  return (
    <SafeAreaView style={relEstoqueStyles.container}>
      <ScrollView contentContainerStyle={relEstoqueStyles.contentContainer}>
        <Text style={relEstoqueStyles.title}>Relatório do Estoque</Text>
        <View style={relEstoqueStyles.card}>
          <Text style={relEstoqueStyles.cardTitle}>Total Gasto com Produtos</Text>
          <Text style={relEstoqueStyles.cardValue}>R$ {totalGasto.toFixed(2)}</Text>
        </View>
        <View style={relEstoqueStyles.card}>
          <Text style={relEstoqueStyles.cardTitle}>Gasto nos Últimos 30 Dias</Text>
          <Text style={relEstoqueStyles.cardValue}>R$ {gasto30Dias.toFixed(2)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================== tela inicial ==================

const { width: windowWidth } = Dimensions.get('window');

function WelcomeScreen({ onLogin, appointments }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  
  const pendingAppointments = appointments.filter(a => a.status === 'pendente');
  const totalPending = pendingAppointments.length;
  
  return (
    <View style={styles.welcomeContainer}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      
      <View style={styles.backgroundContainer}>
        <Image
          source={require('./assets/logoinicial.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      </View>
      
      <Animated.View 
        style={[
          styles.contentContainer, 
          { opacity: fadeAnim, transform: [{ translateY }] }
        ]}
      >
        <Text style={styles.dateText}>Hoje é {today}</Text>
        <Text style={styles.welcomeText}>Seja bem-vinda de volta, Kellen</Text>
        <TouchableOpacity style={styles.entrarButton} onPress={onLogin}>
          <Text style={styles.entrarButtonText}>Entrar</Text>
        </TouchableOpacity>
        <View style={styles.pendingContainer}>
          <Text style={styles.pendingText}>
            Agendamentos Pendentes: <Text style={styles.pendingNumber}>{totalPending}</Text>
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ================== parte dos estilos ==================

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
    width: windowWidth - 40,
  },
  dateText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  entrarButton: {
    backgroundColor: '#e564b1',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
    marginBottom: 20,
  },
  entrarButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  pendingContainer: {
    backgroundColor: 'rgba(211,211,211,0.7)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pendingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  pendingNumber: {
    color: '#FFD700',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -0,
  },
  backgroundImage: {
    width: '130%',
    height: '120%',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50 * scaleFactor,
    paddingVertical: 50 * scaleFactor,
  },
  dateText: {
    color: '#fff',
    fontSize: 25 * scaleFactor,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 400 * scaleFactor,
    marginTop: -20,
  },
  welcomeText: {
    color: '#f0f0f0',
    fontSize: 24 * scaleFactor,
    fontWeight: 'bold',
    marginBottom: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 2 * scaleFactor, height: 2 * scaleFactor },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  agendamentosText: {
    color: '#fff',
    fontSize: 20 * scaleFactor,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 80 * scaleFactor,
    textShadowColor: '#000',
    textShadowOffset: { width: 2 * scaleFactor, height: 2 * scaleFactor },
    textShadowRadius: 4,
  },
  input: {
    borderWidth: 2,
    borderColor: '#8A2BE2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#222',
    width: '100%',
    color: '#fff',
  },
  button: {
    backgroundColor: '#562C63',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginVertical: 10,
  },
  smallButton: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  relatorioTitulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  card: {
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#8A2BE2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  relatorioTexto: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  valor: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#8A2BE2',
  },
  buttonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 10,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#562C63',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
    backgroundColor: '#8A2BE2',
    borderRadius: 1.5,
  },
    modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000088', 
  },
  modalContainer: {
    backgroundColor: '#2a2a2a', 
    padding: 20,
    paddingTop: 40, 
    borderRadius: 10,
    width: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 5,
  },
  input: {
    borderWidth: 2,
    borderColor: '#8A2BE2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#444', 
    color: '#fff',        
  },
  confirmButton: {
    backgroundColor: '#562C63',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
  },
  dashboardContainer: {
    backgroundColor: '#000',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    alignItems: 'center'
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center'
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  cardDashboard: {
    backgroundColor: '#222',
    borderColor: '#8A2BE2',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    width: '48%'
  },
  cardTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center'
  },
  cardValue: {
    fontSize: 20,
    color: '#90EE90',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10
  },
   chartTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16
  },
  relatorioTitulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center'
  },
  itemCard: {
    backgroundColor: '#222',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8A2BE2',
  },
    quickServicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  quickServiceButton: {
    width: '48%',
    backgroundColor: '#333', // fundo cinza escuro
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8A2BE2', // borda fina roxa
  },
  quickServiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // texto em branco para contraste
    textAlign: 'center',
  },
  quickServicePrice: {
    marginTop: 5,
    fontSize: 14,
    color: '#90EE90', // preço destacado em roxo
    textAlign: 'center',
    fontWeight: 'bold'
  },
  quickServiceRow: {
  flexDirection: 'column',       // Alterado para 'column' para que o ícone fique acima
  alignItems: 'center',
},
quickServiceIcon: {
  // Remova o marginRight, pois ele não é mais necessário
  marginBottom: 5,               // Opcional: para dar um espaçamento abaixo do ícone
},
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000088',
  },
  modalContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    paddingTop: 40,
    borderRadius: 10,
    width: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 5,
  },
  confirmButton: {
    backgroundColor: '#562C63',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
  },
  
});

const relEstoqueStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#8A2BE2',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    width: windowWidth - 40,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 24,
    color: '#90EE90',
    fontWeight: 'bold',
  },
});

// ========================= Estilos da aba Estoque =========================

const estoqueStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 15,
    alignSelf: 'center',
  },
  headerIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: '#222',
    borderColor: '#8A2BE2',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  productsContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8A2BE2',
    padding: 10,
    margin: 5,
    width: (windowWidth - 60) / 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },
  productCategory: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  productQuantity: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    borderRadius: 5,
  },
  lowStockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'center',
  },
  lowStockText: {
    color: '#FF6347',
    fontSize: 12,
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#8A2BE2',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000088',
  },
  modalContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#8A2BE2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#222',
    color: '#fff',
  },
  modalButton: {
    backgroundColor: '#562C63',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
// ================== app principall ==================

export default function App() {
  const [logado, setLogado] = useState(false);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const storedData = await AsyncStorage.getItem('appointments');
        if (storedData !== null) {
          setAppointments(JSON.parse(storedData));
        }
      } catch (e) {
        console.error('Erro ao carregar os agendamentos:', e);
      }
    }
    loadAppointments();
  }, []);

  useEffect(() => {
    async function saveAppointments() {
      try {
        await AsyncStorage.setItem('appointments', JSON.stringify(appointments));
      } catch (e) {
        console.error('Erro ao salvar os agendamentos:', e);
      }
    }
    saveAppointments();
  }, [appointments]);

  const handleLogout = () => {
    setLogado(false);
  };

  if (!logado) {
    return (
      <>
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <WelcomeScreen onLogin={() => setLogado(true)} appointments={appointments} />
      </>
    );
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
            {() => <Tab.Navigator
              screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: '#1c1c1c' },
                headerTintColor: '#fff',
                headerLeft: () => (
                  <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 15 }}>
                    <Ionicons name="home" size={24} color="#fff" />
                  </TouchableOpacity>
                ),
                tabBarStyle: {
                  backgroundColor: '#1c1c1c',
                  borderTopColor: '#8A2BE2',
                },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#fff',
                tabBarIcon: ({ color, size }) => {
                  let iconName;
                  if (route.name === 'Agenda') iconName = 'calendar';
                  else if (route.name === 'Cadastro') iconName = 'person-add';
                  else if (route.name === 'Relatorio') iconName = 'bar-chart';
                  else if (route.name === 'Estoque') iconName = 'bag-check';
                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              })}
            >
              <Tab.Screen name="Agenda">
                {({ navigation, route }) => (
                  <AgendaScreen navigation={navigation} appointments={appointments} setAppointments={setAppointments} />
                )}
              </Tab.Screen>
              <Tab.Screen name="Cadastro">
                {() => <CadastroScreen appointments={appointments} setAppointments={setAppointments} />}
              </Tab.Screen>
              <Tab.Screen name="Relatorio">
                {() => <RelatorioScreen appointments={appointments} />}
              </Tab.Screen>
              <Tab.Screen name="Estoque" component={EstoqueScreen} />
            </Tab.Navigator>}
          </Stack.Screen>
          <Stack.Screen
            name="FullCalendarScreen"
            component={FullCalendarScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
    name="RelatorioEstoqueScreen"
    component={RelatorioEstoqueScreen}
    options={{
      headerStyle: { backgroundColor: '#1c1c1c' },
      headerTintColor: '#fff',
      title: 'Relatório do Estoque',
    }}
  />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
import React, { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Modal } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const Tab = createBottomTabNavigator();

function AgendaScreen({ appointments, setAppointments }) {
  const [filtroServico, setFiltroServico] = useState('');
  const [filtroHorario, setFiltroHorario] = useState('');

  const marcarFeito = (id) => {
    const novos = appointments.map((item, index) =>
      index === id ? { ...item, status: 'feito', feitoEm: new Date() } : item
    );
    setAppointments(novos);
  };

  const cancelarAgendamento = (id) => {
    const novos = appointments.filter((_, index) => index !== id);
    setAppointments(novos);
  };

  const filtrados = appointments.filter(item => {
    return (
      (!filtroServico || item.service.toLowerCase().includes(filtroServico.toLowerCase())) &&
      (!filtroHorario || item.time.includes(filtroHorario))
    );
  });

  const pendentes = filtrados.filter(item => item.status === 'pendente');
  const feitos = filtrados.filter(item => item.status === 'feito');

  const renderItem = (item, index) => {
    const isFeito = item.status === 'feito';
    const backgroundColor = isFeito ? '#e0e0e0' : '#E0FFE0';
    const statusStyle = {
      color: item.status === 'pendente' ? 'orange' : '#555',
      fontWeight: 'bold'
    };

    return (
      <View style={{ backgroundColor, marginBottom: 10, padding: 10, borderRadius: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.service}</Text>
        </View>
        <Text style={{ color: '#555' }}>{item.time} - {item.date} - R$ {item.value.toFixed(2)}</Text>
        <Text style={statusStyle}>{item.status}</Text>
        {item.status === 'pendente' && (
          <View style={{ flexDirection: 'row', marginTop: 5 }}>
            <TouchableOpacity onPress={() => marcarFeito(appointments.indexOf(item))} style={styles.smallButton}>
              <Text style={{ color: '#fff' }}>Feito</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => cancelarAgendamento(appointments.indexOf(item))} style={[styles.smallButton, { backgroundColor: 'red', marginLeft: 5 }]}>
              <Text style={{ color: '#fff' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Agenda</Text>

      <TextInput
        placeholder="Filtrar por serviço"
        value={filtroServico}
        onChangeText={setFiltroServico}
        style={styles.input}
      />
      <TextInput
        placeholder="Filtrar por horário (ex: 15:00)"
        value={filtroHorario}
        onChangeText={setFiltroHorario}
        style={styles.input}
      />

      <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10 }}>Pendentes</Text>
      <FlatList
        data={pendentes}
        keyExtractor={(item, index) => `pendente-${index}`}
        renderItem={({ item, index }) => renderItem(item, index)}
      />

      <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10 }}>Feitos</Text>
      <FlatList
        data={feitos}
        keyExtractor={(item, index) => `feito-${index}`}
        renderItem={({ item, index }) => renderItem(item, index)}
      />
    </SafeAreaView>
  );
}

function CadastroScreen({ appointments, setAppointments }) {
  const [nome, setNome] = useState('');
  const [servico, setServico] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(new Date());
  const [horario, setHorario] = useState(new Date());
  const [mostrarData, setMostrarData] = useState(false);
  const [mostrarHorario, setMostrarHorario] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [servicoRapido, setServicoRapido] = useState('');
  const [etapa, setEtapa] = useState(0);
  const [rapidoNome, setRapidoNome] = useState('');
  const [rapidoData, setRapidoData] = useState(new Date());
  const [rapidoHora, setRapidoHora] = useState(new Date());
  const [rapidoValor, setRapidoValor] = useState('');

  const adicionarAgendamento = () => {
    if (nome && servico && valor && data && horario) {
      const novo = {
        time: horario.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: data.toLocaleDateString(),
        service: servico,
        value: parseFloat(valor),
        name: nome,
        color: '#E0FFE0',
        status: 'pendente'
      };
      setAppointments([...appointments, novo]);
      setNome('');
      setServico('');
      setValor('');
    } else {
      Alert.alert('Preencha todos os campos');
    }
  };

  const iniciarServicoRapido = (tipo) => {
    setServicoRapido(tipo);
    setEtapa(0);
    setRapidoNome('');
    setRapidoData(new Date());
    setRapidoHora(new Date());
    setRapidoValor('');
    setModalVisible(true);
  };

  const confirmarEtapa = () => {
    if (etapa === 0 && !rapidoNome) return Alert.alert('Informe o nome');
    if (etapa === 1 && !rapidoValor) return Alert.alert('Informe o valor');
    if (etapa === 3) {
      const novo = {
        time: rapidoHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: rapidoData.toLocaleDateString(),
        service: servicoRapido,
        value: parseFloat(rapidoValor),
        name: rapidoNome,
        color: '#E0FFE0',
        status: 'pendente'
      };
      setAppointments([...appointments, novo]);
      setModalVisible(false);
      return;
    }
    setEtapa(etapa + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Nome do Cliente:</Text>
      <TextInput value={nome} onChangeText={setNome} placeholder="Digite o nome" style={styles.input} />
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Serviço:</Text>
      <TextInput value={servico} onChangeText={setServico} placeholder="Ex: Corte de cabelo" style={styles.input} />
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Valor (R$):</Text>
      <TextInput value={valor} onChangeText={setValor} placeholder="Ex: 50.00" keyboardType="numeric" style={styles.input} />

      <Text style={{ fontSize: 18 }}>Data:</Text>
      <TouchableOpacity onPress={() => setMostrarData(true)} style={styles.input}>
        <Text>{data.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {mostrarData && (
        <DateTimePicker value={data} mode="date" display="default" onChange={(e, d) => { setMostrarData(false); if (d) setData(d); }} />
      )}

      <Text style={{ fontSize: 18 }}>Horário:</Text>
      <TouchableOpacity onPress={() => setMostrarHorario(true)} style={styles.input}>
        <Text>{horario.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      {mostrarHorario && (
        <DateTimePicker value={horario} mode="time" display="default" onChange={(e, h) => { setMostrarHorario(false); if (h) setHorario(h); }} />
      )}

      <TouchableOpacity onPress={adicionarAgendamento} style={styles.button}>
        <Text style={{ color: '#fff' }}>Adicionar</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 }}>
        {['Progressiva', 'Corte de cabelo', 'Unha', 'Escova'].map((tipo) => (
          <TouchableOpacity key={tipo} onPress={() => iniciarServicoRapido(tipo)} style={{ width: '48%', backgroundColor: '#ccc', padding: 15, borderRadius: 8, marginVertical: 5 }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{tipo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' }}>
            {etapa === 0 && (
              <TextInput placeholder="Nome" value={rapidoNome} onChangeText={setRapidoNome} style={styles.input} />
            )}
            {etapa === 1 && (
              <TextInput placeholder="Valor" value={rapidoValor} onChangeText={setRapidoValor} keyboardType="numeric" style={styles.input} />
            )}
            {etapa === 2 && (
              <DateTimePicker value={rapidoData} mode="date" display="default" onChange={(e, d) => d && setRapidoData(d)} />
            )}
            {etapa === 3 && (
              <DateTimePicker value={rapidoHora} mode="time" display="default" onChange={(e, h) => h && setRapidoHora(h)} />
            )}
            <TouchableOpacity onPress={confirmarEtapa} style={[styles.button, { marginTop: 20 }]}>
              <Text style={{ color: '#fff' }}>{etapa < 3 ? 'Confirmar' : 'Salvar Agendamento'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


function RelatorioScreen({ appointments }) {
const hoje = new Date();
const isToday = (date) => {
const d = new Date(date);
return d.toDateString() === hoje.toDateString();
};

const somarValores = (dias) => {
const dataLimite = new Date();
dataLimite.setDate(hoje.getDate() - dias);
return appointments
.filter(a => a.status === 'feito' && new Date(a.feitoEm) >= dataLimite)
.reduce((acc, a) => acc + a.value, 0);
};

const totalHoje = appointments
.filter(a => a.status === 'feito' && isToday(a.feitoEm))
.reduce((acc, a) => acc + a.value, 0);

return (
<SafeAreaView style={{ flex: 1, padding: 20 }}>
<Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 20 }}>📊 Relatórios</Text>
<Text style={styles.relatoriosTexto}>💰 Total do dia: <Text style={styles.valor}>R$ {totalHoje.toFixed(2)}</Text></Text>
<Text style={styles.relatoriosTexto}>📅 Média da semana (7 dias): <Text style={styles.valor}>R$ {(somarValores(7) / 7).toFixed(2)}</Text></Text>
<Text style={styles.relatoriosTexto}>🗓️ Média do mês (30 dias): <Text style={styles.valor}>R$ {(somarValores(30) / 30).toFixed(2)}</Text></Text>
</SafeAreaView>
);
}

function WelcomeScreen({ onLogin, appointments }) {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  const agendamentosPendentes = appointments.filter((a) => a.status === 'pendente');
  const totalAgendamentos = agendamentosPendentes.length;


return (
<LinearGradient colors={['#02300', '#888888']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 50 }}>
<Text style={{ fontFamily: 'Poppins', color: '#f0f0f0', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Seja bem-vinda novamente!</Text>
<TouchableOpacity onPress={onLogin} style={styles.button}>
<Text style={{ fontFamily: 'Poppins', color: '#fff', fontSize: 20 }}>Entrar</Text>
</TouchableOpacity>
 <Text style={styles.dateText}>
        Hoje é {today}
      </Text>
      <Text style={styles.agendamentosText}>
        Você tem {totalAgendamentos} agendamento{totalAgendamentos !== 1 ? 's' : ''} pendente{totalAgendamentos !== 1 ? 's' : ''}.
        </Text>
</LinearGradient>
);
}

const styles = StyleSheet.create({
input: {
borderWidth: 1,
borderColor: '#ccc',
borderRadius: 8,
padding: 10,
marginBottom: 15,
backgroundColor: '#fff',
width: '100%'
},
button: {
backgroundColor: '#562C63',
padding: 6,
borderRadius: 8,
alignItems: 'center',
width: '70%',
},
smallButton: {
backgroundColor: '#28a745',
paddingVertical: 6,
paddingHorizontal: 12,
borderRadius: 6,
alignItems: 'center'
},
relatoriosTexto: {
fontSize: 20,
marginVertical: 10,
fontWeight: '600'
},
valor: {
fontWeight: 'bold',
fontSize: 22,
color: '#4CAF50'
},
dateText: {
    position: 'absolute',
    bottom: 700,
    color: '#C7E5F3',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  agendamentosText: {
    position: 'absolute',
    bottom: 40,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
});

export default function App() {
const [logado, setLogado] = useState(false);
const [appointments, setAppointments] = useState([]);

const handleLogout = () => {
    setLogado(false);
  };

if (!logado) return <WelcomeScreen onLogin={() => setLogado(true)} appointments={appointments} />;


return (
<NavigationContainer>
<Tab.Navigator
screenOptions={({ route, navigation }) => ({
   headerLeft: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 15 }}>
              <Ionicons name="home" size={24} color="#000" />
            </TouchableOpacity>
          ),
tabBarIcon: ({ color, size }) => {
let iconName;
if (route.name === 'Agenda') iconName = 'calendar';
else if (route.name === 'Cadastro') iconName = 'person-add';
else if (route.name === 'Relatorio') iconName = 'bar-chart';
return <Ionicons name={iconName} size={size} color={color} />;
},
tabBarActiveTintColor: '#000',
tabBarInactiveTintColor: 'gray',
})}
>
<Tab.Screen name="Agenda">
{() => <AgendaScreen appointments={appointments} setAppointments={setAppointments} />}
</Tab.Screen>
<Tab.Screen name="Cadastro">
{() => <CadastroScreen appointments={appointments} setAppointments={setAppointments} />}
</Tab.Screen>
<Tab.Screen name="Relatorio">
{() => <RelatorioScreen appointments={appointments} />}
</Tab.Screen>
</Tab.Navigator>
</NavigationContainer>
);
}
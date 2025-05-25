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
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';

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

function CustomTabBarButton(props) {
  const { accessibilityState, children, onPress } = props;
  const focused = accessibilityState?.selected;
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {children}
      {focused && <View style={styles.indicator} />}
    </TouchableOpacity>
  );
}

// ================== componentes do nosso app ==================

// ================== parte da agenda aqui ==================

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

  const filtrados = appointments.filter((item) => {
    return (
      (!filtroServico || item.service.toLowerCase().includes(filtroServico.toLowerCase())) &&
      (!filtroHorario || item.time.includes(filtroHorario))
    );
  });

  const pendentes = filtrados.filter((item) => item.status === 'pendente');
  const feitos = filtrados.filter((item) => item.status === 'feito');

  const renderItem = (item, index) => {
  const statusStyle = {
    color: item.status === 'pendente' ? 'orange' : '#ccc',
    fontWeight: 'bold',
  };

  return (
    <View
      style={{
        backgroundColor: '#222',
        marginBottom: 10,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#8A2BE2',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
          {item.name}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
          {item.service}
        </Text>
      </View>
      <Text style={{ color: '#ccc' }}>
  {item.time} - {item.date} - R$ {formatValue(item.value)}
</Text>

      <Text style={statusStyle}>{item.status}</Text>

      {item.status === 'pendente' && (
        <View style={{ flexDirection: 'row', marginTop: 5 }}>
          <TouchableOpacity
            onPress={() => marcarFeito(appointments.indexOf(item))}
            style={styles.smallButton}
          >
            <Text style={{ color: '#fff' }}>Feito</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => cancelarAgendamento(appointments.indexOf(item))}
            style={[styles.smallButton, { backgroundColor: 'red', marginLeft: 5 }]}
          >
            <Text style={{ color: '#fff' }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'feito' && (
        <View style={{ marginTop: 5 }}>
          <TouchableOpacity
  onPress={() => cancelarAgendamento(appointments.indexOf(item))}
  style={[styles.smallButton, { width: '30%', alignSelf: 'center', backgroundColor: 'red' }]}
>
  <Text style={{ color: '#fff' }}>Remover</Text>
</TouchableOpacity>

        </View>
      )}
    </View>
  );
};


  return (
    <SafeAreaView style={{ flex: 1, padding: 10, backgroundColor: '#000' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', padding: 10 }}>Agenda</Text>
      <TextInput
        placeholder="Filtrar por serviço"
        placeholderTextColor="#aaa"
        value={filtroServico}
        onChangeText={setFiltroServico}
        style={styles.input}
      />
      <TextInput
        placeholder="Filtrar por horário (ex: 15:00)"
        placeholderTextColor="#aaa"
        value={filtroHorario}
        onChangeText={setFiltroHorario}
        style={styles.input}
      />
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10, color: '#fff', padding: 10 }}>
        Pendentes
      </Text>
      <FlatList
        data={pendentes}
        keyExtractor={(item, index) => `pendente-${index}`}
        renderItem={({ item, index }) => renderItem(item, index)}
      />
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10, color: '#fff', padding: 10 }}>
        Feitos
      </Text>
      <FlatList
        data={feitos}
        keyExtractor={(item, index) => `feito-${index}`}
        renderItem={({ item, index }) => renderItem(item, index)}
      />
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
  if (etapa < 3) {
    setEtapa(etapa + 1);
  } else {
    const novoAgendamento = {
      name: rapidoNome,
      value: parseFloat(rapidoValor),
      date: rapidoData.toLocaleDateString(),
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

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: '#000' }}>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
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
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 }}>
        {['Progressiva', 'Corte de cabelo', 'Unha', 'Escova'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            onPress={() => iniciarServicoRapido(tipo)}
            style={{ width: '48%', backgroundColor: '#ccc', padding: 15, borderRadius: 8, marginVertical: 5 }}
          >
            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{tipo}</Text>
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
  );

      </ScrollView>
    </SafeAreaView>
  );
}

// ================== parte dos relatorios ==================

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
      .filter((a) => a.status === 'feito' && new Date(a.feitoEm) >= dataLimite)
      .reduce((acc, a) => acc + a.value, 0);
  };

  const totalHoje = appointments
    .filter((a) => a.status === 'feito' && isToday(a.feitoEm))
    .reduce((acc, a) => acc + a.value, 0);

  const mediaSemana = somarValores(7) / 7;
  const mediaMes = somarValores(30) / 30;

  const chartData = {
    labels: ['Dia', 'Sem', 'Mês'],
    datasets: [
      {
        data: [totalHoje, mediaSemana, mediaMes],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#000',
    backgroundGradientFrom: '#000',
    backgroundGradientTo: '#000',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(144,238,144, ${opacity})`, 
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: '#000' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.relatorioTitulo}>📊 Relatórios</Text>

      <View style={styles.card}>
        <Text style={styles.relatorioTexto}>
          💰 Total do dia: <Text style={styles.valor}>R$ {totalHoje.toFixed(2)}</Text>
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.relatorioTexto}>
          📅 Média da semana (7 dias): <Text style={styles.valor}>R$ {mediaSemana.toFixed(2)}</Text>
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.relatorioTexto}>
          🗓️ Média do mês (30 dias): <Text style={styles.valor}>R$ {mediaMes.toFixed(2)}</Text>
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================== parte do estoque ==================

function EstoqueScreen() {
  const [produtoNome, setProdutoNome] = useState('');
  const [produtoValor, setProdutoValor] = useState('');
  const [produtoCategoria, setProdutoCategoria] = useState('');
  const [produtoDataCompra, setProdutoDataCompra] = useState(new Date());
  const [mostrarDataCompra, setMostrarDataCompra] = useState(false);
  const [categoriaModalVisible, setCategoriaModalVisible] = useState(false);

  const [products, setProducts] = useState([]);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProdutoNome, setEditProdutoNome] = useState('');
  const [editProdutoValor, setEditProdutoValor] = useState('');
  const [editProdutoCategoria, setEditProdutoCategoria] = useState('');
  const [editCategoriaModalVisible, setEditCategoriaModalVisible] = useState(false);
  const [editProdutoDataCompra, setEditProdutoDataCompra] = useState(new Date());
  const [mostrarEditDataCompra, setMostrarEditDataCompra] = useState(false);

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

  const adicionarProduto = () => {
    if (!produtoNome.trim() || !produtoValor.trim() || !produtoCategoria.trim()) {
      Alert.alert('Preencha todos os campos');
      return;
    }
    const novoProduto = {
      id: Date.now().toString(),
      nome: produtoNome,
      valor: parseFloat(produtoValor),
      quantidade: 1, 
      dataCompra: produtoDataCompra.toLocaleDateString(),
      categoria: produtoCategoria,
      logs: [],
    };
    setProducts([...products, novoProduto]);
    setProdutoNome('');
    setProdutoValor('');
    setProdutoCategoria('');
    setProdutoDataCompra(new Date());
  };

  const incrementarQuantidade = (id) => {
    const updatedProducts = products.map((prod) =>
      prod.id === id ? { ...prod, quantidade: prod.quantidade + 1 } : prod
    );
    setProducts(updatedProducts);
  };

  const decrementarQuantidade = (id) => {
    const updatedProducts = products.map((prod) => {
      if (prod.id === id && prod.quantidade > 1) {
        return { ...prod, quantidade: prod.quantidade - 1 };
      }
      return prod;
    });
    setProducts(updatedProducts);
  };

  const removerProduto = (id) => {
    setProducts(products.filter((prod) => prod.id !== id));
  };

  const iniciarEdicao = (produto) => {
    setEditingProduct(produto);
    setEditProdutoNome(produto.nome);
    setEditProdutoValor(produto.valor.toString());
    setEditProdutoCategoria(produto.categoria);
    setEditProdutoDataCompra(new Date(produto.dataCompra));
    setEditModalVisible(true);
  };

  const confirmarEdicao = () => {
    if (!editProdutoNome.trim() || !editProdutoValor.trim() || !editProdutoCategoria.trim()) {
      Alert.alert('Preencha todos os campos');
      return;
    }
    const updatedProduct = {
      ...editingProduct,
      nome: editProdutoNome,
      valor: parseFloat(editProdutoValor),
      categoria: editProdutoCategoria,
      dataCompra: editProdutoDataCompra.toLocaleDateString(),
    };
    const logEntry = {
      timestamp: new Date().toLocaleString(),
      previousData: {
        nome: editingProduct.nome,
        valor: editingProduct.valor,
        categoria: editingProduct.categoria,
        dataCompra: editingProduct.dataCompra,
      },
    };
    updatedProduct.logs = [...(editingProduct.logs || []), logEntry];
    setProducts(
      products.map((prod) => (prod.id === updatedProduct.id ? updatedProduct : prod))
    );
    setEditModalVisible(false);
    setEditingProduct(null);
  };

  const totalGasto = products.reduce(
    (acc, prod) => acc + prod.valor * prod.quantidade,
    0
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.relatorioTitulo, { fontSize: 28, marginBottom: 20 }]}>
          Estoque
        </Text>
        <View style={{ marginBottom: 10 }}>
          <TextInput
            placeholder="Nome do Produto"
            placeholderTextColor="#aaa"
            value={produtoNome}
            onChangeText={setProdutoNome}
            style={styles.input}
          />
          <TextInput
            placeholder="Valor"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={produtoValor}
            onChangeText={(text) =>
              setProdutoValor(text.replace(/[^0-9.]/g, ''))
            }
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setCategoriaModalVisible(true)}
            style={styles.input}
          >
            <Text style={{ color: '#fff' }}>
              {produtoCategoria ? `Categoria: ${produtoCategoria}` : 'Selecione uma Categoria'}
            </Text>
          </TouchableOpacity>
          <Modal visible={categoriaModalVisible} transparent animationType="fade">
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#00000088',
              }}
            >
              <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
                  Selecione uma Categoria
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setProdutoCategoria('Cosméticos');
                    setCategoriaModalVisible(false);
                  }}
                  style={styles.button}
                >
                  <Text style={{ color: '#fff' }}>Cosméticos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setProdutoCategoria('Higiene');
                    setCategoriaModalVisible(false);
                  }}
                  style={styles.button}
                >
                  <Text style={{ color: '#fff' }}>Higiene</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setProdutoCategoria('Limpeza');
                    setCategoriaModalVisible(false);
                  }}
                  style={styles.button}
                >
                  <Text style={{ color: '#fff' }}>Limpeza</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <TouchableOpacity
            onPress={() => setMostrarDataCompra(true)}
            style={styles.input}
          >
            <Text style={{ color: "#fff" }}>
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
          <TouchableOpacity onPress={adicionarProduto} style={styles.button}>
            <Text style={{ color: '#fff' }}>Adicionar Produto</Text>
          </TouchableOpacity>
        </View>
  
        <View style={[styles.card, { marginTop: 10 }]}>
          <Text style={[styles.relatorioTexto, { textAlign: 'center' }]}>
            Total gasto com produtos: <Text style={styles.valor}>R$ {totalGasto.toFixed(2)}</Text>
          </Text>
        </View>
  
        {products.length > 0 && (
<FlatList
  data={products}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={[styles.card, { marginBottom: 8 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          {item.nome}
        </Text>
        <Text style={{ color: '#FFD700', fontSize: 14, fontWeight: 'bold' }}>
          {item.categoria}
        </Text>
      </View>
      <Text style={{ color: '#90EE90', fontSize: 14, fontWeight: 'bold' }}>
        Valor Unitário: R$ {item.valor.toFixed(2)}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
        <TouchableOpacity
          onPress={() => decrementarQuantidade(item.id)}
          style={[styles.smallButton, { backgroundColor: 'red', marginRight: 8 }]}
        >
          <Text style={{ color: '#fff' }}>-</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 14 }}>
          {item.quantidade}
        </Text>
        <TouchableOpacity
          onPress={() => incrementarQuantidade(item.id)}
          style={[styles.smallButton, { backgroundColor: 'green', marginLeft: 8 }]}
        >
          <Text style={{ color: '#fff' }}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: '#90EE90', fontSize: 14, fontWeight: 'bold' }}>
        Total: R$ {(item.valor * item.quantidade).toFixed(2)}
      </Text>
      <Text style={{ color: '#fff', fontSize: 14 }}>
        Data: {item.dataCompra}
      </Text>
      {item.logs && item.logs.length > 0 && (
        <Text style={{ color: 'gray', fontSize: 12, marginTop: 4 }}>
          Última alteração em: {item.logs[item.logs.length - 1].timestamp}
        </Text>
      )}
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <TouchableOpacity
          onPress={() => iniciarEdicao(item)}
          style={[styles.smallButton, { marginRight: 8 }]}
        >
          <Text style={{ color: '#fff' }}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => removerProduto(item.id)}
          style={styles.smallButton}
        >
          <Text style={{ color: '#fff' }}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  )}
/>

        )}
  
        <Modal visible={editModalVisible} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#00000088',
            }}
          >
            <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' }}>
              <TextInput
                placeholder="Nome"
                value={editProdutoNome}
                onChangeText={setEditProdutoNome}
                style={styles.input}
              />
              <TextInput
                placeholder="Valor"
                value={editProdutoValor}
                onChangeText={(text) =>
                  setEditProdutoValor(text.replace(/[^0-9.]/g, ''))
                }
                keyboardType="numeric"
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setEditCategoriaModalVisible(true)}
                style={styles.input}
              >
                <Text style={{ color: "#000" }}>
                  {editProdutoCategoria ? `Categoria: ${editProdutoCategoria}` : 'Selecione Categoria'}
                </Text>
              </TouchableOpacity>
              <Modal visible={editCategoriaModalVisible} transparent animationType="fade">
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#00000088',
                  }}
                >
                  <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
                      Selecione uma Categoria
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setEditProdutoCategoria('Cosméticos');
                        setEditCategoriaModalVisible(false);
                      }}
                      style={styles.button}
                    >
                      <Text style={{ color: '#fff' }}>Cosméticos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditProdutoCategoria('Higiene');
                        setEditCategoriaModalVisible(false);
                      }}
                      style={styles.button}
                    >
                      <Text style={{ color: '#fff' }}>Higiene</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditProdutoCategoria('Limpeza');
                        setEditCategoriaModalVisible(false);
                      }}
                      style={styles.button}
                    >
                      <Text style={{ color: '#fff' }}>Limpeza</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              <TouchableOpacity
                onPress={() => setMostrarEditDataCompra(true)}
                style={styles.input}
              >
                <Text style={{ color: "#000" }}>
                  Data da Compra: {editProdutoDataCompra.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {mostrarEditDataCompra && (
                <DateTimePicker
                  value={editProdutoDataCompra}
                  mode="date"
                  display="default"
                  onChange={(e, d) => {
                    setMostrarEditDataCompra(false);
                    if (d) setEditProdutoDataCompra(d);
                  }}
                />
              )}
              <TouchableOpacity onPress={confirmarEdicao} style={[styles.button, { marginTop: 20 }]}>
                <Text style={{ color: '#fff' }}>Salvar Alterações</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================== tela inicial ==================

function WelcomeScreen({ onLogin, appointments }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const windowWidth = Dimensions.get('window').width;

  const handleEntrar = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -windowWidth,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onLogin();
    });
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const agendamentosPendentes = appointments.filter((a) => a.status === 'pendente');
  const totalAgendamentos = agendamentosPendentes.length;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX }] }}>
      <View style={styles.welcomeContainer}>
        <View style={styles.backgroundContainer}>
          <Image
            source={require('./assets/logoinicial.png')}
            style={styles.backgroundImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.dateText}>Hoje é {today}</Text>
          <Text style={styles.welcomeText}>Seja bem-vinda novamente!</Text>
          <AnimatedButton onPress={handleEntrar}>Entrar</AnimatedButton>
          <Text style={styles.agendamentosText}>
            Você tem {totalAgendamentos} agendamento{totalAgendamentos !== 1 ? 's' : ''} pendente
            {totalAgendamentos !== 1 ? 's' : ''}.
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ================== parte dos estilos ==================

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#000',
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
  },
  welcomeText: {
    color: '#f0f0f0',
    fontSize: 24 * scaleFactor,
    fontWeight: 'bold',
    marginBottom: 20 * scaleFactor,
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
        <Tab.Navigator
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
            tabBarButton: (props) => <CustomTabBarButton {...props} />,
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
          <Tab.Screen name="Estoque" component={EstoqueScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}